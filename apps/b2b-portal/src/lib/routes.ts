/**
 * B2B Portal — centralized application route constants.
 *
 * Rules:
 * - Never hardcode route strings in components.
 * - Dynamic routes are functions returning a typed string.
 * - All new routes must be added here before use.
 */
export const ROUTES = {
  // ─── Authentication ───────────────────────────────────────────────────────
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // ─── Agency Status Gates ──────────────────────────────────────────────────
  pendingApproval: '/pending-approval',
  suspended: '/suspended',
  correction: '/correction',
  reapply: '/reapply',

  // ─── Authenticated App ────────────────────────────────────────────────────
  dashboard: '/dashboard',
  profile: '/profile',

  // ─── Quote Request Portal ─────────────────────────────────────────────────
  quotes: '/quotes',
  quoteNew: '/quotes/new',
  quoteDetail: (id: string) => `/quotes/${id}` as const,
  quoteEdit: (id: string) => `/quotes/${id}/edit` as const,
  quoteSuccess: (reference: string) => `/quotes/${reference}/success` as const,
} as const;

/**
 * Type helper — static ROUTES values (excludes function members).
 * Useful for comparisons in middleware or nav active-state logic.
 */
export type StaticRoute = (typeof ROUTES)[{
  [K in keyof typeof ROUTES]: (typeof ROUTES)[K] extends string ? K : never;
}[keyof typeof ROUTES]];
