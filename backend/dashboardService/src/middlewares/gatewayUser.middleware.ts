import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export const extractGatewayUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  const userEmail = req.headers["x-user-email"] as string;
  const userRole = req.headers["x-user-role"] as string;

  if (userId && userEmail && userRole) {
    req.user = {
      userId,
      email: userEmail,
      role: userRole,
    };
  }

  next();
};
