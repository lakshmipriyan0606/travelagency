import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";
import { AdminUser, SessionData } from "./types";
import { ADMIN_ROLES } from "@/lib/auth/constants";

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = await getAccessToken();
  
  if (!token) {
    return null;
  }

  try {
    // Make a lightweight server-to-server fetch to validate the session
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/auth/me`, {
      headers: {
        Cookie: `access_token=${token}`
      },
      next: { revalidate: 0 } // Always fresh for auth
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.data as AdminUser;
  } catch (error) {
    return null;
  }
}

export async function isAdmin(user: AdminUser | null): Promise<boolean> {
  if (!user) return false;
  return ADMIN_ROLES.includes(user.role as any);
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  const valid = await isAdmin(admin);
  
  if (!valid) {
    redirect("/admin/login");
  }

  return admin!;
}
