const { parseId } = require("../lib/helper");
const { Portfolio } = require("../models/portfolio.model");
const SEED_DATA = require("../seed.json");

const PortfolioController = {
  getPortfolioData: async (req, res) => {
    try {
      let data = await Portfolio.findOne();

      if (!data) {
        console.log("⚠️ Database empty. Seeding initial data...");
        data = await Portfolio.create(SEED_DATA);
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Fetch Error:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  createPortfolioSection: async (req, res) => {
    try {
      const { section } = req.params;
      const allowedSections = [
        "projects",
        "experience",
        "education",
        "certifications",
        "blogs",
      ];

      if (!allowedSections.includes(section)) {
        return res.status(400).json({
          success: false,
          message: `Invalid section. Allowed: ${allowedSections.join(", ")}`,
        });
      }

      // Add ID if missing
      const newItem = { ...req.body };
      if (!newItem.id) newItem.id = Date.now(); // Simple ID generation

      const updated = await Portfolio.findOneAndUpdate(
        {},
        { $push: { [section]: newItem } },
        { new: true }
      );

      res.json({
        success: true,
        message: `Item added to ${section}`,
        data: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateSpecificSectionItem: async (req, res) => {
    try {
      const { section, id } = req.params;
      const parsedId = parseId(id); // Handle string vs number IDs

      // We use the positional operator $ to update the specific item in the array
      const updated = await Portfolio.findOneAndUpdate(
        { [`${section}.id`]: parsedId },
        { $set: { [`${section}.$`]: { ...req.body, id: parsedId } } }, // Preserve ID
        { new: true }
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found in portfolio" });
      }

      res.json({
        success: true,
        message: `Item updated in ${section}`,
        data: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteSpecificSectionItem: async (req, res) => {
    try {
      const { section, id } = req.params;
      const parsedId = parseId(id);

      const updated = await Portfolio.findOneAndUpdate(
        {},
        { $pull: { [section]: { id: parsedId } } },
        { new: true }
      );

      res.json({
        success: true,
        message: `Item deleted from ${section}`,
        data: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteEntirePortfolio: async (req, res) => {
    try {
      await Portfolio.deleteMany({});
      res.json({
        success: true,
        message: "Portfolio data deleted completely.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Partial Update Portfolio
   */
  updatePatch: async (req, res) => {
    try {
      const updated = await Portfolio.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, upsert: true }
      );

      return res.status(201).json({
        success: true,
        message: "Portfolio patched successfully",
        data: updated,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = PortfolioController;
