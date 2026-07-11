import { Router, Router as ExpressRouter } from "express";
import { DashboardController } from "./dashboard.controller";

const router: ExpressRouter = Router();

// KPI Stats
router.get("/stats", DashboardController.getStats);

// Student Analytics
router.get("/student/topic-performance", DashboardController.getTopicPerformance);
router.get("/student/subject-performance", DashboardController.getSubjectPerformance);
router.get("/student/difficulty-breakdown", DashboardController.getDifficultyBreakdown);
router.get("/student/time-analysis", DashboardController.getTimeAnalysis);
router.get("/student/performance-trends", DashboardController.getPerformanceTrends);
router.get("/student/strengths-weaknesses", DashboardController.getStrengthsWeaknesses);

export default router;
