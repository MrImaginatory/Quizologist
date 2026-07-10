import { Request, Response, NextFunction } from "express";
import { StudentService } from "./student.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class StudentController {
  static async getStudentsWithFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const { faculty_id, subject_id, topic_id, page = "1", limit = "10" } = req.query;

      const result = await StudentService.getStudentsWithFilters({
        faculty_id: faculty_id as string | undefined,
        subject_id: subject_id as string | undefined,
        topic_id: topic_id as string | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      return ApiResponse.success(res, "Students retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId as string;
      const { page = "1", limit = "10" } = req.query;

      const result = await StudentService.getStudentEnrollments(
        studentId,
        parseInt(page as string, 10),
        parseInt(limit as string, 10)
      );

      return ApiResponse.success(res, "Student enrollments retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
