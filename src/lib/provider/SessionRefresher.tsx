"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { RootState } from "@/redux/store";
import { getTokenTimes, REFRESH_SESSION_PATH } from "@/lib/auth/authUtils";
import { refreshSession } from "@/lib/auth/session";

const MAX_LEAD_MS = 60_000;
const MAX_TIMER_MS = 2_147_483_647; // setTimeout's upper limit (~24.8 days)

/**
 * Renews the access token shortly before it expires. The proxy and server
 * components only see the access-token cookie and can't refresh it themselves
 * (the refresh cookie belongs to the API's domain), so the browser keeps the
 * cookie fresh for them.
 */
export default function SessionRefresher() {
  const token = useAppSelector((state) => state.auth.token as string | null);
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const router = useRouter();

  useEffect(() => {
    // No stored token means logged out. Never refresh then (see refreshSession).
    if (!token) return;
    const times = getTokenTimes(token);
    if (!times?.expiresAt) return;

    const { expiresAt, issuedAt } = times;
    // Refresh a minute early, or halfway through the token's life if it's
    // shorter than two minutes (e.g. 1m tokens in testing), so a newly
    // issued token is never immediately "due".
    const lifetime = issuedAt ? expiresAt - issuedAt : Infinity;
    const refreshAt = expiresAt - Math.min(MAX_LEAD_MS, lifetime / 2);
    const alreadyExpired = expiresAt <= Date.now();

    let started = false;
    const run = async () => {
      if (started) return;
      started = true;
      const outcome = await refreshSession(dispatch, store.getState);
      // Server components rendered with the expired cookie got no data;
      // render them again with the fresh one.
      if (
        outcome === "refreshed" &&
        alreadyExpired &&
        window.location.pathname !== REFRESH_SESSION_PATH
      ) {
        router.refresh();
      }
    };

    const timer = setTimeout(
      run,
      Math.min(Math.max(refreshAt - Date.now(), 0), MAX_TIMER_MS),
    );
    // Browsers throttle timers in background tabs; catch up when the tab is shown again.
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() >= refreshAt) {
        void run();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      started = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, dispatch, store, router]);

  return null;
}
