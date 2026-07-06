import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { JwtToken } from "../utils/jwtToken";
import { ApiError } from "../utils/ApiError";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.TOKEN_MISSING);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.TOKEN_MISSING);
    }

    const decoded = JwtToken.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.TOKEN_INVALID));
    }
  }
};
