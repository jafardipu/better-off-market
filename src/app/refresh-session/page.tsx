import type { Metadata } from "next";
import { safeCallbackUrl } from "@/lib/auth/authUtils";
import RefreshSession from "./_components/RefreshSession";

export const metadata: Metadata = {
  title: "Refreshing session",
  robots: { index: false, follow: false },
};

// The proxy sends users here when their access token has expired.
// Must stay out of the proxy matcher, or it would redirect to itself.
export default async function RefreshSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  return <RefreshSession callbackUrl={safeCallbackUrl(callbackUrl)} />;
}
