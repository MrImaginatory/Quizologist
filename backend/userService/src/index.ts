import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import userRoutes from "./modules/user/user.routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
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
    const messages = zodError.errors?.map((e: any) => e.message) || [];
    return ApiResponse.error(
      res,
      messages.join(", ") || "Validation failed",
      400
    );
  }

  console.error("Unhandled error:", err);
  return ApiResponse.error(res, "Internal server error", 500);
});

// Start server
const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`User Service running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
};

startServer();

export default app;
