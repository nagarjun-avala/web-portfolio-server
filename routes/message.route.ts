import { Router } from "express";
import messageCtrl from "@/controllers/message.ctrl";
import { requireAdmin } from "@/middleware/admin";
const router = Router();

// Admin
router.get("/", requireAdmin, messageCtrl.getMessages);
// Status & Bulk
router.patch("/:id/status", requireAdmin, messageCtrl.updateMessageStatus);
router.post("/bulk-delete", requireAdmin, messageCtrl.bulkDeleteMessages);
router.post("/bulk-status", requireAdmin, messageCtrl.bulkUpdateStatus);

router.delete("/:id", requireAdmin, messageCtrl.deleteMessage);

export default router;
