const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Nagarjun Avala" },
    meta: {
      title: String,
      email: String,
      phone: String,
    },
    hero: {
      badge: String,
      roles: [String],
      titlePrefix: String,
      titleSuffix: String,
      description: String,
      ctaPrimary: String,
      ctaSecondary: String,
    },
    about: {
      title: String,
      description: String,
      image: String,
      experience: { years: String, label: String },
      skills: [String],
    },
    techStack: {
      type: Map,
      of: [String], // Flexible map for Languages, Frontend, etc.
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = { Profile };
