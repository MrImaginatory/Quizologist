import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { seedAdmin } from "./config/seed";
import "./config/associations";
import userRoutes from "./modules/user/user.routes";
import locationRoutes from "./modules/location/location.routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";
import { createLogger, requestLogger } from "./utils/logger";

const logger = createLogger("user-service");
const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger(logger));

// Routes (order matters — specific routes before wildcard /:id)
app.use("/api/user/location", locationRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Service is healthy", {
    service: "user-service",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, "Route not found", 404);
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  if (err.name === "ZodError") {
    const zodError = err as any;
    const structuredErrors = zodError.errors?.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    })) || [];

    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Validation failed",
      data: structuredErrors
    });
  }

  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  return ApiResponse.error(res, "Internal server error", 500);
});

// Start server
const startServer = async () => {
  await connectDatabase();
  await seedAdmin();

  app.listen(env.PORT, () => {
    logger.info("Server started", { port: env.PORT, environment: env.NODE_ENV });
  });
};

startServer();

export default app;
