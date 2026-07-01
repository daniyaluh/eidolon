import Redis from "ioredis";
import { env } from "./env";

export const redis = env.redisUrl
  ? new Redis(env.redisUrl, { maxRetriesPerRequest: 2, lazyConnect: true })
  : null;

if (redis) {
  redis.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });
}
