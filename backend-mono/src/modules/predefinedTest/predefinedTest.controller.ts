import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { PredefinedTestService } from "./predefinedTest.service";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  createPredefinedTestSchema,
  updatePredefinedTestSchema,
  predefinedTestIdParamSchema,
  predefinedTestQuerySchema,
  predefinedTestTokenParamSchema,
} from "./predefinedTest.validation";

export class PredefinedTestController {
  // ==================== Admin/Teacher Endpoints ====================

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createPredefinedTestSchema.parse(req.body);
      const result = await PredefinedTestService.create(data, req.user!.userId);

      return ApiResponse.success(res, "Predefined test created successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = predefinedTestQuerySchema.parse(req.query);
      const result = await PredefinedTestService.getAll(
        filters,
        req.user!.userId,
        req.user!.role
      );

      return ApiResponse.success(res, "Predefined tests retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = predefinedTestIdParamSchema.parse(req.params);
      const result = await PredefinedTestService.getById(
        id,
        req.user!.userId,
        req.user!.role
      );

      return ApiResponse.success(res, "Predefined test retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = predefinedTestIdParamSchema.parse(req.params);
      const data = updatePredefinedTestSchema.parse(req.body);
      const result = await PredefinedTestService.update(
        id,
        data,
        req.user!.userId,
        req.user!.role
      );

      return ApiResponse.success(res, "Predefined test updated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = predefinedTestIdParamSchema.parse(req.params);
      await PredefinedTestService.delete(id, req.user!.userId, req.user!.role);

      return ApiResponse.success(res, "Predefined test deleted successfully", null);
    } catch (error) {
      next(error);
    }
  }

  static async activate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = predefinedTestIdParamSchema.parse(req.params);
      const result = await PredefinedTestService.activate(id, req.user!.userId);

      return ApiResponse.success(res, "Predefined test activated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = predefinedTestIdParamSchema.parse(req.params);
      const result = await PredefinedTestService.deactivate(id, req.user!.userId);

      return ApiResponse.success(res, "Predefined test deactivated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Student Endpoints ====================

  static async getPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PredefinedTestService.getPendingTests(req.user!.userId);

      return ApiResponse.success(res, "Pending tests retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async getByToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = predefinedTestTokenParamSchema.parse(req.params);
      const result = await PredefinedTestService.getByToken(token, req.user!.userId);

      return ApiResponse.success(res, "Test info retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async startTest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = predefinedTestIdParamSchema.parse(req.params);
      const result = await PredefinedTestService.startTest(id, req.user!.userId);

      return ApiResponse.success(res, "Test started successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }
}
