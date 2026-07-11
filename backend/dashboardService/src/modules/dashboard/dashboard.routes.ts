import { Router, Router as ExpressRouter } from "express";
import { DashboardController } from "./dashboard.controller";

const router: ExpressRouter = Router();

router.get("/stats", DashboardController.getStats);

export default router;
