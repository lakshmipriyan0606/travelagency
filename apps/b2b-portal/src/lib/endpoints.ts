export const ENDPOINTS = {
  client: {
    login: '/b2b/agency/login',
    register: '/b2b/agency/register',
    me: '/b2b/agency/me',
    issues: '/b2b/agency/me/issues',
    resubmit: '/b2b/agency/me/resubmit',
    rejectionReason: '/b2b/agency/me/rejection-reason',
    reapply: '/b2b/agency/me/reapply',
  }
} as const;
