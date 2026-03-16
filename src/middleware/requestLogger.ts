import { Request, Response, NextFunction } from "express";
import { UAParser } from "ua-parser-js";
import logger, { LogLevel, LogMeta } from "@/utils/logger";

// Extend Express Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      log: (level: LogLevel, message: string, meta?: LogMeta) => void;
      user?: {
        id: string;
        [key: string]: unknown;
      };
    }
  }
}


// Configuration for enterprise standards
const SLOW_REQUEST_MS = 500;
const SKIP_PATHS = ["/health", "/favicon.ico"];
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "cvv",
  "secret",
];

/**
 * Redacts sensitive fields from objects to prevent accidental PII leakage in logs.
 * Note: The base logger also performs sanitization, but we do it here for
 * request-specific clarity before the data leaves the middleware.
 */
function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  const safe: Record<string, unknown> = {};

  for (const key in obj as Record<string, unknown>) {
    const val = (obj as Record<string, unknown>)[key];
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      safe[key] = "[REDACTED]";
    } else if (typeof val === "object") {
      safe[key] = sanitize(val);
    } else {
      safe[key] = val;
    }
  }
  return safe;
}

/**
 * Anonymizes IP addresses for GDPR/Privacy compliance.
 */
function anonymizeIP(ip?: string): string {
  if (!ip) return "unknown";
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::xxx"; // IPv6
  return ip.replace(/\d+\.\d+$/, "xxx.xxx"); // IPv4
}

/**
 * Detection for common bot/crawler User Agents.
 */
function isBotUA(ua: string = ""): boolean {
  const botRegex =
    /bot|crawl|spider|slurp|postman|curl|wget|axios|node-fetch|python|headless|puppeteer/i;
  return botRegex.test(ua);
}

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function statusColor(code: number): string {
  if (code >= 500) return colors.red;
  if (code >= 400) return colors.yellow;
  if (code >= 200) return colors.green;
  return "";
}

/**
 * Enterprise Request Logger Middleware (TypeScript)
 */
export default function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SKIP_PATHS.includes(req.path)) return next();

  const start = process.hrtime.bigint();

  // 1. Correlation/Request ID Tracking
  const requestId =
    (req.headers["x-request-id"] as string) || logger.generateRequestId();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  // 2. Parse User Agent
  const uaParser = new UAParser(req.headers["user-agent"]);
  const ua = uaParser.getResult();

  // 3. Attach scoped logger to request for use in controllers
  req.log = (level: LogLevel, message: string, meta: LogMeta = {}) => {
    logger.log(level, message, {
      ...meta,
      requestId,
      path: req.originalUrl,
      method: req.method,
    });
  };

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    const durationFixed = +duration.toFixed(2);

    // Determine log level based on status and performance
    let level: LogLevel = "info";
    if (res.statusCode >= 500) level = "error";
    else if (res.statusCode >= 400 || duration > SLOW_REQUEST_MS)
      level = "warn";
    else if (res.statusCode >= 200 && res.statusCode < 300) level = "success";

    // Prepare metadata for structured logging (Production)
    const logMetadata: LogMeta = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: durationFixed,
      ip: anonymizeIP(req.ip),
      userId: req.user?.id || null,
      browser: ua.browser.name || "unknown",
      os: ua.os.name || "unknown",
      device: ua.device.type || "desktop",
      isBot: isBotUA(req.headers["user-agent"]),
      query: sanitize(req.query),
      body: req.method !== "GET" ? sanitize(req.body) : undefined,
    };

    // Construct readable message for Development
    const color = statusColor(res.statusCode);
    const readableMsg =
      `${colors.cyan}${req.method}${colors.reset} ${req.originalUrl} ` +
      `${color}${res.statusCode}${colors.reset} ` +
      `${colors.dim}${durationFixed}ms${colors.reset} ` +
      `[${ua.browser.name || "?"} on ${ua.os.name || "?"}]` +
      (logMetadata.isBot ? " 🤖" : "");

    // Use the base logger for output
    logger.log(level, readableMsg, logMetadata);
  });

  next();
}
