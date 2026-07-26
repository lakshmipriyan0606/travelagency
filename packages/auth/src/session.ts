import { cookies } from "next/headers";
import { AUTH_COOKIES } from "@travelagency/constants";

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;
}

export async function hasAuthSession(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
