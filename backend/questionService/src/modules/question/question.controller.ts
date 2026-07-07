import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { QuestionService } from "./question.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createQuestionSchema,
  updateQuestionSchema,
  questionIdParamSchema,
  searchQuestionsSchema,
  getQuestionsByTopicSchema,
  getAllQuestionsSchema,
} from "./question.validation";

export class QuestionController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createQuestionSchema.parse(req.body);
      const result = await QuestionService.create(data, req.user!.userId);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTION_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = getAllQuestionsSchema.parse(req.query);
      const result = await QuestionService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTIONS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = questionIdParamSchema.parse(req.params);
      const result = await QuestionService.getById(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTION_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = searchQuestionsSchema.parse(req.query);
      const result = await QuestionService.search(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTIONS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getByTopicId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = getQuestionsByTopicSchema.parse({
        ...req.params,
        ...req.query,
      });
      const result = await QuestionService.getByTopicId(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTIONS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const params = questionIdParamSchema.parse(req.params);
      const body = updateQuestionSchema.parse(req.body);
      const result = await QuestionService.update({ ...params, ...body });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTION_UPDATED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = questionIdParamSchema.parse(req.params);
      const result = await QuestionService.delete(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.QUESTION_DELETED,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
