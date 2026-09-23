import { randomBytes, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenType = "access" | "socket";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  /** MED-05: token type — "access" for HTTP, "socket" for short-lived socket tickets */
  typ?: TokenType;
  /** MED-05: unique token id, enables per-token revocation (logout blocklist) */
  jti?: string;
  /** MED-05: per-user token revision — bumping it revokes every issued token */
  tv?: number;
  /** Standard claims present on verified tokens */
  iat?: number;
  exp?: number;
}

// MED-05: short-lived access token; refresh token (cookie) covers long sessions.
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
// Socket handshake tickets: in-memory only, too short-lived to be worth stealing.
export const SOCKET_TICKET_TTL_SECONDS = 5 * 60;
// Refresh sessions are stored server-side (Redis), TTL taken from JWT_EXPIRES_IN.
export const REFRESH_TOKEN_TTL_SECONDS = parseTtl(env.JWT_EXPIRES_IN, 7 * 24 * 60 * 60);

function parseTtl(value: string, fallbackSeconds: number): number {
  const match = /^(\d+)\s*(s|m|h|d)?$/i.exec(String(value).trim());
  if (!match) return fallbackSeconds;
  const amount = parseInt(match[1], 10);
  const unit = (match[2] || "s").toLowerCase();
  const factor = { s: 1, m: 60, h: 3600, d: 86400 }[unit as "s" | "m" | "h" | "d"];
  return amount * factor;
}

export class JwtToken {
  /** MED-05: 15-minute HTTP access token carrying typ + jti (revocation) + tv (revision). */
  static generateAccess(payload: JwtPayload, tv: number): string {
    const claims: JwtPayload = { ...payload, typ: "access", tv };
    return jwt.sign(claims as object, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      jwtid: randomUUID(),
    });
  }

  /** MED-02: short-lived ticket used ONLY by the socket.io handshake. */
  static generateSocketTicket(payload: JwtPayload, tv: number): string {
    const claims: JwtPayload = { ...payload, typ: "socket", tv };
    return jwt.sign(claims as object, env.JWT_SECRET, {
      expiresIn: SOCKET_TICKET_TTL_SECONDS,
      jwtid: randomUUID(),
    });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  static decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}

/** Opaque refresh token — the value is its own Redis lookup id. */
export function generateRefreshTokenId(): string {
  return randomBytes(32).toString("base64url");
}
