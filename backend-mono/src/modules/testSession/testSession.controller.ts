import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { TestSessionService } from "./testSession.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  startTestSchema,
  testIdParamSchema,
  getTestsByStudentSchema,
  getAllTestsSchema,
  paginationSchema,
} from "./testSession.validation";

export class TestSessionController {
  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = startTestSchema.parse(req.body);
      const result = await TestSessionService.start(data, req.user!.userId, req.user!.email);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TEST_STARTED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = testIdParamSchema.parse(req.params);
      const result = await TestSessionService.getById(data, req.user!.userId);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TEST_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = paginationSchema.parse(req.query);
      const result = await TestSessionService.getHistory(req.user!.userId, query);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TESTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getByStudentId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = getTestsByStudentSchema.parse(req.params);
      const query = paginationSchema.parse(req.query);
      const result = await TestSessionService.getByStudentId(params, query);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TESTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = getAllTestsSchema.parse(req.query);
      const result = await TestSessionService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TESTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = testIdParamSchema.parse(req.params);
      const result = await TestSessionService.getResult(data, req.user!.userId);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.RESULT_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = testIdParamSchema.parse(req.params);
      const result = await TestSessionService.submit(data.testId, req.user!.userId);

      return ApiResponse.success(
        res,
        "Test submitted successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async abandon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = testIdParamSchema.parse(req.params);
      const result = await TestSessionService.abandon(data.testId, req.user!.userId);

      return ApiResponse.success(
        res,
        "Test abandoned successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getTestDetailForAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = testIdParamSchema.parse(req.params);
      const result = await TestSessionService.getTestDetailForAdmin(
        data,
        req.user?.userId,
        req.user?.role
      );

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TEST_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStudentPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = getTestsByStudentSchema.parse(req.params);
      const result = await TestSessionService.getStudentPerformance(
        params.studentId,
        req.user?.userId,
        req.user?.role
      );

      return ApiResponse.success(
        res,
        "Student performance retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStudentResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = getTestsByStudentSchema.parse(req.params);
      const query = paginationSchema.parse(req.query);
      const result = await TestSessionService.getStudentResults(
        params.studentId,
        req.user!.userId,
        req.user!.role,
        query
      );

      return ApiResponse.success(
        res,
        "Student results retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getStudentResultSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = getTestsByStudentSchema.parse(req.params);
      const query = paginationSchema.parse(req.query);
      const result = await TestSessionService.getStudentResultSummary(
        params.studentId,
        req.user!.userId,
        req.user!.role,
        query
      );

      return ApiResponse.success(
        res,
        "Student result summary retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
