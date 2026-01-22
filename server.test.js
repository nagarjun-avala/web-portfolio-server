const request = require("supertest");
const mongoose = require("mongoose");
const { createServer } = require("./server");

const app = createServer(); // Import the Express app

// Use a separate database for testing to avoid deleting real data
// If you don't have a separate local instance, this will create a new collection in your local mongo
const TEST_MONGO_URI =
  process.env.MONGO_URI_TEST || "mongodb://localhost:27017/portfolio_test_db";
const API_KEY = process.env.ADMIN_API_KEY || "my-secret-admin-key";

// --- SETUP & TEARDOWN ---

beforeAll(async () => {
  // Connect to the test database
  // We strictly manage the connection state for Jest
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI);
  }
});

afterAll(async () => {
  // Clean up: Drop the test database so next run is fresh
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  // Close connection to prevent Jest from hanging
  await mongoose.connection.close();
});

// --- TESTS ---

describe("Portfolio API Integration Tests", () => {
  // 1. PUBLIC ROUTES
  describe("GET /api/portfolio", () => {
    it("should return 200 and the portfolio data structure", async () => {
      const res = await request(app).get("/api/portfolio");

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Check if essential sections exist
      expect(res.body.data).toHaveProperty("hero");
      expect(res.body.data).toHaveProperty("projects");
      expect(res.body.data).toHaveProperty("experience");
    });
  });

  // 2. SECURITY CHECKS
  describe("Admin Security Middleware", () => {
    it("should reject POST requests without an API key", async () => {
      const res = await request(app)
        .post("/api/portfolio/item/projects")
        .send({ title: "Hacker Project" });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it("should reject POST requests with an INCORRECT API key", async () => {
      const res = await request(app)
        .post("/api/portfolio/item/projects")
        .set("x-api-key", "wrong-key")
        .send({ title: "Hacker Project" });

      expect(res.statusCode).toEqual(403);
    });
  });

  // 3. CRUD OPERATIONS
  describe("Admin CRUD Operations", () => {
    let createdProjectId;
    const testProject = {
      id: `test-${Date.now()}`,
      title: "Jest Test Project",
      desc: "Created via automated testing",
      cat: "Testing",
    };

    // A. CREATE
    it("should allow Admin to CREATE a new project", async () => {
      const res = await request(app)
        .post("/api/portfolio/item/projects")
        .set("x-api-key", API_KEY)
        .send(testProject);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify the item is in the returned data
      const project = res.body.data.projects.find(
        (p) => p.id === testProject.id
      );
      expect(project).toBeTruthy();
      expect(project.title).toBe(testProject.title);

      createdProjectId = testProject.id;
    });

    // B. UPDATE
    it("should allow Admin to UPDATE an existing project", async () => {
      const updatedData = { title: "Jest Test Project (Updated)" };

      const res = await request(app)
        .put(`/api/portfolio/item/projects/${createdProjectId}`)
        .set("x-api-key", API_KEY)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);

      // Verify update
      const project = res.body.data.projects.find(
        (p) => p.id === createdProjectId
      );
      expect(project.title).toBe(updatedData.title);
    });

    // C. DELETE
    it("should allow Admin to DELETE a project", async () => {
      const res = await request(app)
        .delete(`/api/portfolio/item/projects/${createdProjectId}`)
        .set("x-api-key", API_KEY);

      expect(res.statusCode).toEqual(200);

      // Verify deletion
      const project = res.body.data.projects.find(
        (p) => p.id === createdProjectId
      );
      expect(project).toBeUndefined();
    });
  });

  // 4. MESSAGES (Contact Form)
  describe("Contact Form API", () => {
    it("should allow anyone to send a message", async () => {
      const msg = {
        name: "Test User",
        email: "test@example.com",
        message: "Hello from Jest!",
      };

      const res = await request(app).post("/api/contact").send(msg);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });
  });
});
