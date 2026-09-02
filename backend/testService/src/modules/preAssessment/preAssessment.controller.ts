import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { PreAssessmentService } from "./preAssessment.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class PreAssessmentController {
  static async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PreAssessmentService.getStatus(req.user!.userId);
      return ApiResponse.success(res, "Pre-assessment status retrieved", result);
    } catch (error) {
      next(error);
    }
  }

  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PreAssessmentService.start(req.user!.userId);
      return ApiResponse.success(res, "Pre-assessment started successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }
}
