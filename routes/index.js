const { Router } = require("express");
const portfolioRoutes = require("./portfolio.route");
const messageRoutes = require("./message.route");
const contactRoutes = require("./contact.route");

const router = Router();

// Mount routes
router.use("/portfolio", portfolioRoutes);
router.use("/messages", messageRoutes);
router.use("/contact", contactRoutes);

module.exports = router;
