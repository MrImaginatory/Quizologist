import express, { Request, Response, NextFunction, Express } from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { extractGatewayUser } from "./middlewares/gatewayUser.middleware";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { ApiResponse } from "./utils/ApiResponse";

const app: Express = express();

app.use(cors());
app.use(express.json());

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
  console.error("Unhandled error:", err);
  return ApiResponse.error(res, "Internal server error", 500);
});

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Dashboard Service running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
};

startServer();

export default app;
