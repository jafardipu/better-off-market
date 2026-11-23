# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Better Off Market is the frontend for an off-market real-estate marketplace: sellers list properties, and buyers make offers, negotiate counter-offers and sign agreements. The REST API and socket server are separate backend services, so this repo contains only the frontend. Stack: Next.js 16 (App Router), React 19, Redux Toolkit / RTK Query, Tailwind CSS v4 and shadcn/ui.

## Commands

The package manager is pnpm (`pnpm-lock.yaml`; `pnpm-workspace.yaml` controls which dependencies may run build scripts).

```bash
pnpm dev                                  # dev server on http://localhost:3000 ("/" redirects to "/home")
pnpm build                                # production build
pnpm start                                # serve the production build
pnpm lint                                 # ESLint flat config (next core-web-vitals + typescript)
pnpm exec eslint src/path/to/file.tsx     # lint a single file
pnpm exec tsc --noEmit                    # type-check (see note below)
pnpm exec shadcn add <component>          # add a shadcn primitive into src/components/ui
```

- **`next build` does not catch type errors**, because `next.config.ts` sets `typescript.ignoreBuildErrors: true`. Run `tsc --noEmit` yourself to check types.
- No test framework is configured.

## Environment

`.env` is gitignored. Code reads it only through `envConfig` in `src/config/index.ts`:
- `NEXT_PUBLIC_BASE_URL`: backend REST API base URL.
- `NEXT_PUBLIC_SOCKET_URL`: socket.io server.
- `NEXT_PUBLIC_GOOGLE_MAP_KEY`: Google Maps API key.
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: Firebase Cloud Messaging (FCM) web push key.

Remote image hosts (for example the DigitalOcean Spaces upload bucket) must be listed in `images.domains` in `next.config.ts`, or `next/image` rejects them.

## Architecture

### Routing (`src/app`)
Pages are organized into route groups: `(public)`, `(auth)`, `(buyer)`, `(private)` and `(seller)`. All seller dashboard pages live under `/user/*`, and `(seller)/user/template.tsx` adds the navbar and `DashboardSidebar` to them. The group layouts only add a footer; **they do not enforce authentication**.

Where components live:
- Components used by only one route go in a `_components/` folder next to that route's `page.tsx`.
- Shared components go in `src/components/shared`.
- shadcn primitives go in `src/components/ui`.
- Loading skeletons go in `src/components/skeleton`.

### Auth and route protection
- **`src/proxy.ts` takes the place of `middleware.ts`** (this is the Next 16 convention). It allows a request through if the `betteroffmarket-access-token` cookie is present; otherwise it redirects to `/login?callbackUrl=...`.
- **Route protection is an allow-list.** Only paths in `config.matcher` are protected, so a new private route must be added there. The redirect that sends logged-in users away from auth routes (`src/lib/authRoutes.ts`) runs only on matched paths. Because the auth routes are not in the matcher, that redirect currently never fires.
- **The token is stored in two places.** `authSlice.setUser` saves it in Redux, which redux-persist writes to localStorage, and also writes the cookie. `logout` clears both. The cookie is what server-side code reads: `proxy.ts` and `getServerToken()`.
- **Token refresh.** `redux/api/baseApi.ts` attaches `Authorization: Bearer <token>` from Redux state. When a request returns 401, it calls `POST /auth/refresh-token` with `credentials: "include"` (the refresh token is a backend-set cookie) and retries the request. If the refresh fails, it dispatches `logout`.
- **Multi-step auth flows** (sign-up OTP, forgot password, reset password) store temporary tokens in sessionStorage under the keys `token`, `signUpToken`, `forgotPasswordToken` and `resetPasswordToken`. `baseApi` sends whichever one is set as a `token` header.

### Data fetching: two paths that share cache tags
1. **Server components use `apiGet<T>()`** from `src/lib/api/fetcher.ts`. It reads the auth token from the cookie (pass `withAuth: false` for public data) and tags the fetch with Next cache tags. It **returns `null` on any failure and never throws**, so callers must handle `null`.
2. **Client components use RTK Query.** There is one `baseApi`, and each domain file in `src/redux/api/` adds its endpoints with `baseApi.injectEndpoints`. Cache invalidation uses the tag strings in `src/redux/tagTypes.ts`. A new tag must be added to both `tagTypes` and `tagTypesList`.

The same `tagTypes` strings double as Next.js cache tags (`tagTypes.property`, `property-${id}`). RTK Query invalidation does not refresh server-rendered pages. After a client mutation that changes property data shown on server-rendered pages, also call the server action `revalidateProperties(propertyId?)` from `src/lib/actions/revalidate.ts`. It calls `updateTag` and `revalidatePath`.

Response types are `IApiResponse<T>` (`{ data, meta }`, for paginated lists) and `IApiSingleDataResponse<T>`, both in `src/types/api-response.ts`. To show an API error in a toast (sonner), use `errorModification(error)` from `src/lib/errors/`; it pulls the backend's error message out of the response. For react-hook-form or zod errors, use `zodFormErrorModification`.

### Client state and providers
- **Redux store** (`src/redux/store.ts`):
  - `baseApi`: the RTK Query cache.
  - `auth`: persisted to localStorage.
  - `offerDraft`: persisted, except `supportingDocuments`, which is excluded because `File` objects can't be serialized. This slice carries offer form values from `/submit-offer` to `/review-offer`.
- Use `useAppDispatch` and `useAppSelector` from `src/redux/hooks.ts`.
- **Provider order** in `src/lib/provider/Provider.tsx`: Redux → PersistGate → `FirebaseProvider` → `SocketProvider` → `TooltipProvider`.
  - `FirebaseProvider` registers `public/firebase-messaging-sw.js` for push notifications. While the app is open, it turns incoming messages into toasts and invalidates the `Notifications` tag. When a user is logged in, it saves the device's FCM push token to their profile.
  - `SocketProvider` (`src/context/SocketContextApi.tsx`) opens a socket.io connection only when an auth token exists. Components access it with `useSocket()`.

### Forms and styling
- **Forms** use react-hook-form with zod v4 schemas (in `src/lib/validations/`) and shadcn `Form` components.
  - The property listing form is split into section components under `user/my-listings/property-listing/_components/sections`, with field rules in `config/property-type.config.ts`.
  - The counter-offer editor tracks which sections the user has changed with the `useEditableSections` hook.
- **Tailwind v4 is configured in CSS**; there is no `tailwind.config`. Brand colors (`primary-color`, `primary-gray` and others) are defined in `@theme` in `src/app/globals.css`.
- shadcn uses the `radix-nova` style, and class names are merged with `cn` from `@/lib/utils`.
- The path alias `@/*` maps to `src/*`.
