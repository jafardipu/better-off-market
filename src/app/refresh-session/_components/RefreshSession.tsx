"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "react-redux";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/icons";
import { endSession, refreshSession } from "@/lib/auth/session";
import { useAppDispatch } from "@/redux/hooks";
import type { RootState } from "@/redux/store";

export default function RefreshSession({ callbackUrl }: { callbackUrl: string }) {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const router = useRouter();
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // No stored token: the user logged out, or site data was cleared. Never
    // refresh then — the refresh cookie outlives logout and would sign the
    // previous user back in. Send them to log in instead.
    if (!store.getState().auth.token) {
      void endSession(dispatch, callbackUrl);
      return;
    }

    let cancelled = false;
    void refreshSession(dispatch, store.getState).then((outcome) => {
      if (cancelled) return;
      if (outcome === "refreshed") router.replace(callbackUrl);
      else if (outcome === "unavailable") setUnavailable(true);
      // "expired": already logged out and on the way to /login.
    });
    return () => {
      cancelled = true;
    };
  }, [attempt, callbackUrl, dispatch, router, store]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      {unavailable ? (
        <>
          <p className="text-base text-primary-black">
            We couldn&apos;t reach the server to refresh your session.
          </p>
          <Button
            onClick={() => {
              setUnavailable(false);
              setAttempt((n) => n + 1);
            }}
            className="bg-primary-color hover:bg-primary-color/90 text-white cursor-pointer"
          >
            Try again
          </Button>
        </>
      ) : (
        <>
          <LoaderIcon className="size-6 animate-spin text-primary-color" />
          <p className="text-sm text-primary-gray">Refreshing your session…</p>
        </>
      )}
    </div>
  );
}
