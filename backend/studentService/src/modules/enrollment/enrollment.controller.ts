import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { EnrollmentService } from "./enrollment.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createEnrollmentSchema,
  enrollmentIdParamSchema,
  studentIdParamSchema,
  getAllEnrollmentsSchema,
  getEnrolledSubjectsSchema,
  getEnrolledTopicsSchema,
} from "./enrollment.validation";

export class EnrollmentController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createEnrollmentSchema.parse(req.body);
      const result = await EnrollmentService.createBatch(data, req.user!.userId);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.ENROLLED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = getAllEnrollmentsSchema.parse(req.query);
      const result = await EnrollmentService.getAll(req.user!.userId, data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.ENROLLMENTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = enrollmentIdParamSchema.parse(req.params);
      const result = await EnrollmentService.getById(data, req.user!.userId);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.ENROLLMENT_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = enrollmentIdParamSchema.parse(req.params);
      const result = await EnrollmentService.delete(data, req.user!.userId);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.UNENROLLED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getByStudentId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = studentIdParamSchema.parse(req.params);
      const query = getAllEnrollmentsSchema.parse(req.query);
      const result = await EnrollmentService.getByStudentId(params.studentId, query);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.ENROLLMENTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEnrolledCourses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await EnrollmentService.getEnrolledCourses(req.user!.userId);

      return ApiResponse.success(
        res,
        "Enrolled courses retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEnrolledSubjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = getEnrolledSubjectsSchema.parse(req.query);
      const result = await EnrollmentService.getEnrolledSubjects(req.user!.userId, data);

      return ApiResponse.success(
        res,
        "Enrolled subjects retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getEnrolledTopics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = getEnrolledTopicsSchema.parse(req.query);
      const result = await EnrollmentService.getEnrolledTopics(req.user!.userId, data);

      return ApiResponse.success(
        res,
        "Enrolled topics retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
