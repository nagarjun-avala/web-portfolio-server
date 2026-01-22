const mongoose = require("mongoose");
const { log } = require("../utils/logger");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/portfolio_db";

const globalForMongo = global;

if (!globalForMongo.mongoose) {
  globalForMongo.mongoose = { conn: null, promise: null };
}

/**
 * Mongoose query timing
 */
// if (process.env.NODE_ENV === "development") {
//   mongoose.set("debug", function (collection, method, query, doc, options) {
//     log("debug", "DB Query", {
//       collection,
//       method,
//       query,
//       options,
//     });
//   });
// }

async function connectDB() {
  if (globalForMongo.mongoose.conn) {
    return globalForMongo.mongoose.conn;
  }

  if (!globalForMongo.mongoose.promise) {
    globalForMongo.mongoose.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  globalForMongo.mongoose.conn = await globalForMongo.mongoose.promise;

  log("info", "MongoDB connected");
  return globalForMongo.mongoose.conn;
}

module.exports = connectDB;
