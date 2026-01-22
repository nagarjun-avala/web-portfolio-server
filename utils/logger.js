const { name, version } = require("../package.json");
const crypto = require("crypto");

const ENV = process.env.NODE_ENV || "development";
const IS_PROD = ENV === "production";
const THEME = process.env.LOG_THEME || "dark";
const USE_EMOJI = process.env.LOG_EMOJI === "true";

// color support
const SUPPORTS_COLOR =
  process.env.FORCE_COLOR === "1" || process.stdout.isTTY === true;

// reasonable colors per theme
const THEMES = {
  dark: {
    INFO: "\x1b[34m", // blue
    DEBUG: "\x1b[90m", // dim gray
    WARN: "\x1b[33m", // yellow
    ERROR: "\x1b[31m", // red
    SUCCESS: "\x1b[32m",
  },
  light: {
    INFO: "\x1b[36m", // cyan
    DEBUG: "\x1b[90m",
    WARN: "\x1b[35m", // magenta
    ERROR: "\x1b[31m",
    SUCCESS: "\x1b[32m",
  },
};

// Reasonable, readable colors (dev only)
/**
 * Colors (dev only)
 */
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

// emojis (dev only)
const EMOJI = USE_EMOJI
  ? {
      INFO: "ℹ️",
      DEBUG: "🐞",
      WARN: "⚠️",
      ERROR: "❌",
      SUCCESS: "✅",
    }
  : {};

/**
 * Log levels
 */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3, success: 4 };
const CURRENT_LEVEL =
  LEVELS[process.env.LOG_LEVEL] ?? (IS_PROD ? LEVELS.warn : LEVELS.debug);

function timestamp() {
  return new Date().toISOString();
}

function canLog(level) {
  return LEVELS[level] <= CURRENT_LEVEL;
}

function format(level, message, meta) {
  if (IS_PROD) {
    return JSON.stringify({
      level,
      message,
      meta,
      service: name,
      version,
      env: ENV,
      timestamp: timestamp(),
    });
  }

  const upper = level.toUpperCase();
  const color = COLORS[upper] || "";
  const emoji = EMOJI[upper] ? `${EMOJI[upper]} ` : "";

  return `${color}${emoji}[${name}@${version}][${upper}]${
    COLORS.DIM
  }[${timestamp()}]${COLORS.RESET} ${message}`;
}

/**
 * Base logger
 */
function log(level, message, meta) {
  if (!canLog(level)) return;

  const output = format(level, message, meta);

  if (level === "error") console.error(output, meta || "");
  else if (level === "warn") console.warn(output, meta || "");
  else console.log(output, meta || "");
}

/**
 * Request ID helper
 */
function generateRequestId() {
  return crypto.randomUUID();
}

module.exports = {
  log,
  generateRequestId,
};
