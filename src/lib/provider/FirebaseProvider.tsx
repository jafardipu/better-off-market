"use client";

import { tagTypes } from "@/redux/tagTypes";
import { onMessage } from "firebase/messaging";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import CustomToast from "@/components/shared/CustomToast";
import notificationApi from "@/redux/api/notificationApi";
import { getFcmMessaging } from "@/lib/firebase/messaging-client";
import useFcmToken from "@/hooks/useFcmToken";
import { useUpdateProfileMutation } from "@/redux/api/profileApi";

const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const authToken = useAppSelector((state) => state.auth.token);
  const { requestFcmToken } = useFcmToken();
  const [updateProfile] = useUpdateProfileMutation();
  const syncedFcmToken = useRef<string | null>(null);

  // Foreground push → toast + refresh notification list
  useEffect(() => {
    let disposed = false;
    let unsubscribe = () => {};

    const setupMessaging = async () => {
      // Ensure SW is registered before listening for foreground messages.
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;
      }

      const messaging = await getFcmMessaging();
      if (!messaging || disposed) return;

      unsubscribe = onMessage(messaging, (payload) => {
        dispatch(
          notificationApi.util.invalidateTags([tagTypes.notifications]),
        );

        const title =
          payload.notification?.title ??
          payload.data?.title ??
          "New notification";
        const body =
          payload.notification?.body ??
          payload.data?.body ??
          payload.data?.message;

        if (!title && !body) return;

        toast.custom(
          () => <CustomToast title={title} body={body} />,
          { position: "bottom-left" },
        );
      });
    };

    void setupMessaging().catch((error) => {
      console.error("Unable to initialize Firebase messaging:", error);
    });

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [dispatch]);

  // When logged in, ensure backend has a fresh FCM token.
  // Login used to race getToken with a 1.5s timeout and often saved no token.
  useEffect(() => {
    if (!authToken) {
      syncedFcmToken.current = null;
      return;
    }

    let cancelled = false;

    const syncToken = async () => {
      const fcmToken = await requestFcmToken();
      if (!fcmToken || cancelled) return;
      if (syncedFcmToken.current === fcmToken) return;

      try {
        await updateProfile({ fcmToken }).unwrap();
        syncedFcmToken.current = fcmToken;
      } catch (error) {
        // Profile endpoint may not accept fcmToken yet — log for debugging.
        console.error("Unable to sync FCM token to profile:", error);
      }
    };

    void syncToken();

    return () => {
      cancelled = true;
    };
  }, [authToken, requestFcmToken, updateProfile]);

  return <>{children}</>;
};

export default FirebaseProvider;
