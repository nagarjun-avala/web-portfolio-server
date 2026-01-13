const { version } = require("../package.json");

function _warn(message) {
  console.error(`[serevr@${version}][WARN] ${message}`);
}

function _debug(message) {
  console.log(`[serevr@${version}][DEBUG] ${message}`);
}

function _log(message) {
  console.log(`[serevr@${version}] ${message}`);
}

function _error(message) {
  console.error(`[serevr@${version}] ${message}`);
}

module.exports = {
  _warn,
  _debug,
  _log,
  _error,
};
