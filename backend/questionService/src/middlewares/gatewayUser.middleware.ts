import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

export const extractGatewayUser = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const userId = req.headers["x-user-id"] as string;
  const email = req.headers["x-user-email"] as string;
  const role = req.headers["x-user-role"] as string;

  if (userId && email && role) {
    req.user = { userId, email, role };
  }

  next();
};
