/* eslint-disable no-undef */
// Must match src/lib/firebase/firebase.ts exactly.
// A mismatched projectId/senderId breaks getToken and background delivery.
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyC4c53R5qCDYZ2Jj7A1Ps7pRJcqKIoEZ-M",
  authDomain: "better-off-market-project.firebaseapp.com",
  projectId: "better-off-market-project",
  storageBucket: "better-off-market-project.firebasestorage.app",
  messagingSenderId: "541953855584",
  appId: "1:541953855584:web:b370a0b21448c554ee3305",
  measurementId: "G-7JTZGTCY17"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "Better Off Market";
  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    payload?.data?.message ||
    "";

  if (!title && !body) return;

  const notificationOptions = {
    body,
    icon: "/logo_blue.png",
    badge: "/logo_blue.png",
    data: {
      url: payload?.data?.url || payload?.data?.link || "/notifications",
    },
    vibrate: [100, 50, 100],
    tag: payload?.data?.tag || "notification",
    renotify: true,
    requireInteraction: false,
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return undefined;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
