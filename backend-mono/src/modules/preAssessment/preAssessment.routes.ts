import { Router } from "express";
import { PreAssessmentController } from "./preAssessment.controller";

const router = Router();

router.get("/status", PreAssessmentController.getStatus);
router.post("/start", PreAssessmentController.start);

export default router;
