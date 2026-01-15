const { Profile } = require("../models/profile.model");

const parseId = (id) => {
  const num = parseInt(id, 10);
  return isNaN(num) ? id : num; // Returns number if valid integer, else string
};

const getModelBySection = (section) => {
  switch (section) {
    case "projects":
      return Project;
    case "experience":
      return Experience;
    case "education":
      return Education;
    case "certifications":
      return Certification;
    case "blogs":
      return Blog;
    default:
      return null;
  }
};

// Initial Seeder (Check for profile)
const seedIfNeeded = async () => {
  const count = await Profile.countDocuments();
  if (count === 0) {
    console.log("🌱 Seeding initial database...");
    // Seed logic with mock data can be placed here
    const newProfile = new Profile({
      name: "Nagarjun Avala",
      meta: {
        title: "Nagarjun | Dev",
        email: "contact@test.com",
        phone: "+1234567890",
      },
      hero: {
        titlePrefix: "I am a",
        roles: ["Developer"],
        description: "Welcome to my portfolio.",
      },
      about: {
        title: "About Me",
        description: "I build things.",
        experience: { years: "2+", label: "Years" },
        skills: ["React", "Node"],
      },
      techStack: {
        Languages: ["JS", "Python"],
        Frontend: ["React"],
        Backend: ["Node"],
      },
    });
    await newProfile.save();
  }
};

module.exports = { parseId, getModelBySection, seedIfNeeded };
