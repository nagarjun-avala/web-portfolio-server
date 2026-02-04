import request from "supertest";
import { createServer } from "./server";

describe("Server Health Check", () => {
  const app = createServer();

  it("should return 200 and OK status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});
