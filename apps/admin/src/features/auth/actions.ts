"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIES } from "@travelagency/constants";

/**
 * Clear B2C admin auth cookies on the Next.js host.
 * Does NOT call redirect() — client handles navigation so try/catch
 * wrappers do not treat NEXT_REDIRECT as a failed logout.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIES.ACCESS_TOKEN);
  cookieStore.delete(AUTH_COOKIES.REFRESH_TOKEN);
  return { ok: true as const };
}
