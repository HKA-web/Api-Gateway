import { config, redisClient } from "./config";
const msgpack = require("msgpack-lite");
const pako = require("pako");

/**
 * Generate key untuk cache
 */
export function getCacheKey(sql: string, skip: number, take: number, dbType: string) {
  return `querycache:${dbType}:${Buffer.from(sql).toString("base64")}:${skip}:${take}`;
}

/**
 * Set object ke Redis (encode + compress)
 */
export async function setCache(key: string, data: any, useRedis: boolean) {
  if (!useRedis || !redisClient) return;

  const encoded = msgpack.encode(data);             // encode object
  const compressed = Buffer.from(pako.deflate(encoded)); // compress ke buffer
  await (redisClient as any).set(key, compressed, "EX", config.redis.ttl);

  console.log(`[Redis SET] Key: ${key}, TTL: ${config.redis.ttl}s`);
}

/**
 * Ambil object dari Redis (decompress + decode)
 */
export async function tryGetCache(key: string, useRedis: boolean) {
  if (!useRedis || !redisClient) return null;

  const cachedBuffer = await redisClient.getBuffer(key);
  if (cachedBuffer) {
    const decompressed = Buffer.from(pako.inflate(cachedBuffer));
    const parsed = msgpack.decode(decompressed);
    console.log(`[Redis HIT] Key: ${key}`);
    return parsed;
  }

  console.log(`[Redis MISS] Key: ${key}`);
  return null;
}
