import { Request, Response, NextFunction } from "express";
import { FacultyService } from "./faculty.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createFacultySchema,
  updateFacultySchema,
  facultyIdParamSchema,
  getAllFacultySchema,
} from "./faculty.validation";

export class FacultyController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createFacultySchema.parse(req.body);
      const result = await FacultyService.create(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.FACULTY_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getAllFacultySchema.parse(req.query);
      const result = await FacultyService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.FACULTIES_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = facultyIdParamSchema.parse(req.params);
      const result = await FacultyService.getById(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.FACULTY_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = facultyIdParamSchema.parse(req.params);
      const body = updateFacultySchema.parse(req.body);
      const result = await FacultyService.update({ ...params, ...body });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.FACULTY_UPDATED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = facultyIdParamSchema.parse(req.params);
      const result = await FacultyService.delete(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.FACULTY_DELETED,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
