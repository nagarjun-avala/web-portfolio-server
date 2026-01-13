const { requireAdmin } = require("../middleware/admin.middle");

const { Router } = require("express");
const PortfolioController = require("../controllers/portfolio.ctrl");
const router = Router();

// Mount routes
router.get("/", PortfolioController.getPortfolioData);

// Admin
router.post(
  "/item/:section",
  requireAdmin,
  PortfolioController.createPortfolioSection
);
router.post(
  "item/:section/:id",
  requireAdmin,
  PortfolioController.updateSpecificSectionItem
);
router.patch("/", requireAdmin, PortfolioController.updatePatch);
router.delete(
  "/item/:section/:id",
  requireAdmin,
  PortfolioController.updatePatch
);
router.delete("/", requireAdmin, PortfolioController.deleteEntirePortfolio);

module.exports = router;
