# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Better Off Market is the frontend for an off-market real-estate marketplace: sellers list properties, and buyers make offers and negotiate counter-offers (agreement e-signing is disabled for now; see "Offers and messaging"). The REST API and socket server are separate backend services, so this repo contains only the frontend. Stack: Next.js 16 (App Router), React 19, Redux Toolkit / RTK Query, Tailwind CSS v4 and shadcn/ui.

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
- `NEXT_PUBLIC_GOOGLE_MAP_KEY`: Google Maps API key. The key's project has only **Places API (New)**; Google no longer enables the legacy Places API. Use `AutocompleteSuggestion` and `Place.fetchFields` (see `location-search.tsx` and `Locationselectorforlisting.tsx`), never the legacy `Autocomplete`, `PlacesService` or `AutocompleteService`, which fail with "This page can't load Google Maps correctly". `useTravelTimeFromMe.ts` still uses the legacy `DistanceMatrixService` (it should move to the Routes API).
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: Firebase Cloud Messaging (FCM) web push key.
- `NEXT_PUBLIC_SITE_URL` (optional, default `https://betteroffmarket.com`): becomes `metadataBase` in `src/app/layout.tsx`, which makes link-preview image URLs absolute. Set it on staging.

**Link previews:** the root layout's `openGraph`/`twitter` metadata sets the shared-link title. The image comes from `src/app/opengraph-image.jpg` and `twitter-image.jpg`, a 1200×630 crop of `public/banner_image.png` (that file is 7.6 MB, too large for previews). Property detail pages set their own preview in `generateMetadata`. Don't set `openGraph.url` in the root layout, because every page would inherit it.

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
- **Token refresh** (`src/lib/auth/session.ts`). The refresh token is an httpOnly cookie on the API's domain, so only the browser can refresh; the Next server can't see that cookie.
  - `baseApi` (`credentials: "include"`): on a 401 from a request that carried a token (not an auth route), it calls `refreshSession` once and retries. Only one refresh runs at a time.
  - `proxy.ts`: an expired cookie token redirects to `/refresh-session?callbackUrl=...` (that page must stay out of the matcher), which refreshes in the browser.
  - `SessionRefresher` refreshes shortly before the JWT `exp`. `SocketProvider` reconnects with the new token.
  - A failed refresh calls `endSession`: logout, flush redux-persist, then a hard redirect to `/login?sessionExpired=1`.
- **Multi-step auth flows** (sign-up OTP, forgot password, reset password) store temporary tokens in sessionStorage under the keys `token`, `signUpToken`, `forgotPasswordToken` and `resetPasswordToken`. `baseApi` sends whichever one is set as a `token` header.

### Data fetching: two paths that share cache tags
1. **Server components use `apiGet<T>()`** from `src/lib/api/fetcher.ts`. It reads the auth token from the cookie (pass `withAuth: false` for public data) and tags the fetch with Next cache tags. It **returns `null` on any failure and never throws**, so callers must handle `null`.
2. **Client components use RTK Query.** There is one `baseApi`, and each domain file in `src/redux/api/` adds its endpoints with `baseApi.injectEndpoints`. Cache invalidation uses the tag strings in `src/redux/tagTypes.ts`. A new tag must be added to both `tagTypes` and `tagTypesList`.

The same `tagTypes` strings double as Next.js cache tags (`tagTypes.property`, `property-${id}`). RTK Query invalidation does not refresh server-rendered pages. After a client mutation that changes property data shown on server-rendered pages, also call the server action `revalidateProperties(propertyId?)` from `src/lib/actions/revalidate.ts`. It calls `updateTag` and `revalidatePath`.

Key lists of records by `_id`, never by index. Cards contain client components with state (`ImageWithFallback`, `FavoriteIcon`), and an index key carries that state over to a different property when a filter, sort or page changes the list.

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

### Offers and messaging
- **Contracts and e-signing are disabled for now (attorney advice). Old code is commented out, not deleted**, and marked `OLD FLOW (contracts / e-signing)`. New code is marked `NEW FLOW`. Follow the same convention when touching this flow.
  - `/sign-agreement-contact` and `/agreement/[offerId]` return 404, with the old page kept in comments.
  - Accepting an offer:
    - The seller gets `MarkUnderContractDialog`, opened with `offerId`. It holds the contract details plus a required "how did the buyer first contact you" question and a certification checkbox.
    - The buyer gets `AgreementReachedDialog`.
    - The backend sends the notifications. A seller arriving from one lands on `/user/offers-received/<id>?contractDetails=1`, which auto-opens the dialog.
- **Offer detail pages** (seller `/user/offers-received/[offer-id]`, buyer `/review-sent-offer`):
  - The top row has one clickable card per negotiation round, built by `getOfferRounds` (from `history`; the latest round uses `currentTerms`). The latest round is selected by default.
  - The details below show the selected round. Each term that changed from the round before shows the old value struck through.
  - Both pages render the terms with the shared `OfferTermsSections`. `SummaryField` and `ContingencyItem` take an optional `previousValue`.
- **Chat runs over socket.io, not REST.**
  - Read request replies from the emit's ack callback, using `socket.timeout(...)`, and show a retry state on timeout; see `message/_components/chatSocket.ts`.
  - The backend sends pushed events such as `chat_list` and `message` to one stored socket per user, so they can miss a tab. Don't rely on them alone for request/response.

### Forms and styling
- **Forms** use react-hook-form with zod v4 schemas (in `src/lib/validations/`) and shadcn `Form` components.
  - The property listing form is split into section components under `user/my-listings/property-listing/_components/sections`, with field rules in `config/property-type.config.ts`.
  - The counter-offer editor tracks which sections the user has changed with the `useEditableSections` hook.
  - Money and day fields in the offer forms accept whole numbers only. They use `type="text" inputMode="numeric"` with `blockNonDigitKeys` and `toWholeNumberText` from `src/utils/wholeNumberInput.ts`; submit-offer's `CurrencyFormField` has its own copy of the same logic.
- **Tailwind v4 is configured in CSS**; there is no `tailwind.config`. Brand colors (`primary-color`, `primary-gray` and others) are defined in `@theme` in `src/app/globals.css`.
- shadcn uses the `radix-nova` style, and class names are merged with `cn` from `@/lib/utils`.
- The path alias `@/*` maps to `src/*`.
