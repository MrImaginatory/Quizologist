import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import "./config/associations";
import courseRoutes from "./modules/course/course.routes";
import subjectRoutes from "./modules/subject/subject.routes";
import topicRoutes from "./modules/topic/topic.routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/content/course", courseRoutes);
app.use("/api/content/subject", subjectRoutes);
app.use("/api/content/topic", topicRoutes);

app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Service is healthy", {
    service: "content-service",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, "Route not found", 404);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError || (err as any).isOperational) {
    return ApiResponse.error(res, err.message, (err as any).statusCode || 400);
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

  if (err.name === "SequelizeUniqueConstraintError") {
    return ApiResponse.error(res, "Resource already exists", 409);
  }

  if (err.name === "SequelizeValidationError") {
    const messages = (err as any).errors?.map((e: any) => e.message) || [];
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Validation failed",
      data: messages.map((m: string) => ({ message: m }))
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    statusCode: 500,
    success: false,
    message: "Internal server error",
    data: null
  });
});

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Content Service running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
};

startServer();

export default app;
