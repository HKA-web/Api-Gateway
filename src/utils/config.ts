import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";
import RedisConstructor, { Redis as RedisType } from "ioredis"; // RedisConstructor untuk new, RedisType untuk typing

const filePath = path.join(__dirname, "..", "..", "config.yaml");
const file = fs.readFileSync(filePath, "utf8");
const parsed = yaml.load(file);

// semua key string, semua value bebas
const ConfigSchema = z.record(z.string(), z.any());
const config = ConfigSchema.parse(parsed);

// Inisialisasi Redis (terpusat)
let redisClient: RedisType | null = null; // pakai type RedisType
if (config.redis) {
  redisClient = new RedisConstructor({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    db: config.redis.db || 0
  });

  redisClient.on("connect", () => console.log("Redis connected"));
  redisClient.on("error", (err: Error) => console.error("Redis error:", err)); // beri type Error
}

export { config, redisClient };
