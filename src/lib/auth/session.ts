// Browser-only session handling: renewing the access token and ending the
// session. Used by the RTK Query base query, the socket, SessionRefresher and
// the /refresh-session page, so every caller shares the same rules.
import type { Dispatch } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { envConfig } from "@/config";
import { logout, setUser } from "@/redux/features/authSlice";
import { authRoutes } from "@/lib/authRoutes";
import { REFRESH_SESSION_PATH, safeCallbackUrl } from "./authUtils";

/** The slice of Redux state this module needs (kept minimal to avoid an import cycle with the store). */
export type SessionState = { auth: { token: string | null; user: unknown } };

/**
 * - "refreshed": a new access token is saved (Redux, localStorage and the cookie).
 * - "expired": the refresh token is missing or invalid. The user has been
 *   logged out and is being sent to /login.
 * - "unavailable": the API couldn't be reached. Nothing changed, so a network
 *   blip never logs anyone out.
 */
export type RefreshOutcome = "refreshed" | "expired" | "unavailable";

let refreshInFlight: Promise<RefreshOutcome> | null = null;
let sessionEnding = false;

/**
 * Gets a new access token from POST /auth/refresh-token. The backend reads the
 * refresh token from its httpOnly cookie, which the browser sends because of
 * `credentials: "include"`. Concurrent callers share one request.
 *
 * Only call this while an access token is stored. There is no logout endpoint,
 * so the refresh cookie survives logout; refreshing without a stored token
 * would sign the previous user back in.
 */
export function refreshSession(
  dispatch: Dispatch,
  getState: () => SessionState,
): Promise<RefreshOutcome> {
  refreshInFlight ??= requestRefresh(dispatch, getState).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function requestRefresh(
  dispatch: Dispatch,
  getState: () => SessionState,
): Promise<RefreshOutcome> {
  let response: Response;
  try {
    response = await fetch(`${envConfig.baseUrl}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    return "unavailable";
  }

  // Any non-2xx response means the session is over; the status code doesn't matter.
  const body = response.ok ? await response.json().catch(() => null) : null;
  const accessToken: unknown = body?.data?.accessToken;
  if (typeof accessToken !== "string" || !accessToken) {
    await endSession(dispatch);
    return "expired";
  }

  // The user logged out while the request was in flight — don't sign them back in.
  if (!getState().auth.token) return "expired";

  dispatch(
    setUser({
      // Login stores the decoded token as `user`; keep doing the same.
      user: decodeUser(accessToken) ?? getState().auth.user,
      token: accessToken,
    }),
  );
  return "refreshed";
}

function decodeUser(token: string): unknown {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

/**
 * Logs the user out and hard-navigates to /login, which shows the
 * session-expired notice. The full reload also drops the socket and all
 * cached data from the old session. Runs once even if many requests fail
 * together.
 *
 * @param callbackUrl where to return after logging in (defaults to the current page)
 */
export async function endSession(dispatch: Dispatch, callbackUrl?: string) {
  if (sessionEnding) return;
  sessionEnding = true;

  dispatch(logout());
  // Write the cleared auth state to localStorage before reloading, or
  // rehydration would bring the old token back. Imported lazily because the
  // store imports this module (through baseApi).
  const { persistor } = await import("@/redux/store");
  await persistor.flush();

  const returnTo =
    callbackUrl ?? window.location.pathname + window.location.search;
  const returnPath = returnTo.split("?")[0];
  const params = new URLSearchParams({ sessionExpired: "1" });
  if (!authRoutes.includes(returnPath) && returnPath !== REFRESH_SESSION_PATH) {
    params.set("callbackUrl", safeCallbackUrl(returnTo));
  }
  window.location.replace(`/login?${params}`);
}
