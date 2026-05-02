import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "app.log");

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function formatLine(level: LogLevel, message: string, meta?: object): string {
  const ts = new Date().toISOString();
  const metaPart = meta ? " | " + JSON.stringify(meta) : "";
  return `[${ts}] [${level}] ${message}${metaPart}`;
}

function write(level: LogLevel, message: string, meta?: object): void {
  const line = formatLine(level, message, meta) + "\n";
  // Append to log file
  try {
    fs.appendFileSync(LOG_FILE, line, "utf8");
  } catch {
    // If file write fails keep the app running
  }
  // Write to stdout — never using console.log
  process.stdout.write(line);
}

const logger = {
  info: (msg: string, meta?: object) => write("INFO", msg, meta),
  warn: (msg: string, meta?: object) => write("WARN", msg, meta),
  error: (msg: string, meta?: object) => write("ERROR", msg, meta),
  debug: (msg: string, meta?: object) => write("DEBUG", msg, meta),
};

export default logger;
