import crypto from "crypto";


const name = "server"

/**
 * Enterprise Standards & Type Definitions
 */
export type LogLevel = "error" | "warn" | "info" | "debug" | "success";

export interface LogMeta {
  requestId?: string;
  path?: string;
  method?: string;
  userId?: string | null;
  [key: string]: any;
}

const ENV = process.env.NODE_ENV || "development";
const IS_PROD = ENV === "production";
const THEME = (process.env.LOG_THEME as "dark" | "light") || "dark";
const USE_EMOJI = process.env.LOG_EMOJI === "true";
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "cvv",
  "key",
  "authorization",
];

// Color support detection
const SUPPORTS_COLOR =
  process.env.FORCE_COLOR === "1" ||
  (process.stdout.isTTY === true && process.env.TERM !== "dumb");

const THEMES = {
  dark: {
    INFO: "\x1b[34m", // blue
    DEBUG: "\x1b[90m", // dim gray
    WARN: "\x1b[33m", // yellow
    ERROR: "\x1b[31m", // red
    SUCCESS: "\x1b[32m", // green
  },
  light: {
    INFO: "\x1b[36m", // cyan
    DEBUG: "\x1b[90m",
    WARN: "\x1b[35m", // magenta
    ERROR: "\x1b[31m",
    SUCCESS: "\x1b[32m",
  },
};

const COLORS = SUPPORTS_COLOR
  ? { ...THEMES[THEME], RESET: "\x1b[0m", DIM: "\x1b[2m" }
  : {
    INFO: "",
    DEBUG: "",
    WARN: "",
    ERROR: "",
    SUCCESS: "",
    RESET: "",
    DIM: "",
  };

const EMOJI = USE_EMOJI
  ? { INFO: "ℹ️", DEBUG: "🐞", WARN: "⚠️", ERROR: "❌", SUCCESS: "✅" }
  : { INFO: "", DEBUG: "", WARN: "", ERROR: "", SUCCESS: "" };

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  success: 2,
  debug: 3,
};
const LOG_LEVEL_ENV = process.env.LOG_LEVEL as LogLevel | undefined;
const CURRENT_LEVEL =
  (LOG_LEVEL_ENV && LEVELS[LOG_LEVEL_ENV]) ??
  (IS_PROD ? LEVELS.info : LEVELS.debug);

/**
 * Recursive sanitizer to redact sensitive PII/Secrets at any depth
 */
function sanitize(obj: any) {
  if (!obj || typeof obj !== "object") return obj;

  // Handle Error objects specifically to preserve stack traces in structured logs
  if (obj instanceof Error) {
    const { message, stack, ...rest } = obj;
    return { message, stack, ...rest };
  }

  const safe: Record<string, any> = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    const val = obj[key];
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      safe[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      safe[key] = sanitize(val);
    } else {
      safe[key] = val;
    }
  }
  return safe;
}

/**
 * Prevents server crashes on circular references during JSON stringify
 */
function safeStringify(obj: any): string {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) return "[Circular]";
      cache.add(value);
    }
    return value;
  });
}

/**
 * Formats the log line based on environment and user preferences
 */
function format(level: LogLevel, message: string, meta?: LogMeta): string {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = sanitize(meta);

  if (IS_PROD) {
    return safeStringify({
      level,
      message,
      meta: sanitizedMeta,
      service: name,
      env: ENV,
      timestamp,
    });
  }

  const upper = level.toUpperCase() as keyof typeof COLORS;
  const color = COLORS[upper] || "";
  const emojiPrefix = EMOJI[upper as keyof typeof EMOJI]
    ? `${EMOJI[upper as keyof typeof EMOJI]} `
    : "";

  let output = `${color}${emojiPrefix}[${name}][${upper}]${COLORS.DIM}[${timestamp}]${COLORS.RESET} ${message}`;

  if (sanitizedMeta && Object.keys(sanitizedMeta).length > 0) {
    output += ` ${COLORS.DIM}${safeStringify(sanitizedMeta)}${COLORS.RESET}`;
  }

  return output;
}

/**
 * Base logging function
 */
export function log(level: LogLevel, message: string, meta?: LogMeta): void {
  if (LEVELS[level] > CURRENT_LEVEL) return;

  const output = format(level, message, meta);

  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.log(output);
}

/**
 * Enterprise API
 */
const logger = {
  error: (msg: string, meta?: LogMeta) => log("error", msg, meta),
  warn: (msg: string, meta?: LogMeta) => log("warn", msg, meta),
  info: (msg: string, meta?: LogMeta) => log("info", msg, meta),
  debug: (msg: string, meta?: LogMeta) => log("debug", msg, meta),
  success: (msg: string, meta?: LogMeta) => log("success", msg, meta),
  generateRequestId: () => crypto.randomUUID(),
  log,
};

export default logger;
