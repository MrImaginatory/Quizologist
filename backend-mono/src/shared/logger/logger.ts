import winston from "winston";
import path from "path";
import fs from "fs";

export function createLogger(serviceName: string) {
  const logDir = path.join(__dirname, "../../logs");

  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      // Console output
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
            return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
          })
        ),
      }),
      // All logs file
      new winston.transports.File({
        filename: path.join(logDir, `${serviceName}.log`),
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 5,
      }),
      // Error-only file
      new winston.transports.File({
        filename: path.join(logDir, `${serviceName}-error.log`),
        level: "error",
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),
    ],
  });
}
