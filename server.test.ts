import request from "supertest";
import { createServer } from "./src/app";
import { disconnectRedis } from "./src/lib/redis";

describe("Server Health Check", () => {
  const app = createServer();

  afterAll(async () => {
    await disconnectRedis();
  });

  it("should return 200 and OK status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});
