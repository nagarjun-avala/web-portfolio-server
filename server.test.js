import request from "supertest";
import { disconnect, connect, connection } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createServer } from "./server.js";

const app = createServer();

// Variable to hold the in-memory database instance
let mongoServer;

// --- SETUP & TEARDOWN ---

// Increase timeout to 30 seconds for slow CI environments
beforeAll(async () => {
  // 1. Create the in-memory database
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // 2. Connect Mongoose to this temporary URI
  await disconnect(); // Ensure any old connection is closed
  await connect(uri);
}, 30000); // 30s timeout

afterAll(async () => {
  // 3. Clean up
  if (connection.db) {
    await connection.db.dropDatabase();
  }
  await disconnect();
  await mongoServer.stop();
}, 30000);

// --- TESTS ---

describe("Portfolio API Integration Tests", () => {
  // 0.server health check

  describe("GET /", () => {
    it("should return 200 and the health status data structure", async () => {
      const res = await request(app).get("");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual("ok");
    });
  });
  // 1. PUBLIC ROUTES
  describe("GET /api/portfolio", () => {
    it("should return 200 and the portfolio data structure", async () => {
      // FIX: Reverted to /api/portfolio to match likely server routes
      const res = await request(app).get("/api/portfolio");

      console.log("STAGE:\t", { res });

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
      // FIX: Reverted to /api/portfolio
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

    const API_KEY = process.env.ADMIN_API_KEY || "my-secret-admin-key";

    // A. CREATE
    // FIX: Added specific timeout for this test
    it("should allow Admin to CREATE a new project", async () => {
      const res = await request(app)
        .post("/api/portfolio/item/projects")
        .set("x-api-key", API_KEY)
        .send(testProject);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify the item is in the returned data
      const project = res.body.data.projects.find(
        (p) => p.id === testProject.id,
      );
      expect(project).toBeTruthy();
      expect(project.title).toBe(testProject.title);

      createdProjectId = testProject.id;
    }, 10000); // Increased timeout to 10s

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
        (p) => p.id === createdProjectId,
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
        (p) => p.id === createdProjectId,
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
