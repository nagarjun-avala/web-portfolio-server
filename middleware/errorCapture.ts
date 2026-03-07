import logger from "@/utils/logger";
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

// Define a custom type that intersects Request with our custom property
// This avoids "Interface incorrectly extends" errors if global types conflict
type RequestWithId = Request & {
  requestId?: string;
};

interface HttpError extends Error {
  statusCode?: number;
  status?: number;
}

export default function errorCapture(
  err: HttpError & { code?: string; stack?: string },
  req: RequestWithId,
  res: Response,
  next: NextFunction,
) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message;

  // Handle Prisma Specific Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400; // Bad request
    if (err.code === "P2002") {
      message = "Duplicate field value entered";
    } else {
      message = "Database operation failed";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided for database operation";
  }

  logger.error("🔥 Unhandled error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: statusCode,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
  });

  // Ensure headers haven't already been sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : message,
    requestId: req.requestId,
    // Optional: Include stack trace in development for easier debugging
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });

  // Do NOT call next() here, as the response has already been sent/ended.
}
