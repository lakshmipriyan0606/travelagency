import { config } from '@/lib/config';
import { ROUTES } from '@/lib/routes';
import { ENDPOINTS } from '@/lib/endpoints';
import { redirect } from "next/navigation";
import { getAccessToken } from '@travelagency/auth';
import { AdminUser, SessionData } from "./types";
import { ADMIN_ROLES } from '@travelagency/constants';
import { cookies } from "next/headers";

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = await getAccessToken();
  
  if (!token) {
    return null;
  }

  try {
    // Make a lightweight server-to-server fetch to validate the session
    console.log('Sending session request to backend with token:', token.substring(0, 10) + '...');
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.session}`, {
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

export async function getCurrentB2BAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('b2b_access_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.b2bMe}`, {
      headers: {
        Cookie: `access_token=${token}`,
        Authorization: `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const adminData = json.data?.adminUser || json.adminUser;
    if (!adminData) {
      return null;
    }

    return {
      id: adminData.id || adminData._id,
      role: adminData.role,
      name: adminData.name || '',
      email: adminData.email || '',
    } as AdminUser;
  } catch (error) {
    return null;
  }
}

export async function isAdmin(user: AdminUser | null): Promise<boolean> {
  if (!user || !user.role) return false;
  const normalizedRole = user.role.toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
  return ADMIN_ROLES.includes(normalizedRole as any) || ADMIN_ROLES.includes(user.role as any) || ['OPS', 'SUPERADMIN'].includes(normalizedRole);
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  const valid = await isAdmin(admin);
  
  if (!valid) {
    redirect(ROUTES.login);
  }

  return admin!;
}

export async function requireB2BAdmin(): Promise<AdminUser> {
  const admin = await getCurrentB2BAdmin();
  const valid = await isAdmin(admin);
  
  if (!valid) {
    redirect(ROUTES.b2b.login);
  }

  return admin!;
}

