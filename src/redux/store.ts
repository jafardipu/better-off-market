/* eslint-disable no-unused-vars */
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import authSlice from "../redux/features/authSlice";
import offerDraftSlice from "../redux/features/offerDraftSlice";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { baseApi } from "./api/baseApi";

const createNoopStorage = () => {
  return {
    // @ts-expect-error: Ignoring TypeScript error due to inferred 'any' type for 'values' which is handled in the form submit logic
    getItem(_key) {
      console.log(_key);
      return Promise.resolve(null);
    },
    // @ts-expect-error: Ignoring TypeScript error due to inferred 'any' type for 'values' which is handled in the form submit logic
    setItem(_key, value) {
      console.log(_key);
      return Promise.resolve(value);
    },
    // @ts-expect-error: Ignoring TypeScript error due to inferred 'any' type for 'values' which is handled in the form submit logic
    removeItem(_key) {
      console.log(_key);
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const authPersistConfig = {
  key: "auth",
  storage,
};

// NEW: separate persist config for offerDraft — blacklist excludes
// supportingDocuments from being written to localStorage, since File
// objects can't survive JSON.stringify. values/propertyId/isEdit
// (all plain, JSON-safe data) DO get persisted.
const offerDraftPersistConfig = {
  key: "offerDraft",
  storage,
  blacklist: ["supportingDocuments"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const persistedOfferDraftReducer = persistReducer(
  offerDraftPersistConfig,
  offerDraftSlice,
);

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
    // Now persisted — but only values/propertyId/isEdit survive a refresh.
    // supportingDocuments always resets to [] on reload (see blacklist above).
    offerDraft: persistedOfferDraftReducer,
  },
  middleware: (getDefaultMiddlewares) =>
    getDefaultMiddlewares({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "offerDraft/setOfferDraft",
        ],
        ignoredPaths: ["offerDraft.supportingDocuments"],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);

if (typeof window !== "undefined") {
  setupListeners(store.dispatch);
}