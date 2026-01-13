const { Router } = require("express");
const ContactController = require("../controllers/contact.ctrl");
const router = Router();

// Admin
router.post("/", ContactController.sendMessage);

module.exports = router;
