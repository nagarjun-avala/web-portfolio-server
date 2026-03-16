import { Router, Request, Response, NextFunction } from "express";
import portfolioCtrl from "@/controllers/portfolio.ctrl";
import asyncHandler from "@/utils/asyncHandler";
import { verifyToken } from "@/middleware/auth";
const router = Router();

import { cacheMiddleware } from "@/middleware/cacheMiddleware";

// GET /api/portfolio (Aggregated Response)
router.get(
  "/",
  cacheMiddleware("10 minutes"),
  asyncHandler(portfolioCtrl.getPortfolioData),
);

// GET /api/portfolio/projects/:slug
router.get(
  "/projects/:slug",
  cacheMiddleware("10 minutes"),
  asyncHandler(portfolioCtrl.getProjectBySlug),
);

// GET /api/portfolio/blogs/:id
router.get(
  "/blogs/:id",
  cacheMiddleware("10 minutes"),
  asyncHandler(portfolioCtrl.getBlogById),
);

// Helper for invalidating cache
import { clearCache } from "@/middleware/cacheMiddleware";
const invalidatePortfolioCache = (_req: Request, _res: Response, next: NextFunction) => {
  // Clear the ENTIRE cache on any mutation (since they are rare)
  // This guarantees dynamic slug-based routes (e.g. /projects/:slug) aren't serving stale data.
  clearCache();
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
