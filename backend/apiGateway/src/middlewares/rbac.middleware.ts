import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";

export type UserRole = "admin" | "teacher" | "student";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        ApiError.forbidden("You do not have permission to perform this action")
      );
    }

    next();
  };
};
