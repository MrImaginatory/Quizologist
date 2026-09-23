import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(__dirname, "../../logs");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export function createLogger(serviceName: string) {
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

export function requestLogger(logger: winston.Logger) {
  // HIGH-03: join tokens travel in URLs — never write them to log files
  // (logs are frequently shipped to third parties and retained for months).
  const redactUrl = (url: string): string =>
    url
      .replace(/(\/join\/)[^/?#]+/gi, "$1[REDACTED]")
      .replace(/([?&](?:token|access_token)=)[^&]+/gi, "$1[REDACTED]");

  return (req: any, res: any, next: () => void) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: redactUrl(req.originalUrl),
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get("user-agent"),
      };

      if (res.statusCode >= 500) {
        logger.error("Request failed", logData);
      } else if (res.statusCode >= 400) {
        logger.warn("Request error", logData);
      } else {
        logger.info("Request completed", logData);
      }
    });

    next();
  };
}
