import { Router, Request, Response, NextFunction } from "express";
import portfolioCtrl from "@/controllers/portfolio.ctrl";
import asyncHandler from "@/utils/asyncHandler";
import { verifyToken } from "@/middleware/auth";
const router = Router();

import { redisCache, clearRedisCache } from "@/middleware/cacheMiddleware";

// GET /api/portfolio (Aggregated Response) — cached 5 min in Redis
router.get("/", redisCache(300), asyncHandler(portfolioCtrl.getPortfolioData));

// GET /api/portfolio/projects/:slug
router.get(
  "/projects/:slug",
  redisCache(300),
  asyncHandler(portfolioCtrl.getProjectBySlug),
);

// GET /api/portfolio/blogs/:id
router.get(
  "/blogs/:id",
  redisCache(300),
  asyncHandler(portfolioCtrl.getBlogById),
);

// Helper for invalidating cache on any mutation
const invalidatePortfolioCache = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Fire-and-forget: clear all /api/portfolio* cache keys in Redis
  clearRedisCache().catch(() => {
    /* already logged inside */
  });
  next();
};

// PATCH /api/portfolio (Update Profile/Singleton)
router.patch(
  "/",
  verifyToken,
  invalidatePortfolioCache,
  portfolioCtrl.updatePatch,
);

// POST /api/portfolio/item/:section (Create Item)
router.post(
  "/item/:section",
  verifyToken,
  invalidatePortfolioCache,
  portfolioCtrl.createPortfolioSection,
);

// PUT /api/portfolio/item/:section/:id (Update Item)
router.put(
  "item/:section/:id",
  verifyToken,
  invalidatePortfolioCache,
  portfolioCtrl.updateSpecificSectionItem,
);

// DELETE /api/portfolio/item/:section/:id (Delete Item)
// POST /api/portfolio/restore (Full Restore from Backup)
router.post(
  "/restore",
  verifyToken,
  invalidatePortfolioCache,
  portfolioCtrl.restorePortfolio,
);

router.delete(
  "/item/:section/:id",
  verifyToken,
  invalidatePortfolioCache,
  portfolioCtrl.deleteSpecificSectionItemId,
);
router.delete(
  "/",
  verifyToken,
  invalidatePortfolioCache,
  portfolioCtrl.deleteEntirePortfolio,
);

export default router;
