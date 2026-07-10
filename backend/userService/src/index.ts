import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { seedAdmin } from "./config/seed";
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
    const structuredErrors = zodError.errors?.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    })) || [];
    
    // We pass the structured errors in the data field of the ApiResponse since ApiResponse.error doesn't take data
    // Let's manually construct the JSON response to match what the frontend expects
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Validation failed",
      data: structuredErrors
    });
  }

  console.error("Unhandled error:", err);
  return ApiResponse.error(res, "Internal server error", 500);
});

// Start server
const startServer = async () => {
  await connectDatabase();
  await seedAdmin();

  app.listen(env.PORT, () => {
    console.log(`User Service running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
};

startServer();

export default app;
