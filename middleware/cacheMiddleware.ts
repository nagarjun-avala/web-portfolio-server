import apicache from "apicache";
import { Request, Response } from "express";

const cache = apicache.middleware;

// Configure cache to only cache successful responses
// and potentially add other options
export const cacheMiddleware = (duration = "5 minutes") => {
  return cache(duration, (req: Request, res: Response) => {
    return res.statusCode === 200;
  });
};
