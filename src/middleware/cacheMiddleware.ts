import apicache from "apicache";
import { Request, Response } from "express";

export const cache = apicache.middleware;
export const clearCache = (target?: string) => apicache.clear(target);

// Configure cache to only cache successful responses
// and potentially add other options
export const cacheMiddleware = (duration = "5 minutes") => {
  return cache(duration, (req: Request, res: Response) => {
    return res.statusCode === 200;
  });
};
