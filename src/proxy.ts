// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { authRoutes } from "./lib/authRoutes";
import {
  ACCESS_TOKEN_COOKIE,
  isTokenExpired,
  REFRESH_SESSION_PATH,
  safeCallbackUrl,
} from "./lib/auth/authUtils";

// A token this close to expiry counts as expired, so it can't lapse while the page renders.
const EXPIRY_LEEWAY_MS = 10_000;

export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const currentPath = nextUrl.pathname + nextUrl.search;

  if (isAuthRoute && token) {
    const callbackUrl = safeCallbackUrl(nextUrl.searchParams.get("callbackUrl"));
    return NextResponse.redirect(new URL(callbackUrl, req.url));
  }

  if (!token && !isAuthRoute) {
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(signInUrl);
  }

  // The access token is present but expired. The refresh token is an httpOnly
  // cookie on the API's domain, so it never reaches this server and the
  // refresh can't happen here. /refresh-session renews the token in the
  // browser, then comes back to this page (or logs the user out).
  if (token && isTokenExpired(token, EXPIRY_LEEWAY_MS)) {
    const refreshUrl = new URL(REFRESH_SESSION_PATH, req.url);
    refreshUrl.searchParams.set("callbackUrl", currentPath);
    return NextResponse.redirect(refreshUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/message",
    "/notifications",
    "/save-properties",
    "/my-offer",
    "/offer-negotiation-story",
    "/review-counter-offer",
    "/review-sent-offer",
    "/review-offer",
    "/send-counter-offer",
    "/sign-agreement-contact",
    "/submit-offer",
    "/user/:path*",
  ],
};
