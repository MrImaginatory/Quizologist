import { Router, Router as ExpressRouter } from "express";
import { TeacherAssignmentController } from "./teacherAssignment.controller";

const router: ExpressRouter = Router();

router.get("/list", TeacherAssignmentController.getTeachersWithCounts);
router.post("/assign/course", TeacherAssignmentController.assignCourse);
router.post("/assign/subject", TeacherAssignmentController.assignSubject);
router.post("/assign/bulk-subjects", TeacherAssignmentController.bulkAssignSubjects);
router.delete("/unenroll/:id", TeacherAssignmentController.removeAssignment);
router.get("/teacher-enrollment", TeacherAssignmentController.getAssignments);
router.get("/teacher/:teacherId", TeacherAssignmentController.getTeacherAssignments);
router.get("/teaching/students", TeacherAssignmentController.getTeachingStudents);
router.get("/teaching/tests", TeacherAssignmentController.getTeachingTests);

export default router;
