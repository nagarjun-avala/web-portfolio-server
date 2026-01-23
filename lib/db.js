const mongoose = require("mongoose");
const { log } = require("../utils/logger");

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined");
}

/**
 * Global cache (Vercel / serverless safe)
 */
const globalForMongo = global;

if (!globalForMongo.mongoose) {
  globalForMongo.mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Connect with retries (Prisma-style, but Mongoose)
 */
async function connectWithRetries(retries = 12, delayMs = 2000) {
  log("info", "Starting Connection to MongoDB");
  if (globalForMongo.mongoose.conn) {
    return globalForMongo.mongoose.conn;
  }

  for (let i = 1; i <= retries; i++) {
    try {
      if (!globalForMongo.mongoose.promise) {
        globalForMongo.mongoose.promise = mongoose.connect(DATABASE_URL, {
          bufferCommands: false,
        });
      }

      globalForMongo.mongoose.conn = await globalForMongo.mongoose.promise;
      log("info", "✅ MongoDB connected successfully");
      return globalForMongo.mongoose.conn;
    } catch (err) {
      globalForMongo.mongoose.promise = null;
      log("error", "❌ MongoDB connection failed:", err);
      log(
        "warn",
        `Mongo connect attempt ${i}/${retries} failed: ${err.message}`,
      );

      if (i === retries) {
        throw err;
      }

      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

module.exports = connectWithRetries;
