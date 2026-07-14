import { Router, Router as ExpressRouter } from "express";
import { TeacherAssignmentController } from "./teacherAssignment.controller";

const router: ExpressRouter = Router();

router.get("/list", TeacherAssignmentController.getTeachersWithCounts);
router.post("/assign/course", TeacherAssignmentController.assignCourse);
router.post("/assign/subject", TeacherAssignmentController.assignSubject);
router.delete("/:id", TeacherAssignmentController.removeAssignment);
router.get("/", TeacherAssignmentController.getAssignments);
router.get("/teacher/:teacherId", TeacherAssignmentController.getTeacherAssignments);

export default router;
