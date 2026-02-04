import { Router } from "express";
import seoCtrl from "@/controllers/seo.ctrl";
import asyncHandler from "@/utils/asyncHandler";
import { requireAdmin } from '@/middleware/admin';

const router = Router();

// GET /api/seo-settings (Fetch current SEO settings)
router.get("/", asyncHandler(seoCtrl.getSeoSettings));

// PATCH /api/seo-settings (Update SEO settings)
router.patch("/", requireAdmin, asyncHandler(seoCtrl.updateSeoSettings));

// POST /api/seo-settings/reset (Reset to defaults)
router.post("/reset", requireAdmin, asyncHandler(seoCtrl.resetSeoSettings));

export default router;
