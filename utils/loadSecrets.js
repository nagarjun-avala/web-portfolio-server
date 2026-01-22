const fs = require("fs");

function readSecretFile(envVarFile, fallbackEnvVar) {
  // envVarFile: e.g. 'DATABASE_URL_FILE' or 'JWT_SECRET_FILE'
  const filePath = process.env[envVarFile];

  if (filePath && fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8").trim();
  }

  if (fallbackEnvVar && process.env[fallbackEnvVar]) {
    return process.env[fallbackEnvVar];
  }

  return undefined;
}

function loadAppSecrets() {
  const dbUrl = readSecretFile("DATABASE_URL_FILE", "DATABASE_URL");
  if (dbUrl) process.env.DATABASE_URL = dbUrl;

  const jwt = readSecretFile("JWT_SECRET_FILE", "JWT_SECRET");
  if (jwt) process.env.JWT_SECRET = jwt;
}

module.exports = {
  readSecretFile,
  loadAppSecrets,
};
