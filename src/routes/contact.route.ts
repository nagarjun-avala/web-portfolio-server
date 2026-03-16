import { Router } from "express";
import contactCtrl from "@/controllers/contact.ctrl";
import { strictLimiter } from "@/middleware/rateLimiter";
const router = Router();

// Admin
router.post("/", strictLimiter, contactCtrl.sendMessage);

export default router;
