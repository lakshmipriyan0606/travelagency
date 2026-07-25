import { API_BASE_URL } from '@/lib/config';
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
    console.log('Sending session request to backend with token:', token.substring(0, 10) + '...');
    const res = await fetch(`${API_BASE_URL}/v1/b2c-admin/auth/session`, {
      headers: {
        Cookie: `access_token=${token}`
      },
      next: { revalidate: 0 } // Always fresh for auth
    });

    console.log('Session fetch response status:', res.status);
    if (!res.ok) {
      console.error('Session fetch failed with status text:', res.statusText);
      return null;
    }

    const json = await res.json();
    console.log('Session fetch JSON:', JSON.stringify(json));
    
    if (!json.isLoggedIn) {
      console.error('Session data invalid or not logged in');
      return null;
    }

    return {
      id: json.id,
      role: json.role,
      name: json.user?.name || '',
      email: json.user?.email || '',
      exp: json.user?.exp
    } as AdminUser;
  } catch (error) {
    return null;
  }
}

export async function isAdmin(user: AdminUser | null): Promise<boolean> {
  if (!user || !user.role) return false;
  const normalizedRole = user.role.toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
  return ADMIN_ROLES.includes(normalizedRole as any) || ADMIN_ROLES.includes(user.role as any);
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  const valid = await isAdmin(admin);
  
  if (!valid) {
    redirect("/admin/login");
  }

  return admin!;
}

