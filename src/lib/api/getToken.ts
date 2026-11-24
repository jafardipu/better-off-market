import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/authUtils";

export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}
