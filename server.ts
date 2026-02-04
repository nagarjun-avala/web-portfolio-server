import express, { json, urlencoded } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

// Routes
// Routes
import routes from "./routes/index.js";
import uploadRoutes from "./routes/upload.route"; // Import upload routes
import authRoutes from "./routes/auth.routes"; // Import auth routes
import requestLogger from "@/middleware/requestLogger";
import errorCapture from "./middleware/errorCapture";
import cookieParser from "cookie-parser";
import path from "path"; // Import path

export const createServer = () => {
  // ... (rest of code)

  const app = express();
  const FRONTEND_URLS = (
    process.env.FRONTEND_URL || "http://localhost:3000,"
  ).split(",");

  // CORS options
  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Allow all in development to avoid CORS issues on network/localhost
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      if (FRONTEND_URLS.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // <-- required if you send cookies from frontend
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "x-api-key",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  // 1. Middleware
  app.use(express.json());
  app.use(helmet());
  app.use(compression());
  // app.use(cors());
  app.use(cors(corsOptions));
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

  // Rate Limiting (Basic DDoS protection)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  app.use(requestLogger); // 👈 MUST be early

  // 2. Routes
  // 2. Routes
  app.use("/api", routes);
  app.use("/api/auth", authRoutes); // Register auth routes
  app.use("/api/upload", uploadRoutes); // Register upload routes

  // Serve Uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
