"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIES } from '@travelagency/constants';

import { ROUTES } from "@/lib/routes";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIES.ACCESS_TOKEN);
  cookieStore.delete(AUTH_COOKIES.REFRESH_TOKEN);
  
  // Also tell backend to logout
  // fetch(BACKEND_LOGOUT_URL, ...)

  redirect(ROUTES.login);
}
