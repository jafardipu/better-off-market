export const envConfig ={
    mapKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    socketApi: process.env.NEXT_PUBLIC_SOCKET_URL,
    firebaseVapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    // Public site address, used for absolute links in shared-link previews.
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://betteroffmarket.com",
}