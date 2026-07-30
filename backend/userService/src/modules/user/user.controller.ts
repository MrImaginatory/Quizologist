import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import { ApiError } from "../../utils/ApiError";
import {
  signupSchema,
  loginSchema,
  getAllUsersSchema,
  getUserByRoleSchema,
  getUserByIdSchema,
  assignLocationSchema,
} from "./user.validation";

export class UserController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = signupSchema.parse(req.body);
      const result = await UserService.signup(validatedData);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.USER_CREATED,
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await UserService.login(validatedData);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOGIN_SUCCESS,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = getAllUsersSchema.parse(req.query);
      const result = await UserService.getAllUsers(validatedData);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.USERS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = getUserByRoleSchema.parse({
        ...req.params,
        ...req.query,
      });
      const result = await UserService.getUserByRole(validatedData);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.USERS_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = getUserByIdSchema.parse(req.params);
      const result = await UserService.getUserById(validatedData);

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.USER_FOUND,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async assignLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getUserByIdSchema.parse(req.params);
      const validatedData = assignLocationSchema.parse(req.body);
      const result = await UserService.assignLocation(id, validatedData);

      const message = validatedData.location_id
        ? RESPONSE_MESSAGES.SUCCESS.LOCATION_ASSIGNED
        : RESPONSE_MESSAGES.SUCCESS.LOCATION_REMOVED;

      return ApiResponse.success(res, message, result);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.UNAUTHORIZED);
      }
      const result = await UserService.getMe(userId);
      return ApiResponse.success(res, RESPONSE_MESSAGES.SUCCESS.USER_FOUND, result);
    } catch (error) {
      next(error);
    }
  }
}
