const mongoose = require("mongoose");

// 2. Collection Schemas (Separate collections for scalability)
const BaseItemSchema = {
  id: { type: String, required: true, unique: true }, // maintaining compatibility with frontend IDs
  order: { type: Number, default: 0 }, // For future drag-drop reordering support
};

const ProjectSchema = new mongoose.Schema({
  ...BaseItemSchema,
  slug: { type: String, index: true },
  cat: String,
  title: { type: String, required: true },
  desc: String,
  img: String,
  tags: [String],
  liveLink: String,
  client: String,
  role: String,
  year: String,
  challenge: String,
  solution: String,
  gallery: [String],
});

const ExperienceSchema = new mongoose.Schema({
  ...BaseItemSchema,
  start: Date,
  end: Date,
  role: String,
  company: String,
  desc: String,
});

const EducationSchema = new mongoose.Schema({
  ...BaseItemSchema,
  degree: String,
  institution: String,
  location: String,
  year: String,
  coursework: [String],
});

const CertificationSchema = new mongoose.Schema({
  ...BaseItemSchema,
  title: String,
  issuer: String,
  issueDate: Date,
  credentialID: String,
  credentialURL: String,
  type: String,
});

const BlogSchema = new mongoose.Schema({
  ...BaseItemSchema,
  title: String,
  date: String,
  readTime: String,
  category: String,
  link: String,
  content: String, // Markdown content
});

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Models
const Project = mongoose.model("Project", ProjectSchema);
const Experience = mongoose.model("Experience", ExperienceSchema);
const Education = mongoose.model("Education", EducationSchema);
const Certification = mongoose.model("Certification", CertificationSchema);
const Blog = mongoose.model("Blog", BlogSchema);
const Message = mongoose.model("Message", MessageSchema);

module.exports = {
  Project,
  Experience,
  Education,
  Certification,
  Blog,
  Message,
};
