const { requireAdmin } = require("../middleware/admin.middle");

const { Router } = require("express");
const PortfolioController = require("../controllers/portfolio.ctrl");
const asyncHandler = require("../utils/asyncHandler");
const router = Router();

// GET /api/portfolio (Aggregated Response)
router.get("/", asyncHandler(PortfolioController.getPortfolioData));

// PATCH /api/portfolio (Update Profile/Singleton)
router.patch("/", requireAdmin, PortfolioController.updatePatch);

// POST /api/portfolio/item/:section (Create Item)
router.post(
  "/item/:section",
  requireAdmin,
  PortfolioController.createPortfolioSection
);

// PUT /api/portfolio/item/:section/:id (Update Item)
router.put(
  "item/:section/:id",
  requireAdmin,
  PortfolioController.updateSpecificSectionItem
);

// DELETE /api/portfolio/item/:section/:id (Delete Item)
router.delete(
  "/item/:section/:id",
  requireAdmin,
  PortfolioController.deleteSpecificSectionItemId
);
router.delete("/", requireAdmin, PortfolioController.deleteEntirePortfolio);

module.exports = router;
