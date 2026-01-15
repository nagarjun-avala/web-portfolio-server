const { parseId, seedIfNeeded } = require("../lib/helper");
const {
  Project,
  Experience,
  Education,
  Certification,
  Blog,
} = require("../models/collections.model");
const { Profile } = require("../models/profile.model");

const PortfolioController = {
  getPortfolioData: async (req, res) => {
    try {
      // Parallel fetch for performance
      const [profile, projects, experience, education, certifications, blogs] =
        await Promise.all([
          Profile.findOne(),
          Project.find().sort({ order: 1, _id: -1 }),
          Experience.find().sort({ start: -1 }),
          Education.find().sort({ year: -1 }),
          Certification.find().sort({ issueDate: -1 }),
          Blog.find().sort({ date: -1 }),
        ]);

      if (!profile) {
        await seedIfNeeded();
        return res
          .status(404)
          .json({ success: false, message: "Profile not initialized" });
      }

      // Construct the legacy JSON structure expected by frontend
      const responseData = {
        ...profile.toObject(),
        projects,
        experience,
        education,
        certifications,
        blogs,
      };

      res.json({ success: true, data: responseData });
    } catch (error) {
      console.error("Fetch Error:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  },

  createPortfolioSection: async (req, res) => async (req, res) => {
    try {
      const Model = getModelBySection(req.params.section);
      if (!Model)
        return res
          .status(400)
          .json({ success: false, message: "Invalid section" });

      const newItem = new Model(req.body);
      // Ensure ID exists (frontend usually provides Date.now(), if not generate one)
      if (!newItem.id) newItem.id = new mongoose.Types.ObjectId().toString();

      await newItem.save();

      // Return the FULL updated list to keep frontend state sync easy
      // Alternatively, return just the new item and let frontend handle it.
      // Current frontend expects the full updated list for that section in the 'data' key relative to the whole portfolio?
      // Looking at previous admin_dashboard, it sets data(resData.data).
      // Wait, the previous server returned the *entire* portfolio object on every update.
      // To maintain compatibility without rewriting frontend state logic:
      // We must return the *entire* portfolio structure or specific section list?
      // The previous code: `res.json({ ..., data: updated });` where `updated` was the whole portfolio doc.
      // So we need to re-fetch the whole portfolio structure or fix the frontend.
      // For "optimization", re-fetching everything is bad.
      // BUT, to keep compatibility with the provided frontend code:

      // OPTIMIZED APPROACH:
      // We will return the *updated list* for that section only if possible,
      // BUT the frontend `setPortfolioData(data.data)` expects the full object.
      // Let's re-fetch only what's needed or re-construct.
      // Ideally, we fetch everything again to ensure sync.

      // Re-fetch all (Trade-off for compatibility)
      const [profile, projects, experience, education, certifications, blogs] =
        await Promise.all([
          Profile.findOne(),
          Project.find(),
          Experience.find(),
          Education.find(),
          Certification.find(),
          Blog.find(),
        ]);

      const responseData = {
        ...profile.toObject(),
        projects,
        experience,
        education,
        certifications,
        blogs,
      };

      res.json({ success: true, message: "Item added", data: responseData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateSpecificSectionItem: async (req, res) => {
    try {
      const Model = getModelBySection(req.params.section);
      if (!Model)
        return res
          .status(400)
          .json({ success: false, message: "Invalid section" });

      // Use custom 'id' field, not _id
      await Model.findOneAndUpdate({ id: req.params.id }, req.body);

      // Re-fetch aggregate (Compatibility)
      // In a pure specialized API, we'd just return the updated item.
      const [profile, projects, experience, education, certifications, blogs] =
        await Promise.all([
          Profile.findOne(),
          Project.find(),
          Experience.find(),
          Education.find(),
          Certification.find(),
          Blog.find(),
        ]);

      const responseData = {
        ...profile.toObject(),
        projects,
        experience,
        education,
        certifications,
        blogs,
      };

      res.json({ success: true, message: "Item updated", data: responseData });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteSpecificSectionItemId: async (req, res) => {
    try {
      const Model = getModelBySection(req.params.section);
      if (!Model)
        return res
          .status(400)
          .json({ success: false, message: "Invalid section" });

      await Model.findOneAndDelete({ id: req.params.id });

      // Re-fetch aggregate
      const [profile, projects, experience, education, certifications, blogs] =
        await Promise.all([
          Profile.findOne(),
          Project.find(),
          Experience.find(),
          Education.find(),
          Certification.find(),
          Blog.find(),
        ]);

      const responseData = {
        ...profile.toObject(),
        projects,
        experience,
        education,
        certifications,
        blogs,
      };

      res.json({ success: true, message: "Item deleted", data: responseData });
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
      // We only update the fields present in req.body.hero, req.body.about, etc.
      // Since profile is flat fields + nested objects, we use dot notation for deep updates if needed,
      // or simply findOneAndUpdate with $set.

      // Note: The frontend sends { hero: {...} } or { about: {...} } or { techStack: {...} }
      // Mongoose updateOne with shallow merge is usually strictly replacing the object.
      // For deep merge, we might need a utility, but standard $set works for top-level keys provided.

      const updated = await Profile.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.json({ success: true, message: "Profile updated", data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = PortfolioController;
