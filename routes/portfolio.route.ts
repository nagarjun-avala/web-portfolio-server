import { Router } from "express";
import portfolioCtrl from "@/controllers/portfolio.ctrl";
import asyncHandler from "@/utils/asyncHandler";
import { requireAdmin } from '@/middleware/admin';
const router = Router();

import { cacheMiddleware } from "@/middleware/cacheMiddleware";

// GET /api/portfolio (Aggregated Response)
router.get("/", cacheMiddleware("10 minutes"), asyncHandler(portfolioCtrl.getPortfolioData));

// GET /api/portfolio/projects/:slug
router.get("/projects/:slug", asyncHandler(portfolioCtrl.getProjectBySlug));

// GET /api/portfolio/blogs/:id
router.get("/blogs/:id", asyncHandler(portfolioCtrl.getBlogById));

// PATCH /api/portfolio (Update Profile/Singleton)
router.patch("/", requireAdmin, portfolioCtrl.updatePatch);

// POST /api/portfolio/item/:section (Create Item)
router.post("/item/:section", requireAdmin, portfolioCtrl.createPortfolioSection);

// PUT /api/portfolio/item/:section/:id (Update Item)
router.put("item/:section/:id", requireAdmin, portfolioCtrl.updateSpecificSectionItem);

// DELETE /api/portfolio/item/:section/:id (Delete Item)
// POST /api/portfolio/restore (Full Restore from Backup)
router.post("/restore", requireAdmin, portfolioCtrl.restorePortfolio);

router.delete("/item/:section/:id", requireAdmin, portfolioCtrl.deleteSpecificSectionItemId);
router.delete("/", requireAdmin, portfolioCtrl.deleteEntirePortfolio);

export default router;
