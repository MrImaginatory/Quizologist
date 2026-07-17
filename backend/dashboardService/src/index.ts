import express, { Request, Response, NextFunction, Express } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { extractGatewayUser } from "./middlewares/gatewayUser.middleware";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { ApiResponse } from "./utils/ApiResponse";
import { createLogger, requestLogger } from "./utils/logger";

const logger = createLogger("dashboard-service");
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger(logger));

app.use("/api/dashboard", extractGatewayUser, dashboardRoutes);

app.get("/health", (_req: Request, res: Response) => {
  ApiResponse.success(res, "Service is healthy", {
    service: "dashboard-service",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  ApiResponse.error(res, "Route not found", 404);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
