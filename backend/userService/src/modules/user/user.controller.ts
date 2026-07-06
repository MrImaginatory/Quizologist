import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import { signupSchema, loginSchema } from "./user.validation";

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
}
