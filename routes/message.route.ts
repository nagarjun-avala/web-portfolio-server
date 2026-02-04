import { Router } from "express";
import messageCtrl from "@/controllers/message.ctrl";
import { verifyToken } from "@/middleware/auth";
const router = Router();

// Admin
router.get("/", verifyToken, messageCtrl.getMessages);
// Status & Bulk
router.patch("/:id/status", verifyToken, messageCtrl.updateMessageStatus);
router.post("/bulk-delete", verifyToken, messageCtrl.bulkDeleteMessages);
router.post("/bulk-status", verifyToken, messageCtrl.bulkUpdateStatus);

router.delete("/:id", verifyToken, messageCtrl.deleteMessage);

export default router;
