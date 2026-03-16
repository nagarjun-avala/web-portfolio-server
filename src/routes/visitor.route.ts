import { Router } from "express";
import asyncHandler from "@/utils/asyncHandler";
import { verifyToken } from "@/middleware/auth";
import visitorCtrl from "@/controllers/visitor.ctrl";
import rateLimit from "express-rate-limit";

const router = Router();

// Light rate limiter for the public log endpoint (prevents flood from bots)
const visitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests" },
});

// POST /api/visitors — public, records a single visit
router.post("/", visitLimiter, asyncHandler(visitorCtrl.logVisit));

// GET /api/visitors/stats — protected, aggregated analytics
router.get("/stats", verifyToken, asyncHandler(visitorCtrl.getStats));

// GET /api/visitors — protected, paginated log list
router.get("/", verifyToken, asyncHandler(visitorCtrl.getLogs));

export default router;
