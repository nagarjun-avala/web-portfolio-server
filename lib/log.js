const { version, name } = require("../package.json");

const ENV = process.env.NODE_ENV || "development";

/**
 * Log levels priority
 */
const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CURRENT_LEVEL =
  LEVELS[process.env.LOG_LEVEL] ?? (ENV === "production" ? 1 : 3);

/**
 * Format helpers
 */
function timestamp() {
  return new Date().toISOString();
}

function basePrefix(level) {
  return `[${name}@${version}][${level}][${ENV}][${timestamp()}]`;
}

function canLog(level) {
  return LEVELS[level] <= CURRENT_LEVEL;
}

/**
 * Logger methods
 */
function _log(message, meta) {
  if (!canLog("info")) return;
  console.log(`${basePrefix("INFO")} ${message}`, meta ? meta : "");
}

function _debug(message, meta) {
  if (!canLog("debug")) return;
  console.log(`${basePrefix("DEBUG")} ${message}`, meta ? meta : "");
}

function _warn(message, meta) {
  if (!canLog("warn")) return;
  console.warn(`${basePrefix("WARN")} ${message}`, meta ? meta : "");
}

function _error(message, error) {
  if (!canLog("error")) return;
  console.error(`${basePrefix("ERROR")} ${message}`);

  if (error instanceof Error) {
    console.error(error.stack);
  } else if (error) {
    console.error(error);
  }
}

module.exports = {
  _log,
  _debug,
  _warn,
  _error,
};
