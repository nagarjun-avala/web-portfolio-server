import { Request, Response, NextFunction } from "express";
import { redis } from "@/lib/redis";
import logger from "@/utils/logger";

// ---------------------------------------------------------------------------
// Redis-backed cache middleware
//
// Usage:
//   router.get("/", redisCache(300), handler)   // 300 = TTL in seconds
//
// Cache key: method + full URL (e.g. "GET:/api/portfolio")
// On MISS: passes to next(), intercepts res.json(), stores result in Redis
// On HIT:  returns cached JSON response immediately (no DB queries)
// On REDIS DOWN: passes through to handler as if uncached (graceful degrade)
// ---------------------------------------------------------------------------

export const PORTFOLIO_CACHE_KEY = "portfolio:data";
const DEFAULT_TTL = 300; // 5 minutes

export function redisCache(ttl = DEFAULT_TTL) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET" || !redis) {
      return next();
    }

    const key = `cache:${req.method}:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        // Cache HIT — return immediately, no DB touched
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");
        return res.send(cached);
      }
    } catch (err) {
      // Redis read error — fall through to handler
      logger.warn("[Redis] Cache read error:", { err: (err as Error).message });
    }

    // Cache MISS — intercept res.json to store result
    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && redis) {
        const serialized = JSON.stringify(body);
        redis
          .setex(key, ttl, serialized)
          .catch((err: Error) =>
            logger.warn("[Redis] Cache write error:", { err: err.message }),
          );
      }
      return originalJson(body);
    };

    next();
  };
}

// ---------------------------------------------------------------------------
// clearRedisCache — call on any mutation (PATCH/POST/PUT/DELETE)
// Clears all keys matching the pattern so stale data isn't served
// ---------------------------------------------------------------------------
export async function clearRedisCache(pattern = "cache:GET:/api/portfolio*") {
  if (!redis) return;
  try {
    // SCAN is non-blocking unlike KEYS — safe in production
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`[Redis] Cleared ${keys.length} cache key(s)`);
      }
    } while (cursor !== "0");
  } catch (err) {
    logger.warn("[Redis] Cache clear error:", { err: (err as Error).message });
  }
}

// Legacy in-memory clear shim — kept so existing route imports don't break
export const clearCache = clearRedisCache;
