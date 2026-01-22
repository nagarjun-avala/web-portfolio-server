const { log, generateRequestId } = require("../utils/logger");
const UAParser = require("ua-parser-js");

const isProd = process.env.NODE_ENV === "production";

// tweakables
const SLOW_REQUEST_MS = 500;
const SKIP_PATHS = ["/health", "/", "/favicon.ico"];

// fields NEVER to log
const SENSITIVE_FIELDS = ["password", "token", "accessToken", "refreshToken"];

function sanitizeBody(body) {
  if (!body || typeof body !== "object") return undefined;

  const safe = {};
  for (const key of Object.keys(body)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      safe[key] = "[REDACTED]";
    } else {
      safe[key] = body[key];
    }
  }

  return safe;
}

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function statusColor(code) {
  if (code >= 500) return colors.red; // red
  if (code >= 400) return colors.yellow; // yellow
  if (code >= 200) return colors.green; // green
  return "";
}

function safeIP(ip) {
  // anonymize IPv4 → 192.168.xxx.xxx
  return ip?.replace(/\d+\.\d+$/, "xxx.xxx");
}

function isBotUA(ua = "") {
  if (!ua) return true;

  const botRegex = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /slurp/i,
    /postman/i,
    /curl/i,
    /wget/i,
    /axios/i,
    /node-fetch/i,
    /python/i,
    /go-http-client/i,
    /headless/i,
    /puppeteer/i,
    /playwright/i,
  ];

  return botRegex.some((r) => r.test(ua));
}

module.exports = function requestLogger(req, res, next) {
  if (SKIP_PATHS.includes(req.path)) {
    return next();
  }
  const start = process.hrtime.bigint();

  const requestId = req.headers["x-request-id"] || generateRequestId();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const uaParser = new UAParser(req.headers["user-agent"]);
  const ua = uaParser.getResult();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;

    const logData = {
      requestId: requestId ?? null,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: +duration.toFixed(2),
      browser: ua.browser.name,
      os: ua.os.name,
      device: ua.device.type || "desktop",
      isBot: isBotUA(req.headers["user-agent"]),
      userId: req.user?.id ?? null,
      ip: safeIP(req.ip),
    };

    // JSON logs for prod
    if (isProd) {
      console.log(JSON.stringify(logData));
      return;
    }

    const slow = duration > SLOW_REQUEST_MS;
    const level = slow ? "warn" : "info";

    const color = statusColor(res.statusCode);
    // const reset = "\x1b[0m";

    // console.log(
    //   `${colors.cyan}${req.method}${colors.reset} ${req.originalUrl} ` +
    //     `${color}${res.statusCode}${colors.reset} ` +
    //     `${colors.dim}${duration.toFixed(1)}ms${colors.reset} ` +
    //     `🧠 ${ua.browser.name ?? "?"} · ${ua.os.name ?? "?"}` +
    //     (logData.isBot ? " 🤖" : "")
    // );

    // slow request warning
    // if (duration > 500) {
    //   console.warn(
    //     `${colors.yellow}⚠️ Slow request: ${duration.toFixed(1)}ms${
    //       colors.reset
    //     }`
    //   );
    // }

    // log(level, "HTTP Request", {
    //   method: req.method,
    //   path: req.originalUrl,
    //   status: `${color}${res.statusCode}${reset}`,
    //   durationMs: duration.toFixed(2),
    //   ip: req.ip,
    //   userId: req.user?.id ?? null, // injected after auth
    //   userAgent: req.headers["user-agent"],
    // });
    log(
      level,
      `${colors.cyan}${req.method}${colors.reset} ${req.originalUrl} ` +
        `${color}${res.statusCode}${colors.reset} ` +
        `${colors.dim}${duration.toFixed(1)}ms${colors.reset} ` +
        `🧠 ${ua.browser.name ?? "?"} · ${ua.os.name ?? "?"}` +
        (logData.isBot ? " 🤖" : "")
    );
  });

  next();
};
