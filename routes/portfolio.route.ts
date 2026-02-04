import { Router } from "express";
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
router.get("/projects/:slug", asyncHandler(portfolioCtrl.getProjectBySlug));

// GET /api/portfolio/blogs/:id
router.get("/blogs/:id", asyncHandler(portfolioCtrl.getBlogById));

// PATCH /api/portfolio (Update Profile/Singleton)
router.patch("/", verifyToken, portfolioCtrl.updatePatch);

// POST /api/portfolio/item/:section (Create Item)
router.post(
  "/item/:section",
  verifyToken,
  portfolioCtrl.createPortfolioSection,
);

// PUT /api/portfolio/item/:section/:id (Update Item)
router.put(
  "item/:section/:id",
  verifyToken,
  portfolioCtrl.updateSpecificSectionItem,
);

// DELETE /api/portfolio/item/:section/:id (Delete Item)
// POST /api/portfolio/restore (Full Restore from Backup)
router.post("/restore", verifyToken, portfolioCtrl.restorePortfolio);

router.delete(
  "/item/:section/:id",
  verifyToken,
  portfolioCtrl.deleteSpecificSectionItemId,
);
router.delete("/", verifyToken, portfolioCtrl.deleteEntirePortfolio);

export default router;
