import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { TeacherAssignmentService } from "./teacherAssignment.service";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  assignCourseSchema,
  assignSubjectSchema,
  bulkAssignSubjectsSchema,
  getAssignmentsSchema,
  getTeacherAssignmentsSchema,
  getTeachingStudentsSchema,
  getTeachingTestsSchema,
  getTopStudentsSchema,
  getWeaknessSummarySchema,
  getQuestionCoverageSchema,
} from "./teacherAssignment.validation";

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
      const validatedData = assignCourseSchema.parse(req.body);

      const result = await TeacherAssignmentService.assignCourse(validatedData);

      return ApiResponse.success(res, "Course assigned to teacher successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = assignSubjectSchema.parse(req.body);

      const result = await TeacherAssignmentService.assignSubject(validatedData);

      return ApiResponse.success(res, "Subject assigned to teacher successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async bulkAssignSubjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = bulkAssignSubjectsSchema.parse(req.body);

      const result = await TeacherAssignmentService.bulkAssignSubjects(validatedData);

      return ApiResponse.success(res, "Bulk assignment completed", result, 201);
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
      const validatedData = getAssignmentsSchema.parse(req.query);

      const result = await TeacherAssignmentService.getAssignments(validatedData);

      return ApiResponse.success(res, "Assignments retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getTeacherAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = getTeacherAssignmentsSchema.parse(req.params);

      const result = await TeacherAssignmentService.getTeacherAssignments(validatedData.teacherId);

      return ApiResponse.success(res, "Teacher assignments retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getTeachingStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user?.userId || req.query.teacher_id as string;
      if (!teacherId) {
        return ApiResponse.error(res, "Teacher ID is required", 400);
      }

      const validatedData = getTeachingStudentsSchema.parse({
        ...req.query,
        teacherId,
      });

      const result = await TeacherAssignmentService.getTeachingStudents({
        teacherId,
        course_id: validatedData.course_id,
        subject_id: validatedData.subject_id,
        student_id: validatedData.student_id,
        search: validatedData.search,
        page: validatedData.page,
        limit: validatedData.limit,
      });

      return ApiResponse.success(res, "Teaching students retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getTeachingTests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user?.userId || req.query.teacher_id as string;
      if (!teacherId) {
        return ApiResponse.error(res, "Teacher ID is required", 400);
      }

      const validatedData = getTeachingTestsSchema.parse({
        ...req.query,
        teacherId,
      });

      const result = await TeacherAssignmentService.getTeachingTests({
        teacherId,
        course_id: validatedData.course_id,
        subject_id: validatedData.subject_id,
        student_id: validatedData.student_id,
        search: validatedData.search,
        status: validatedData.status,
        page: validatedData.page,
        limit: validatedData.limit,
      });

      return ApiResponse.success(res, "Teaching tests retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getTopStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user?.userId || req.query.teacher_id as string;
      if (!teacherId) {
        return ApiResponse.error(res, "Teacher ID is required", 400);
      }

      const validatedData = getTopStudentsSchema.parse(req.query);

      const result = await TeacherAssignmentService.getTopStudents({
        teacherId,
        course_id: validatedData.course_id,
        subject_id: validatedData.subject_id,
        limit: validatedData.limit,
      });

      return ApiResponse.success(res, "Top students retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getWeaknessSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user?.userId || req.query.teacher_id as string;
      if (!teacherId) {
        return ApiResponse.error(res, "Teacher ID is required", 400);
      }

      const validatedData = getWeaknessSummarySchema.parse(req.query);

      const result = await TeacherAssignmentService.getWeaknessSummary({
        teacherId,
        course_id: validatedData.course_id,
        threshold: validatedData.threshold,
      });

      return ApiResponse.success(res, "Weakness summary retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getQuestionCoverage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user?.userId || req.query.teacher_id as string;
      if (!teacherId) {
        return ApiResponse.error(res, "Teacher ID is required", 400);
      }

      const validatedData = getQuestionCoverageSchema.parse(req.query);

      const result = await TeacherAssignmentService.getQuestionCoverage({
        teacherId,
        course_id: validatedData.course_id,
        subject_id: validatedData.subject_id,
        limit: validatedData.limit,
      });

      return ApiResponse.success(res, "Question coverage retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
