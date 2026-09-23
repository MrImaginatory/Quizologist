import { ApiError } from "./ApiError";
import { redisService } from "../services/redis.service";
import User from "../modules/user/user.model";
import {
  JwtPayload,
  JwtToken,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  generateRefreshTokenId,
} from "./jwtToken";

/**
 * MED-02 + MED-05 — server-side token store (Redis).
 *
 * - Access tokens are JWTs (15 min) with `jti` + per-user revision `tv`.
 *   Revocation = blocklist the jti (logout) or bump the revision (everywhere).
 * - Refresh tokens are opaque ids stored in Redis (7 d, sliding). The stored
 *   session records the `tv` it was issued under, so a revision bump also
 *   invalidates every outstanding refresh token (validated on next use).
 * - Socket handshake uses separate 5-minute `typ: "socket"` tickets.
 *
 * Fail-open policy for ACCESS verification: if Redis is down the checks are
 * skipped (logged) — the exposure is bounded by the 15-minute token TTL and
 * we prefer availability. Refresh issuance fails CLOSED (an unverifiable
 * refresh token must never mint a new access token).
 */

const refreshKey = (jti: string) => `rt:${jti}`;
const blockKey = (jti: string) => `bl:${jti}`;
const revisionKey = (userId: string) => `rev:${userId}`;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

interface RefreshSession {
  userId: string;
  email: string;
  role: string;
  tv: number;
}

export class TokenStore {
  /** Mint a new access + refresh pair for a freshly authenticated user. */
  static async issueTokens(payload: JwtPayload): Promise<IssuedTokens> {
    const tv = await this.getRevision(payload.userId);
    const accessToken = JwtToken.generateAccess(payload, tv ?? 0);

    const refreshToken = generateRefreshTokenId();
    await redisService.setCache(refreshKey(refreshToken), {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tv: tv ?? 0,
    } satisfies RefreshSession, REFRESH_TOKEN_TTL_SECONDS);

    return { accessToken, refreshToken };
  }

  /**
   * Validate the opaque refresh token and return the identity to re-mint
   * access tokens for. Fails closed when Redis cannot confirm the session.
   */
  static async useRefreshToken(refreshToken: string): Promise<JwtPayload> {
    const session = await redisService.getCache<RefreshSession>(
      refreshKey(refreshToken)
    );
    if (!session) {
      throw ApiError.unauthorized("Invalid or expired session");
    }

    const currentTv = await this.getRevision(session.userId);
    if (currentTv === null) {
      // Redis unavailable — cannot prove this session is still valid.
      throw ApiError.unauthorized("Invalid or expired session");
    }
    if (session.tv !== currentTv) {
      // Issued under an older revision — revoked by a security event.
      await redisService.delCache(refreshKey(refreshToken));
      throw ApiError.unauthorized("Invalid or expired session");
    }

    // Sliding session: renew the 7-day window on every refresh.
    await redisService.setCache(refreshKey(refreshToken), session, REFRESH_TOKEN_TTL_SECONDS);

    // Re-read the user so refreshes don't resurrect stale role/email data,
    // and so deleted accounts can never mint new access tokens.
    const fresh = await User.findByPk(session.userId);
    if (!fresh || fresh.deletedAt) {
      await redisService.delCache(refreshKey(refreshToken));
      throw ApiError.unauthorized("Invalid or expired session");
    }

    return { userId: fresh.id, email: fresh.email, role: fresh.role };
  }

  /** MED-02: mint a short-lived `typ: "socket"` handshake ticket. */
  static async issueSocketTicket(payload: JwtPayload): Promise<string> {
    const tv = await this.getRevision(payload.userId);
    return JwtToken.generateSocketTicket(
      { userId: payload.userId, email: payload.email, role: payload.role },
      tv ?? 0
    );
  }

  /**
   * Post-verification checks for an HTTP access token: type, blocklist and
   * revision. Throws 401 when the token was revoked.
   */
  static async assertAccessValid(payload: JwtPayload): Promise<void> {
    if (payload.typ !== "access" || !payload.jti || payload.tv === undefined) {
      // Legacy tokens (pre-MED-05) and socket tickets are not valid on HTTP.
      throw ApiError.unauthorized("Invalid or expired token");
    }

    const blocked = await redisService.exists(blockKey(payload.jti));
    if (blocked === true) {
      throw ApiError.unauthorized("Invalid or expired token");
    }
    if (blocked === null) {
      console.warn("[auth] blocklist unavailable — access check degraded (fail-open)");
    }

    const currentTv = await this.getRevision(payload.userId);
    if (currentTv === null) {
      console.warn("[auth] revision store unavailable — access check degraded (fail-open)");
    } else if (currentTv !== payload.tv) {
      throw ApiError.unauthorized("Invalid or expired token");
    }
  }

  /** Same checks as access tokens, but socket tickets only. */
  static async assertSocketTicketValid(payload: JwtPayload): Promise<void> {
    if (payload.typ !== "socket" || !payload.jti || payload.tv === undefined) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    const blocked = await redisService.exists(blockKey(payload.jti));
    if (blocked === true) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    const currentTv = await this.getRevision(payload.userId);
    if (currentTv !== null && currentTv !== payload.tv) {
      throw ApiError.unauthorized("Invalid or expired token");
    }
  }

  /** Logout (single device): blocklist this access token until its natural expiry. */
  static async revokeAccess(payload: JwtPayload): Promise<void> {
    if (!payload.jti) return;
    const ttl = payload.exp
      ? payload.exp - Math.floor(Date.now() / 1000) + 60
      : ACCESS_TOKEN_TTL_SECONDS;
    if (ttl <= 0) return; // already expired — nothing to revoke
    await redisService.setCache(blockKey(payload.jti), 1, ttl);
  }

  /** Logout (single device): delete this refresh session. */
  static async revokeRefresh(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    await redisService.delCache(refreshKey(refreshToken));
  }

  /**
   * Logout everywhere / password change / role change: bump the revision so
   * EVERY access token and refresh session for the user stops validating.
   */
  static async revokeAllForUser(userId: string): Promise<void> {
    const bumped = await redisService.incr(revisionKey(userId));
    if (bumped === null) {
      console.error(`[auth] CRITICAL: could not bump token revision for ${userId}`);
      throw ApiError.internal("Could not revoke sessions, try again");
    }
  }

  /** Current revision (0 default) or null when Redis is unavailable (fail-open). */
  private static async getRevision(userId: string): Promise<number | null> {
    return redisService.getNumber(revisionKey(userId));
  }
}
