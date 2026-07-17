import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import "./config/associations";
import { extractGatewayUser } from "./middlewares/gatewayUser.middleware";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes";
import studentRoutes from "./modules/student/student.routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";
import { createLogger, requestLogger } from "./utils/logger";

const logger = createLogger("student-service");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger(logger));

app.use("/api/enrollment", extractGatewayUser, enrollmentRoutes);
app.use("/api/student", extractGatewayUser, studentRoutes);

app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Service is healthy", {
    service: "student-service",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, "Route not found", 404);
});

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

  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  return ApiResponse.error(res, "Internal server error", 500);
});

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info("Server started", { port: env.PORT, environment: env.NODE_ENV });
  });
};

startServer();

export default app;
