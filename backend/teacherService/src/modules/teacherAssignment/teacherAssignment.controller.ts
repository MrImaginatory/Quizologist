import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { TeacherAssignmentService } from "./teacherAssignment.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class TeacherAssignmentController {
  static async assignFaculty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teacher_id, faculty_id } = req.body;

      const result = await TeacherAssignmentService.assignFaculty({
        teacher_id,
        faculty_id,
      });

      return ApiResponse.success(res, "Faculty assigned to teacher successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teacher_id, faculty_id, subject_id } = req.body;

      const result = await TeacherAssignmentService.assignSubject({
        teacher_id,
        faculty_id,
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
      const { teacher_id, faculty_id, page = "1", limit = "10" } = req.query;

      const result = await TeacherAssignmentService.getAssignments({
        teacher_id: teacher_id as string | undefined,
        faculty_id: faculty_id as string | undefined,
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
