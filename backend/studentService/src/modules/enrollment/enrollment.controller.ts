import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { EnrollmentService } from "./enrollment.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createEnrollmentSchema,
  enrollmentIdParamSchema,
  getAllEnrollmentsSchema,
} from "./enrollment.validation";

export class EnrollmentController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createEnrollmentSchema.parse(req.body);
      const result = await EnrollmentService.create(data, req.user!.userId);

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
}
