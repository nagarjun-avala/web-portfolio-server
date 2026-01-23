require("dotenv").config();
const { createServer } = require("./server");
const { loadAppSecrets } = require("./utils/loadSecrets");
const { _log, _error } = require("./lib/log");
const { log } = require("./utils/logger");
const connectWithRetries = require("./lib/db");

async function main() {
  // allow secret files if used: load them into env if present
  // (optional helper)
  // TODO: add small helper to read /run/secrets/* into process.env if present
  loadAppSecrets();
  await connectWithRetries(12, 2000); // ~ up to 24s of attempts

  const PORT = process.env.PORT || 5000;
  const app = createServer();
  // 5. Start Server

  const server = app.listen(PORT, "0.0.0.0", async () => {
    log("debug", `🚀 Server running on port ${PORT}`);
  });

  // Graceful Shutdown
  process.on("SIGTERM", async () => {
    _log("SIGTERM signal received: closing HTTP server");
    // await db.$disconnect();
    server.close(() => {
      _log("HTTP server closed");
    });
  });
}

main().catch((err) => {
  _error("Failed to start app", err);
  process.exit(1);
});
