import { Request, Response, NextFunction } from "express";
import { SubjectService } from "./subject.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdParamSchema,
  getSubjectsByCourseSchema,
  getAllSubjectsSchema,
} from "./subject.validation";

export class SubjectController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSubjectSchema.parse(req.body);
      const result = await SubjectService.create(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.SUBJECT_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getAllSubjectsSchema.parse(req.query);
      const result = await SubjectService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.SUBJECTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getByCourseId(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getSubjectsByCourseSchema.parse({
        ...req.params,
        ...req.query,
      });
      const result = await SubjectService.getByCourseId(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.SUBJECTS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = subjectIdParamSchema.parse(req.params);
      const result = await SubjectService.getById(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.SUBJECT_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = subjectIdParamSchema.parse(req.params);
      const body = updateSubjectSchema.parse(req.body);
      const result = await SubjectService.update({ ...params, ...body });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.SUBJECT_UPDATED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = subjectIdParamSchema.parse(req.params);
      const result = await SubjectService.delete(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.SUBJECT_DELETED,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
