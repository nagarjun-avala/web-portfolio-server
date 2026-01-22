const express = require("express");
const helmet = require("helmet");
const { json, urlencoded } = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

// Routes
const routes = require("./routes");
const requestLogger = require("./middleware/requestLogger.middleware");
const errorCapture = require("./middleware/errorCapture.middleware");

const createServer = () => {
  const app = express();
  const FRONTEND_URLS = (
    process.env.ALLOWED_ORIGINS || "http://localhost:3000"
  ).split(",");

  // CORS options
  const corsOptions = {
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
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
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  // 1. Middleware
  app.use(express.json());
  app.use(helmet());
  app.use(cors());
  // app.use(cors(corsOptions));
  app.use(json());
  app.use(bodyParser.json());
  app.use(urlencoded({ extended: true }));

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
  app.use("/api", routes);

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

module.exports = { createServer };
