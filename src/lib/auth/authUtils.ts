// Pure helpers shared by the proxy (server) and the browser — no React, no store.
import { jwtDecode } from "jwt-decode";

/** Cookie the proxy and server components read the access token from (written by authSlice). */
export const ACCESS_TOKEN_COOKIE = "betteroffmarket-access-token";

/** Page that renews an expired access token in the browser, then returns to `callbackUrl`. */
export const REFRESH_SESSION_PATH = "/refresh-session";

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please log in again.";

/**
 * Reads `exp` / `iat` from a JWT (in ms) without verifying it — only used to
 * decide *when* to refresh. Returns null if the token can't be decoded.
 */
export function getTokenTimes(
  token: string,
): { expiresAt: number | null; issuedAt: number | null } | null {
  try {
    const { exp, iat } = jwtDecode<{ exp?: number; iat?: number }>(token);
    return {
      expiresAt: typeof exp === "number" ? exp * 1000 : null,
      issuedAt: typeof iat === "number" ? iat * 1000 : null,
    };
  } catch {
    return null;
  }
}

/** True if the token is unreadable, expired, or expires within `leewayMs`. */
export function isTokenExpired(token: string, leewayMs = 0): boolean {
  const times = getTokenTimes(token);
  if (!times) return true;
  if (times.expiresAt === null) return false; // no exp claim: never expires
  return times.expiresAt - leewayMs <= Date.now();
}

/** Allows only same-site relative paths, blocking open redirects such as "//evil.com". */
export function safeCallbackUrl(value: unknown, fallback = "/"): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : fallback;
}
