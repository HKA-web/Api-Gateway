"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const zod_1 = require("zod");
const ioredis_1 = __importDefault(require("ioredis")); // RedisConstructor untuk new, RedisType untuk typing
const filePath = path_1.default.join(__dirname, "..", "..", "config.yaml");
const file = fs_1.default.readFileSync(filePath, "utf8");
const parsed = js_yaml_1.default.load(file);
// semua key string, semua value bebas
const ConfigSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.any());
const config = ConfigSchema.parse(parsed);
exports.config = config;
// Inisialisasi Redis (terpusat)
let redisClient = null; // pakai type RedisType
exports.redisClient = redisClient;
if (config.redis) {
    exports.redisClient = redisClient = new ioredis_1.default({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db || 0
    });
    redisClient.on("connect", () => console.log("Redis connected"));
    redisClient.on("error", (err) => console.error("Redis error:", err)); // beri type Error
}
