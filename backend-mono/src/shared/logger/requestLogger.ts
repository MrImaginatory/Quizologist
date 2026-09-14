import { Request, Response, NextFunction } from "express";
import winston from "winston";

export function requestLogger(logger: winston.Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
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
