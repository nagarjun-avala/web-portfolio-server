/* src/middleware/errorHandler.ts */
const { _error } = require("../lib/log");

function errorHandler(err, _req, res, _next) {
  _error(`🔥 Server Error:\n${err}`);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal Server Error";
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
