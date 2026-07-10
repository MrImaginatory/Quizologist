import { Router } from "express";
import { StudentController } from "./student.controller";

const router = Router();

router.get("/list", StudentController.getStudentsWithFilters);
router.get("/:studentId/enrollments", StudentController.getStudentEnrollments);

export default router;
