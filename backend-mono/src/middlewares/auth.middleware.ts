import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { JwtToken } from "../utils/jwtToken";
import { ApiError } from "../utils/ApiError";
import { TokenStore } from "../utils/tokenStore";
import { ACCESS_COOKIE } from "../utils/authCookies";

/**
 * MED-02 — accepts the token from either an Authorization header (tests,
 * scripts, non-browser clients) or the HttpOnly access cookie (browsers).
 * A presented header is trusted exclusively — no silent cookie fallback on
 * a bad header — while a missing header falls through to the cookie.
 *
 * After signature/expiry verification the MED-05 revocation checks run:
 * per-token blocklist and per-user revision.
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    let token: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      token = cookies?.[ACCESS_COOKIE];
    }

    if (!token) {
      throw ApiError.unauthorized("Token is required");
    }

    const decoded = JwtToken.verify(token);
    await TokenStore.assertAccessValid(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized("Invalid or expired token"));
    }
  }
};
