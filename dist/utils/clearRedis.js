"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
async function clearKey(key) {
    if (!config_1.redisClient)
        throw new Error("Redis client not initialized");
    await config_1.redisClient.del(key);
    console.log(`Deleted key: ${key}`);
}
async function clearByPattern(pattern = "*") {
    if (!config_1.redisClient)
        throw new Error("Redis client not initialized");
    let cursor = "0";
    do {
        const [nextCursor, keys] = await config_1.redisClient.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
            await config_1.redisClient.del(...keys);
            console.log(`Deleted keys: ${keys.join(", ")}`);
        }
    } while (cursor !== "0");
    console.log(`All keys matching '${pattern}' cleared`);
}
async function clearAll() {
    if (!config_1.redisClient)
        throw new Error("Redis client not initialized");
    await config_1.redisClient.flushdb();
    console.log("All keys cleared (FLUSHDB)");
}
// === CLI mode ===
const mode = process.argv[2];
const arg = process.argv[3];
(async () => {
    try {
        if (mode === "all") {
            await clearAll();
        }
        else if (mode === "pattern") {
            await clearByPattern(arg || "*");
        }
        else if (mode === "key") {
            if (!arg)
                throw new Error("Please provide a key to delete");
            await clearKey(arg);
        }
        else {
            console.log("Usage:");
            console.log("  ts-node src/utils/clearRedis.ts all");
            console.log("  ts-node src/utils/clearRedis.ts pattern querycache:mssql:*");
            console.log("  ts-node src/utils/clearRedis.ts key mykey");
        }
    }
    catch (err) {
        console.error("Error:", err.message);
    }
    finally {
        config_1.redisClient?.quit();
    }
})();
