import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { seedAdmin } from "./config/seed";
import "./config/associations";

import { authenticate } from "./middlewares/auth.middleware";
import { authorize } from "./middlewares/rbac.middleware";
import { findMatchingRoute } from "./config/routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";
import { createLogger, requestLogger } from "./utils/logger";
import { createSocketServer } from "./socket/socketServer";

// Import all routers
import userRoutes from "./modules/user/user.routes";
import locationRoutes from "./modules/location/location.routes";
import courseRoutes from "./modules/course/course.routes";
import subjectRoutes from "./modules/subject/subject.routes";
import topicRoutes from "./modules/topic/topic.routes";
import contentBulkRoutes from "./modules/bulk/bulk.routes"; // from content service? No, bulk is in question service? Let's check imports later
// Question
import questionRoutes from "./modules/question/question.routes";
import questionImportRoutes from "./modules/question/questionImport.routes";
// Student
import studentRoutes from "./modules/student/student.routes";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes";
// Test
import testSessionRoutes from "./modules/testSession/testSession.routes";
import predefinedTestRoutes from "./modules/predefinedTest/predefinedTest.routes";
import timeBasedRoutes from "./modules/timeBased/timeBased.routes";
import preAssessmentRoutes from "./modules/preAssessment/preAssessment.routes";
// Teacher
import teacherAssignmentRoutes from "./modules/teacherAssignment/teacherAssignment.routes";
// Dashboard
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const logger = createLogger("backend-mono");
const app = express();

// Behind a reverse proxy / tunnel: trust the first hop so per-IP rate limits
// key on the real client IP instead of the proxy's address.
app.set("trust proxy", 1);

// HIGH-03: never leak join tokens (or any path data) through Referer headers.
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use(cors({ origin: env.CORS_ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(requestLogger(logger));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Monolith is healthy", {
    service: "backend-mono",
    timestamp: new Date().toISOString(),
  });
});

// Gateway-style Auth Middleware
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  const match = findMatchingRoute(req.path, req.method);
  
  if (!match) {
    return next();
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
});

// Middleware to populate req.user from gateway-style req.user set by authenticate
// Microservices used extractGatewayUser. We will just pass the request through.
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    // We already have req.user from authenticate
    next();
});

// Dashboard Service
app.use("/api/dashboard", dashboardRoutes);

// Teacher Service
app.use("/api/teacher", teacherAssignmentRoutes);

// Test Service
app.use("/api/test/predefined", predefinedTestRoutes);
app.use("/api/test/pre-assessment", preAssessmentRoutes);
app.use("/api/test/time-based", timeBasedRoutes);
app.use("/api/test", testSessionRoutes);

// Student Service
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/student", studentRoutes);

// Question Service
// Note: bulkRoutes and questionImportRoutes might need adjustment if they have identical prefixes
app.use("/api/question", questionRoutes);

// Content Service
app.use("/api/content/course", courseRoutes);
app.use("/api/content/subject", subjectRoutes);
app.use("/api/content/topic", topicRoutes);
app.use("/api/content/bulk-hierarchy", contentBulkRoutes);

// User Service
app.use("/api/user/location", locationRoutes);
app.use("/api/user", userRoutes);

// 404 and Error Handler
app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, "Route not found", 404);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }
  if (err.name === "ZodError") {
    const zodError = err as any;
    // zod v4 renamed `errors` → `issues`; support both so validation errors
    // return 400 instead of crashing the handler and falling through to 500.
    const issues: any[] = zodError.issues ?? zodError.errors ?? [];
    const details = issues
      .map((e: any) => `${Array.isArray(e.path) && e.path.length ? e.path.join(".") : "value"}: ${e.message}`)
      .join(", ");
    return ApiResponse.error(res, `Validation failed: ${details}`, 400);
  }
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  const message = env.NODE_ENV === "development" ? err.message : "Internal server error";
  return ApiResponse.error(res, message, 500);
});

const startServer = async () => {
  await connectDatabase();
  await seedAdmin();

  const server = http.createServer(app);
  createSocketServer(server, logger);

  server.listen(env.PORT, () => {
    logger.info("Monolith Server started", { port: env.PORT, environment: env.NODE_ENV });
  });
};

startServer();
export default app;
