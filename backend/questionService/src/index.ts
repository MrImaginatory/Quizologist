import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { extractGatewayUser } from "./middlewares/gatewayUser.middleware";
import Question from "./modules/question/question.model";
import questionRoutes from "./modules/question/question.routes";
import { ApiError } from "./utils/ApiError";
import { ApiResponse } from "./utils/ApiResponse";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/question", extractGatewayUser, questionRoutes);

app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Service is healthy", {
    service: "question-service",
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

  console.error("Unhandled error:", err);
  return ApiResponse.error(res, "Internal server error", 500);
});

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Question Service running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
};

startServer();

export default app;
