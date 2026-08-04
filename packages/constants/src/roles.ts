/**
 * Single Source of Truth for Role Configurations across the entire Application.
 *
 * Business Rule:
 * 1. `superadmin` and `admin` have EQUAL POWER across all application features
 *    (managing packages, destinations, reviews, users, bookings, content, B2B, B2C).
 * 2. `superadmin` ONLY has one extra permission: Access to DevOps system tools.
 */

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES] | string;

/**
 * SuperAdmin role identifiers (Strictly required for DevOps access)
 */
export const SUPERADMIN_ROLES: readonly string[] = [
  ROLES.SUPERADMIN,
  "super_admin",
  "SUPER_ADMIN",
  "SUPERADMIN",
];

/**
 * Admin role identifiers (SuperAdmin and Admin have EQUAL power across all features)
 */
export const ADMIN_ROLES: readonly string[] = [
  ...SUPERADMIN_ROLES,
  ROLES.ADMIN,
  "ADMIN",
];

/**
 * Normalize role string to lower-case string without underscores/spaces
 */
export function normalizeRole(role?: string | null): string {
  if (!role) return "";
  return String(role).toLowerCase().replace(/[\s_]/g, "");
}

/**
 * Check if a role is SuperAdmin (Strictly for DevOps access)
 */
export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const norm = normalizeRole(role);
  return norm === "superadmin";
}

/**
 * Check if a role has Admin privileges (SuperAdmin and Admin have EQUAL power)
 */
export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const norm = normalizeRole(role);
  return norm === "superadmin" || norm === "admin";
}

/**
 * Check if a user can access DevOps system tools (ONLY SuperAdmin)
 */
export function canAccessDevops(role?: string | null): boolean {
  return isSuperAdmin(role);
}
