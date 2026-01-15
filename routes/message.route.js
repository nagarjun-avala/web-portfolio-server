const { Router } = require("express");
const MessageController = require("../controllers/message.ctrl");
const { requireAdmin } = require("../middleware/admin.middle");
const router = Router();

// Admin
router.get("/", requireAdmin, MessageController.getMessages);
router.delete("/:id", requireAdmin, MessageController.deleteMessage);

module.exports = router;
