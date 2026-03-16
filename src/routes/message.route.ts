import { Router } from "express";
import messageCtrl from "@/controllers/message.ctrl";
import { verifyToken } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import {
  updateMessageStatusSchema,
  bulkDeleteMessagesSchema,
  bulkUpdateStatusSchema,
  deleteMessageSchema,
} from "@/utils/schemas";

const router = Router();

// Admin
router.get("/", verifyToken, messageCtrl.getMessages);
// Status & Bulk
router.patch(
  "/:id/status",
  verifyToken,
  validate(updateMessageStatusSchema),
  messageCtrl.updateMessageStatus,
);
router.post(
  "/bulk-delete",
  verifyToken,
  validate(bulkDeleteMessagesSchema),
  messageCtrl.bulkDeleteMessages,
);
router.post(
  "/bulk-status",
  verifyToken,
  validate(bulkUpdateStatusSchema),
  messageCtrl.bulkUpdateStatus,
);

router.delete(
  "/:id",
  verifyToken,
  validate(deleteMessageSchema),
  messageCtrl.deleteMessage,
);

export default router;
