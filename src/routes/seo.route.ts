import { Router } from "express";
import seoCtrl from "@/controllers/seo.ctrl";
import asyncHandler from "@/utils/asyncHandler";
import { verifyToken } from "@/middleware/auth";

const router = Router();

// GET /api/seo-settings (Fetch current SEO settings)
router.get("/", asyncHandler(seoCtrl.getSeoSettings));

// PATCH /api/seo-settings (Update SEO settings)
router.patch("/", verifyToken, asyncHandler(seoCtrl.updateSeoSettings));

// POST /api/seo-settings/reset (Reset to defaults)
router.post("/reset", verifyToken, asyncHandler(seoCtrl.resetSeoSettings));

export default router;
