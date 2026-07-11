import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { DashboardService } from "./dashboard.service";
import { ApiResponse } from "../../utils/ApiResponse";

export class DashboardController {
  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      let data;

      switch (role) {
        case "admin":
          data = await DashboardService.getAdminStats();
          break;
        case "teacher":
          data = await DashboardService.getTeacherStats(userId);
          break;
        case "student":
          data = await DashboardService.getStudentStats(userId);
          break;
        default:
          return ApiResponse.error(res, "Invalid role", 400);
      }

      return ApiResponse.success(res, "Dashboard stats retrieved successfully", {
        role,
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }
}
