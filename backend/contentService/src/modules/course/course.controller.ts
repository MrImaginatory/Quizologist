import { Request, Response, NextFunction } from "express";
import { CourseService } from "./course.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  getAllCourseSchema,
} from "./course.validation";

export class CourseController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCourseSchema.parse(req.body);
      const result = await CourseService.create(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.COURSE_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getAllCourseSchema.parse(req.query);
      const result = await CourseService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.COURSES_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = courseIdParamSchema.parse(req.params);
      const result = await CourseService.getById(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.COURSE_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = courseIdParamSchema.parse(req.params);
      const body = updateCourseSchema.parse(req.body);
      const result = await CourseService.update({ ...params, ...body });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.COURSE_UPDATED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = courseIdParamSchema.parse(req.params);
      const result = await CourseService.delete(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.COURSE_DELETED,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
