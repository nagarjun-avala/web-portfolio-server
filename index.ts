import "dotenv/config";
import "@/utils/env"; // Validate env vars immediately after loading them
import { createServer } from "@/server";
import logger from "@/utils/logger";
import { connectDB, disconnectDB } from "@/lib/db.js";

async function main() {
  await connectDB();

  const PORT = parseInt(process.env.PORT || "8080", 10);
  const app = createServer();

  // Start Server
  const server = app.listen(PORT, "0.0.0.0", async () => {
    logger.debug(`🚀 Server running on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    await disconnectDB();
    server.close(() => {
      logger.info("HTTP server closed");
    });
  });
}

main().catch((err) => {
  logger.error("Failed to start app", err);
  process.exit(1);
});
