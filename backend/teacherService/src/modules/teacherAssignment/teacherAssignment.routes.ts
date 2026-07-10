import { Router, Router as ExpressRouter } from "express";
import { TeacherAssignmentController } from "./teacherAssignment.controller";

const router: ExpressRouter = Router();

router.post("/assign/faculty", TeacherAssignmentController.assignFaculty);
router.post("/assign/subject", TeacherAssignmentController.assignSubject);
router.delete("/:id", TeacherAssignmentController.removeAssignment);
router.get("/", TeacherAssignmentController.getAssignments);
router.get("/teacher/:teacherId", TeacherAssignmentController.getTeacherAssignments);

export default router;
