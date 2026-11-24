/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/authUtils";

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token, refreshToken } = action.payload;

      state.user = user;
      state.token = token;

      // Store token in Cookies for middleware authentication
      Cookies.set(ACCESS_TOKEN_COOKIE, token, {
        path: "/",
        expires: 30,
      });

      // Cookies.set("refreshToken", refreshToken, {
        
      // })
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      // Remove token from cookie
      Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
      // Cookies.remove("refreshToken", { path: "/" });
    },
  },
});

// selectors
export const selectUser = (state: any) => state.auth.user;
export const selectToken = (state: any) => state.auth.token;

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
