import { Request, Response, NextFunction } from "express";
import { TopicService } from "./topic.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import {
  createTopicSchema,
  updateTopicSchema,
  topicIdParamSchema,
  getTopicsBySubjectSchema,
  getAllTopicsSchema,
} from "./topic.validation";

export class TopicController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTopicSchema.parse(req.body);
      const result = await TopicService.create(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TOPIC_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getAllTopicsSchema.parse(req.query);
      const result = await TopicService.getAll(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TOPICS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getBySubjectId(req: Request, res: Response, next: NextFunction) {
    try {
      const data = getTopicsBySubjectSchema.parse({
        ...req.params,
        ...req.query,
      });
      const result = await TopicService.getBySubjectId(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TOPICS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = topicIdParamSchema.parse(req.params);
      const result = await TopicService.getById(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TOPIC_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = topicIdParamSchema.parse(req.params);
      const body = updateTopicSchema.parse(req.body);
      const result = await TopicService.update({ ...params, ...body });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TOPIC_UPDATED,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const data = topicIdParamSchema.parse(req.params);
      const result = await TopicService.delete(data);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.TOPIC_DELETED,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
