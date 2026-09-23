import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../types";
import { UserService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import { ApiError } from "../../utils/ApiError";
import { TokenStore } from "../../utils/tokenStore";
import { JwtToken } from "../../utils/jwtToken";
import {
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
  ACCESS_COOKIE,
} from "../../utils/authCookies";
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
      const { user, accessToken, refreshToken } = await UserService.signup(validatedData);

      // MED-02: the tokens go into HttpOnly cookies — never in the JSON body.
      setAuthCookies(req, res, { accessToken, refreshToken });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.USER_CREATED,
        { user },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await UserService.login(validatedData);

      // MED-02: the tokens go into HttpOnly cookies — never in the JSON body.
      setAuthCookies(req, res, { accessToken, refreshToken });

      return ApiResponse.success(
        res,
        RESPONSE_MESSAGES.SUCCESS.LOGIN_SUCCESS,
        { user }
      );
    } catch (error) {
      next(error);
    }
  }

  /** MED-05: silent refresh — exchanges the HttpOnly refresh cookie for a new access cookie. */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      const refreshToken = cookies?.[REFRESH_COOKIE];
      if (!refreshToken) {
        throw ApiError.unauthorized("Invalid or expired session");
      }

      const identity = await TokenStore.useRefreshToken(refreshToken);
      const tokens = await TokenStore.issueTokens(identity);
      setAuthCookies(req, res, tokens);

      return ApiResponse.success(res, "Session refreshed", null);
    } catch (error) {
      clearAuthCookies(req, res);
      next(error);
    }
  }

  /** MED-05: logout THIS device — blocklists the presented access token and deletes the refresh session. */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;

      const accessToken = cookies?.[ACCESS_COOKIE];
      if (accessToken) {
        try {
          await TokenStore.revokeAccess(JwtToken.verify(accessToken));
        } catch {
          /* already expired/invalid — nothing to blocklist */
        }
      }
      await TokenStore.revokeRefresh(cookies?.[REFRESH_COOKIE]);

      clearAuthCookies(req, res);
      return ApiResponse.success(res, "Logged out", null);
    } catch (error) {
      next(error);
    }
  }

  /** MED-05: logout EVERYWHERE — bumps the per-user revision, killing all tokens. */
  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      let userId: string | undefined;

      // Identify from whichever credential is still usable.
      const accessToken = cookies?.[ACCESS_COOKIE];
      if (accessToken) {
        try {
          userId = JwtToken.verify(accessToken).userId;
        } catch {
          /* fall through to refresh cookie */
        }
      }
      if (!userId && cookies?.[REFRESH_COOKIE]) {
        try {
          const identity = await TokenStore.useRefreshToken(cookies[REFRESH_COOKIE]);
          userId = identity.userId;
        } catch {
          /* nothing to revoke */
        }
      }

      if (userId) {
        await TokenStore.revokeAllForUser(userId);
      }

      clearAuthCookies(req, res);
      return ApiResponse.success(res, "Logged out of all sessions", null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * MED-02: a 5-minute `typ: "socket"` ticket for the socket.io handshake.
   * The real access token stays inside the HttpOnly cookie — even an XSS
   * that hooks fetch/XHR only ever sees this short-lived ticket.
   */
  static async socketTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const identity = req.user;
      if (!identity?.userId) {
        throw ApiError.unauthorized(RESPONSE_MESSAGES.ERROR.UNAUTHORIZED);
      }
      const ticket = await TokenStore.issueSocketTicket(identity);
      return ApiResponse.success(res, "Socket ticket issued", { ticket });
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
