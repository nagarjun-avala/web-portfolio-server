import { PrismaClient } from "@prisma/client";
import logger from "@/utils/logger";

/**
 * Enterprise Database Client (Simplified)
 * Focuses on connection lifecycle management and minimal logging.
 */

// Initialize Prisma with default settings
const prisma = new PrismaClient();

/**
 * 1. CONNECTION ESTABLISHMENT
 * Manages the initial handshake with the database and logs success or failure.
 */
export const connectDB = async (): Promise<void> => {
  const start = Date.now();
  const dbType = process.env.DATABASE_URL?.startsWith("mongodb")
    ? "MongoDB"
    : "PostgreSQL";

  try {
    await prisma.$connect();
    const duration = Date.now() - start;
    logger.success(`✅ Database connection established`, {
      duration: `${duration}ms`,
      provider: dbType.toLowerCase(),
    });
  } catch (error) {
    logger.error(`❌ Failed to connect to ${dbType}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    // Terminate process if DB is mandatory for startup
    process.exit(1);
  }
};

/**
 * 2. CONNECTION TERMINATION
 * Gracefully closes the database connection and logs the event.
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("🔌 Database connection closed successfully");
  } catch (error) {
    logger.error("❌ Error during database disconnection", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export { prisma as db };
