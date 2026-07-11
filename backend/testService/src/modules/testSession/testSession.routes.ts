import { Router } from "express";
import { TestSessionController } from "./testSession.controller";

const router = Router();

router.post("/start", TestSessionController.start);
router.post("/submit/:testId", TestSessionController.submit);
router.post("/abandon/:testId", TestSessionController.abandon);
router.get("/history", TestSessionController.getHistory);
router.get("/student/:studentId", TestSessionController.getByStudentId);
router.get("/student/:studentId/performance", TestSessionController.getStudentPerformance);
router.get("/detail/:testId", TestSessionController.getTestDetailForAdmin);
router.get("/all", TestSessionController.getAll);
router.get("/result/:testId", TestSessionController.getResult);
router.get("/:testId", TestSessionController.getById);

export default router;
