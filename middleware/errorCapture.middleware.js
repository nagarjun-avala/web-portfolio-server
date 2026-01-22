const { log } = require("../utils/logger");

function errorCapture(err, req, res, next) {
  log("error", "🔥 Unhandled error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode || 500,
    error: err,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    requestId: req.requestId,
  });
}

module.exports = errorCapture;
