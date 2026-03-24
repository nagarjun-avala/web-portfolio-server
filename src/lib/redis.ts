import Redis from "ioredis";
import logger from "@/utils/logger";

// ---------------------------------------------------------------------------
// Redis client singleton
// Connects to REDIS_URL (e.g. redis://redis:6379 in Docker, or localhost:6379 in dev)
// Gracefully degrades: if Redis is unavailable the rest of the app still works.
// ---------------------------------------------------------------------------

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

let redis: Redis | null = null;

function createRedisClient(): Redis | null {
  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1, // Fail fast if Redis is down — don't block requests
      enableReadyCheck: true,
      lazyConnect: false,
      connectTimeout: 2000, // 2s timeout; don't hold up the app
    });

    client.on("connect", () => logger.info("[Redis] Connected"));
    client.on("error", (err) => {
      // Log but DON'T crash — Redis is a cache, not a critical dependency
      logger.warn("[Redis] Connection error (cache disabled):", {
        err: err.message,
      });
    });

    return client;
  } catch (err) {
    logger.warn("[Redis] Failed to initialise (cache disabled):", { err });
    return null;
  }
}

redis = createRedisClient();

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export { redis };
export default redis;
