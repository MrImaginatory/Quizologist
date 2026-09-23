import { Request, Response } from "express";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "./jwtToken";
import { IssuedTokens } from "./tokenStore";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

/**
 * MED-02 — tokens live exclusively in HttpOnly cookies: JavaScript (and
 * therefore any XSS) can never read them. SameSite=Strict keeps them off
 * cross-site requests entirely; `secure: req.secure` marks them Secure
 * automatically behind HTTPS (trust proxy) while still working on plain
 * localhost during development. The refresh cookie is path-scoped to
 * /api/user so it isn't attached to unrelated requests.
 */
function baseOptions(req: Request) {
  return {
    httpOnly: true,
    secure: req.secure,
    sameSite: "strict" as const,
  };
}

export function setAuthCookies(req: Request, res: Response, tokens: IssuedTokens): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(req),
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(req),
    path: "/api/user",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(req: Request, res: Response): void {
  // Attributes must match the originals or the browser won't clear them.
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(req), path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(req), path: "/api/user" });
}
