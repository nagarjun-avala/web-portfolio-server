require("dotenv").config();
const { createServer } = require("./server");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

async function main() {
  // allow secret files if used: load them into env if present
  // (optional helper)
  // TODO: add small helper to read /run/secrets/* into process.env if present
  // loadAppSecrets();
  // await connectWithRetries(12, 2000); // ~ up to 24s of attempts

  const port = process.env.PORT ?? 4000;
  const app = createServer();
  // 5. Start Server
  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/portfolio_db";
  // Simple security for updates (Use a strong string in production .env)
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "my-secret-admin-key";

  // --- MONGODB CONNECTION ---
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

  // --- SCHEMAS & MODELS ---

  const server = app.listen(port, async () => {
    // _log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🔑 Admin Key configured: ${ADMIN_API_KEY}`);
  });

  // Graceful Shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server");
    await db.$disconnect();
    server.close(() => {
      console.log("HTTP server closed");
    });
  });
}

main().catch((err) => {
  console.error("Failed to start app", err);
  process.exit(1);
});
