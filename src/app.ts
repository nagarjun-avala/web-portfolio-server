import express, { json, urlencoded } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import { globalLimiter } from "./middleware/rateLimiter";

import routes from "./routes/index.js";
import uploadRoutes from "./routes/upload.route"; // Import upload routes
import authRoutes from "./routes/auth.routes"; // Import auth routes
import requestLogger from "./middleware/requestLogger";
import errorCapture from "./middleware/errorCapture";
import cookieParser from "cookie-parser";
import path from "path"; // Import path

export const createServer = () => {

    const app = express();

    // 1. Middleware
    app.set('trust proxy', 1);

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
        })
    );

    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('CORS not allowed'));
                }
            },
            credentials: true,
        })
    );

    app.use(express.json());
    app.use(compression());
    app.use(json());
    app.use(bodyParser.json());
    app.use(urlencoded({ extended: true }));

    app.use(cookieParser()); // Add cookie parser

    if (process.env.NODE_ENV !== "production") {
        app.use(
            morgan("short", {
                skip: (req) => req.originalUrl === "/favicon.ico",
            }),
        );
    }

    // Serve Uploads
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

    // Rate Limiting (Basic DDoS protection)
    app.use(globalLimiter);
    app.use(requestLogger); // 👈 MUST be early

    // 2. Routes
    // 2. Routes
    app.use("/api", routes);
    app.use("/api/auth", authRoutes); // Register auth routes
    app.use("/api/upload", uploadRoutes); // Register upload routes

    // 3. Health Check
    app.get("/", (_req, res) =>
        res.json({ status: "ok", version: "1.0.0", timestamp: new Date() }),
    );

    // 4. Global Error Handler
    app.use(errorCapture);

    // fallback 404
    app.use((_req, res) => res.status(404).json({ error: "Not found" }));

    return app;
};
