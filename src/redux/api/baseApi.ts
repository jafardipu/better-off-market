/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "../tagTypes";
import { envConfig } from "@/config";
import { refreshSession, SessionState } from "@/lib/auth/session";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth/authUtils";

const baseQuery = fetchBaseQuery({
  baseUrl: envConfig.baseUrl,
  // Needed so the browser stores the httpOnly refreshToken cookie the API sets
  // at login. Without it, refreshing can never work.
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const otpToken = sessionStorage.getItem("token");
    const forgotPasswordToken = sessionStorage.getItem("forgotPasswordToken");
    const signUpToken = sessionStorage.getItem("signUpToken");
    const resetPasswordToken = sessionStorage.getItem("resetPasswordToken");
    const token = (getState() as any).auth.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    if (otpToken) {
      headers.set("token", otpToken);
    }
    if (resetPasswordToken) {
      console.log("token", resetPasswordToken);
      headers.set("token", `${resetPasswordToken}`);
    }
    if (forgotPasswordToken) {
      headers.set("token", forgotPasswordToken);
    }
    if (signUpToken) {
      headers.set("token", signUpToken);
    }

    return headers;
  },
});

// A 401 from these means wrong credentials or OTP, not an expired session.
const NO_REFRESH_URLS = [
  "/auth/login",
  "/auth/refresh-token",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/otp/",
];

const sessionExpiredResult = () => ({
  error: {
    status: 401,
    data: { message: SESSION_EXPIRED_MESSAGE },
  } as FetchBaseQueryError,
});

const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const getState = () => api.getState() as SessionState;
  // prepareHeaders reads the same value, so this is the token the request carries.
  const sentToken = getState().auth.token;

  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 403) {
    // Handle 403 status for blocked user
    console.log("Your account has been blocked");
  }

  const url = typeof args === "string" ? args : args.url;
  if (
    result.error?.status !== 401 ||
    !sentToken ||
    NO_REFRESH_URLS.some((prefix) => url.startsWith(prefix))
  ) {
    return result;
  }

  // If another request already refreshed while this one was in flight, the
  // stored token has changed — skip straight to the retry. Otherwise refresh
  // (concurrent 401s share a single refresh request).
  if (getState().auth.token === sentToken) {
    const outcome = await refreshSession(api.dispatch, getState);
    if (outcome === "unavailable") return result;
    if (outcome === "expired") return sessionExpiredResult();
  }
  if (!getState().auth.token) return sessionExpiredResult();

  // Retry once. A second 401 is a permission problem, not an expired session:
  // it's returned as a normal error and the user stays logged in.
  return baseQuery(args, api, extraOptions);
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,

  tagTypes: tagTypesList,
  endpoints: () => ({}),
});
