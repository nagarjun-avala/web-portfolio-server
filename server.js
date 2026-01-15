const express = require("express");
const helmet = require("helmet");
const { json, urlencoded } = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorHandler");

// Routes
const routes = require("./routes");

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
  app.use(morgan("dev"));

  // Rate Limiting (Basic DDoS protection)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // 2. Routes
  app.use("/api/v1", routes);

  // 3. Health Check
  app.get("/", (_req, res) => res.json({ status: "ok", version: "1.0.0" }));
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  // 4. Global Error Handler
  app.use(errorHandler);

  // fallback 404
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  return app;
};

module.exports = { createServer };
