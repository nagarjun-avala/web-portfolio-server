const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    name: String,
    meta: Object,
    hero: Object,
    about: Object,
    techStack: Object,
    education: Array,
    certifications: Array,
    projects: Array,
    experience: Array,
    blogs: Array,
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);

module.exports = { Portfolio };
