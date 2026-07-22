import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { env } from "./config/env";
import { authenticate } from "./middlewares/auth.middleware";
import { authorize } from "./middlewares/rbac.middleware";
import { proxyRequest } from "./middlewares/proxy.middleware";
import { setupSocketProxy } from "./middlewares/socketProxy.middleware";
import { findMatchingRoute } from "./config/routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";
import { logHealth, getServiceStatuses, getIncidents, startHealthChecker } from "./utils/healthMonitor";
import { createLogger, requestLogger } from "./utils/logger";

const logger = createLogger("api-gateway");
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger(logger));

app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Gateway is healthy", {
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

app.use("/public", express.static(path.join(__dirname, "../public")));

app.get("/status", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/status.html"));
});

app.get("/api/internal/status", async (_req: Request, res: Response) => {
  const services = [
    { name: "user-service", url: env.USER_SERVICE_URL },
    { name: "content-service", url: env.CONTENT_SERVICE_URL },
    { name: "question-service", url: env.QUESTION_SERVICE_URL },
    { name: "student-service", url: env.STUDENT_SERVICE_URL },
    { name: "test-service", url: env.TEST_SERVICE_URL },
    { name: "teacher-service", url: env.TEACHER_SERVICE_URL },
    { name: "dashboard-service", url: env.DASHBOARD_SERVICE_URL },
  ];

  const statuses = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(`${service.url}/health`);
        if (response.ok) {
          logHealth(service.name, "UP");
          return { name: service.name, status: "UP", url: service.url };
        } else {
          logHealth(service.name, "DOWN", response.statusText);
          return { name: service.name, status: "DOWN", url: service.url, error: response.statusText };
        }
      } catch (error: any) {
        logHealth(service.name, "DOWN", error.message);
        return { name: service.name, status: "DOWN", url: service.url, error: error.message };
      }
    })
  );

  const allUp = statuses.every((s) => s.status === "UP");

  res.status(allUp ? 200 : 503).json({
    statusCode: allUp ? 200 : 503,
    success: allUp,
    message: allUp ? "All services are running" : "Some services are down",
    data: statuses,
  });
});

app.get("/api/internal/status/history", async (_req: Request, res: Response) => {
  const services = [
    { name: "user-service", url: env.USER_SERVICE_URL },
    { name: "content-service", url: env.CONTENT_SERVICE_URL },
    { name: "question-service", url: env.QUESTION_SERVICE_URL },
    { name: "student-service", url: env.STUDENT_SERVICE_URL },
    { name: "test-service", url: env.TEST_SERVICE_URL },
    { name: "teacher-service", url: env.TEACHER_SERVICE_URL },
    { name: "dashboard-service", url: env.DASHBOARD_SERVICE_URL },
  ];

  // Live-check each service to get accurate current status
  const liveStatuses: Record<string, "UP" | "DOWN"> = {};
  await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(`${service.url}/health`, { signal: AbortSignal.timeout(5000) });
        liveStatuses[service.name] = response.ok ? "UP" : "DOWN";
      } catch {
        liveStatuses[service.name] = "DOWN";
      }
    })
  );

  const statuses = getServiceStatuses().map((s) => ({
    ...s,
    currentStatus: liveStatuses[s.name] || s.currentStatus,
  }));

  const incidents = getIncidents();

  res.json({
    success: true,
    data: {
      services: statuses,
      incidents,
      lastUpdated: new Date().toISOString(),
    },
  });
});

// Single catch-all for all /api routes — route config drives auth + RBAC
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  const match = findMatchingRoute(req.path, req.method);

  if (!match) {
    return ApiResponse.error(res, "Route not found", 404);
  }

  if (match.route.auth) {
    authenticate(req as any, res, (err?: any) => {
      if (err) return next(err);
      if (match.route.roles && match.route.roles.length > 0) {
        authorize(...(match.route.roles as any[]))(req as any, res, next);
      } else {
        next();
      }
    });
  } else {
    next();
  }
}, proxyRequest);

app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, "Route not found", 404);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  return ApiResponse.error(res, "Internal server error", 500);
});

const startServer = async () => {
  const server = http.createServer(app);

  // Attach WebSocket proxy for /socket.io/ paths
  setupSocketProxy(server);

  // Start background health checker
  const serviceUrls = [
    { name: "user-service", url: env.USER_SERVICE_URL },
    { name: "content-service", url: env.CONTENT_SERVICE_URL },
    { name: "question-service", url: env.QUESTION_SERVICE_URL },
    { name: "student-service", url: env.STUDENT_SERVICE_URL },
    { name: "test-service", url: env.TEST_SERVICE_URL },
    { name: "teacher-service", url: env.TEACHER_SERVICE_URL },
    { name: "dashboard-service", url: env.DASHBOARD_SERVICE_URL },
  ];
  startHealthChecker(serviceUrls);

  server.listen(env.PORT, () => {
    logger.info("Server started", { port: env.PORT, environment: env.NODE_ENV });
    logger.info("Socket.IO proxy enabled", { target: "test-service" });
  });
};

startServer();

export default app;
