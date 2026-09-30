import Redis from "ioredis";
import { config } from "@/config";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(config.redis.url, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

if (config.env !== "production") {
  globalForRedis.redis = redis;
}

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

export default redis;
