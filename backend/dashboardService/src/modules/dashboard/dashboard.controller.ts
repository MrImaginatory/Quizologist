import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { DashboardService } from "./dashboard.service";
import { StudentAnalyticsService } from "./studentAnalytics.service";
import { AdminAnalyticsService } from "./adminAnalytics.service";
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

  static async getTopicPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const data = await StudentAnalyticsService.getTopicPerformance(userId);
      return ApiResponse.success(res, "Topic performance retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getSubjectPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const data = await StudentAnalyticsService.getSubjectPerformance(userId);
      return ApiResponse.success(res, "Subject performance retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getDifficultyBreakdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const data = await StudentAnalyticsService.getDifficultyBreakdown(userId);
      return ApiResponse.success(res, "Difficulty breakdown retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getTimeAnalysis(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const data = await StudentAnalyticsService.getTimeAnalysis(userId);
      return ApiResponse.success(res, "Time analysis retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getPerformanceTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const data = await StudentAnalyticsService.getPerformanceTrends(userId);
      return ApiResponse.success(res, "Performance trends retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getStrengthsWeaknesses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const data = await StudentAnalyticsService.getStrengthsWeaknesses(userId);
      return ApiResponse.success(res, "Strengths and weaknesses retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Admin Analytics ====================

  static async getTeacherStudentRatio(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { location_id } = req.query;
      const data = await AdminAnalyticsService.getTeacherStudentRatio({
        location_id: location_id as string | undefined,
      });
      return ApiResponse.success(res, "Teacher-student ratio retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getTopStudentsByLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { location_id, date_from, date_to, limit } = req.query;
      const data = await AdminAnalyticsService.getTopStudentsByLocation({
        location_id: location_id as string | undefined,
        date_from: date_from as string | undefined,
        date_to: date_to as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });
      return ApiResponse.success(res, "Top students retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getLeastQuestions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { course_id, subject_id } = req.query;
      const data = await AdminAnalyticsService.getLeastQuestions({
        course_id: course_id as string | undefined,
        subject_id: subject_id as string | undefined,
      });
      return ApiResponse.success(res, "Least questions retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  static async getSubjectsNeedingAttention(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date_from, date_to } = req.query;
      const data = await AdminAnalyticsService.getSubjectsNeedingAttention({
        date_from: date_from as string | undefined,
        date_to: date_to as string | undefined,
      });
      return ApiResponse.success(res, "Subjects needing attention retrieved", data);
    } catch (error) {
      next(error);
    }
  }
}
