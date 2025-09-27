"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheKey = getCacheKey;
exports.setCache = setCache;
exports.tryGetCache = tryGetCache;
const config_1 = require("./config");
const msgpack = require("msgpack-lite");
const pako = require("pako");
/**
 * Generate key untuk cache
 */
function getCacheKey(sql, skip, take, dbType) {
    return `querycache:${dbType}:${Buffer.from(sql).toString("base64")}:${skip}:${take}`;
}
/**
 * Set object ke Redis (encode + compress)
 */
async function setCache(key, data, useRedis) {
    if (!useRedis || !config_1.redisClient)
        return;
    const encoded = msgpack.encode(data); // encode object
    const compressed = Buffer.from(pako.deflate(encoded)); // compress ke buffer
    await config_1.redisClient.set(key, compressed, "EX", config_1.config.redis.ttl);
    console.log(`[Redis SET] Key: ${key}, TTL: ${config_1.config.redis.ttl}s`);
}
/**
 * Ambil object dari Redis (decompress + decode)
 */
async function tryGetCache(key, useRedis) {
    if (!useRedis || !config_1.redisClient)
        return null;
    const cachedBuffer = await config_1.redisClient.getBuffer(key);
    if (cachedBuffer) {
        const decompressed = Buffer.from(pako.inflate(cachedBuffer));
        const parsed = msgpack.decode(decompressed);
        console.log(`[Redis HIT] Key: ${key}`);
        return parsed;
    }
    console.log(`[Redis MISS] Key: ${key}`);
    return null;
}
