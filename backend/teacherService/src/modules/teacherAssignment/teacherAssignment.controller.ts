import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { TeacherAssignmentService } from "./teacherAssignment.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class TeacherAssignmentController {
  static async getTeachersWithCounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "10" } = req.query;

      const result = await TeacherAssignmentService.getTeachersWithCounts(
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      return ApiResponse.success(res, "Teachers retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async assignCourse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teacher_id, course_id } = req.body;

      const result = await TeacherAssignmentService.assignCourse({
        teacher_id,
        course_id,
      });

      return ApiResponse.success(res, "Course assigned to teacher successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teacher_id, course_id, subject_id } = req.body;

      const result = await TeacherAssignmentService.assignSubject({
        teacher_id,
        course_id,
        subject_id,
      });

      return ApiResponse.success(res, "Subject assigned to teacher successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const result = await TeacherAssignmentService.removeAssignment(id);

      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  static async getAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teacher_id, course_id, page = "1", limit = "10" } = req.query;

      const result = await TeacherAssignmentService.getAssignments({
        teacher_id: teacher_id as string | undefined,
        course_id: course_id as string | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      return ApiResponse.success(res, "Assignments retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getTeacherAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.params.teacherId as string;

      const result = await TeacherAssignmentService.getTeacherAssignments(teacherId);

      return ApiResponse.success(res, "Teacher assignments retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
