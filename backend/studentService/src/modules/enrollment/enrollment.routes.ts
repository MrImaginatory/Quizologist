import { Router } from "express";
import { EnrollmentController } from "./enrollment.controller";

const router = Router();

router.post("/", EnrollmentController.create);
router.get("/", EnrollmentController.getAll);
router.get("/student/:studentId", EnrollmentController.getByStudentId);
router.get("/:id", EnrollmentController.getById);
router.delete("/:id", EnrollmentController.delete);

export default router;
