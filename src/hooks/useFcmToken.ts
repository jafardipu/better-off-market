"use client";

import { getToken, deleteToken } from "firebase/messaging";
import { envConfig } from "@/config";
import { getFcmMessaging } from "@/lib/firebase/messaging-client";
import { useCallback, useState } from "react";

async function ensureActiveServiceWorker() {
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
  );
  await navigator.serviceWorker.ready;

  // Wait until this registration is actually active.
  if (!registration.active) {
    await new Promise<void>((resolve) => {
      const worker = registration.installing || registration.waiting;
      if (!worker) {
        resolve();
        return;
      }
      worker.addEventListener("statechange", () => {
        if (worker.state === "activated" || registration.active) resolve();
      });
      setTimeout(() => resolve(), 4000);
    });
  }

  // Drop stale Push subscriptions from an old Firebase project/SW.
  // Those cause token-subscribe-failed with "missing required authentication credential".
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    try {
      await existing.unsubscribe();
    } catch (error) {
      console.warn("Unable to clear stale push subscription:", error);
    }
  }

  return registration;
}

const useFcmToken = () => {
  const [token, setToken] = useState("");
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("");

  const requestFcmToken = useCallback(async () => {
    try {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("Notification" in window)
      ) {
        console.warn("[FCM] Browser does not support notifications/service workers.");
        return null;
      }

      // Secure context required (localhost or https).
      if (!window.isSecureContext) {
        console.error(
          "[FCM] Push requires a secure context (https or localhost). Current origin is not secure.",
        );
        return null;
      }

      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      setNotificationPermissionStatus(permission);

      if (permission !== "granted") {
        console.warn("[FCM] Notification permission is:", permission);
        return null;
      }

      const vapidKey = envConfig.firebaseVapidKey?.trim();
      if (!vapidKey) {
        console.error("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.");
        return null;
      }

      const messaging = await getFcmMessaging();
      if (!messaging) {
        console.warn("[FCM] Firebase messaging is not supported in this browser.");
        return null;
      }

      const registration = await ensureActiveServiceWorker();

      // Clear any cached FCM token tied to a bad/old subscription.
      try {
        await deleteToken(messaging);
      } catch {
        // ignore — no existing token is fine
      }

      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!currentToken) {
        console.error(
          "[FCM] getToken returned empty. Check that NEXT_PUBLIC_FIREBASE_VAPID_KEY belongs to Firebase project betteroffmarket-4e241 (Project settings → Cloud Messaging → Web Push certificates).",
        );
        return null;
      }

      setToken(currentToken);
      return currentToken;
    } catch (error: any) {
      const message = error?.message || String(error);
      console.error("[FCM] Unable to retrieve Firebase messaging token:", error);

      if (
        message.includes("authentication credential") ||
        message.includes("token-subscribe-failed")
      ) {
        console.error(
          "[FCM] Likely cause: VAPID key does not match Firebase project betteroffmarket-4e241, or Web Push certificates are not configured. Generate a new key pair in Firebase Console → Project settings → Cloud Messaging → Web Push certificates, then set NEXT_PUBLIC_FIREBASE_VAPID_KEY and restart pnpm dev.",
        );
      }

      return null;
    }
  }, []);

  return {
    fcmToken: token,
    notificationPermissionStatus,
    requestFcmToken,
  };
};

export default useFcmToken;
