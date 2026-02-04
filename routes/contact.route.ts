import { Router } from "express";
import contactCtrl from "@/controllers/contact.ctrl";
const router = Router();

// Admin
router.post("/", contactCtrl.sendMessage);

export default router;
