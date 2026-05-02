const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "notifications.log");

const LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? " | " + JSON.stringify(meta) : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

function writeLog(level, message, meta) {
  const line = formatMessage(level, message, meta) + "\n";

  // Write to log file
  fs.appendFileSync(LOG_FILE, line, "utf8");

  // Write to stdout using process.stdout (not console.log)
  process.stdout.write(line);
}

const logger = {
  info: (message, meta) => writeLog(LEVELS.INFO, message, meta),
  warn: (message, meta) => writeLog(LEVELS.WARN, message, meta),
  error: (message, meta) => writeLog(LEVELS.ERROR, message, meta),
  debug: (message, meta) => writeLog(LEVELS.DEBUG, message, meta),
};

module.exports = logger;
