/**
 * B2B Portal — centralized API endpoint constants.
 *
 * Convention: ENDPOINTS.client.* — paths relative to NEXT_PUBLIC_API_BASE_URL.
 * Used by the service layer (dashboard.service.ts, quote.service.ts).
 * Components never reference these directly — only services do.
 *
 * Phase 1: These endpoints are wired to mock services.
 * Phase 2: Switch service implementations to call axiosClient with these paths.
 *          Zero UI changes required.
 */
export const ENDPOINTS = {
  client: {
    // ─── Authentication ───────────────────────────────────────────────────
    login: '/b2b/agency/login',
    register: '/b2b/agency/register',
    forgotPassword: '/b2b/agency/forgot-password',
    resetPassword: '/b2b/agency/reset-password',
    logout: '/b2b/agency/logout',
    me: '/b2b/agency/me',
    issues: '/b2b/agency/me/issues',
    resubmit: '/b2b/agency/me/resubmit',
    rejectionReason: '/b2b/agency/me/rejection-reason',
    reapply: '/b2b/agency/me/reapply',

    // ─── Dashboard ────────────────────────────────────────────────────────
    dashboard: {
      /** Aggregate summary for KPI cards and welcome banner */
      summary: '/b2b/agency/dashboard/summary',
      /** KPI metrics only — lightweight poll-friendly endpoint */
      kpis: '/b2b/agency/dashboard/kpis',
      /** Recent activity timeline */
      activity: '/b2b/agency/dashboard/activity',
      /** Unread notification count + list */
      notifications: '/b2b/agency/notifications',
      /** Mark a single notification as read */
      markNotificationRead: (id: string) => `/b2b/agency/notifications/${id}/read`,
      /** Mark all notifications as read */
      markAllNotificationsRead: '/b2b/agency/notifications/read-all',
    },

    // ─── Quote Requests ───────────────────────────────────────────────────
    quotes: {
      /** Paginated list of all quote requests for this agency */
      list: '/b2b/agency/quotes',
      /** Create a new quote request (POST) */
      create: '/b2b/agency/quotes',
      /** Retrieve a single quote request by ID */
      byId: (id: string) => `/b2b/agency/quotes/${id}`,
      /** Save a quote as draft (PATCH) */
      saveDraft: (id: string) => `/b2b/agency/quotes/${id}/draft`,
      /** Submit a draft quote for review (POST) */
      submit: (id: string) => `/b2b/agency/quotes/${id}/submit`,
      /** Full status timeline for a quote */
      timeline: (id: string) => `/b2b/agency/quotes/${id}/timeline`,
      /** Request a revision on a Quotation Ready quote */
      requestRevision: (id: string) => `/b2b/agency/quotes/${id}/revision`,
      /** Accept a Quotation Ready quote */
      accept: (id: string) => `/b2b/agency/quotes/${id}/accept`,
      /** Update quote status (accept/request revision) */
      status: (id: string) => `/b2b/agency/quotes/${id}/status`,
      /** Permanently delete a draft quote (DELETE) */
      delete: (id: string) => `/b2b/agency/quotes/${id}`,
    },
  },
} as const;
