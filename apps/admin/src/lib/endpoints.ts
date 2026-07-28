export const ENDPOINTS = {
  server: {
    session: '/v1/b2c-admin/auth/session',
    b2bMe: '/b2b/admin/me',
    bookingsAll: '/v1/b2c/bookings/all',
    destinations: '/v1/b2c/destinations',
    reviews: '/v1/b2c/reviews',
    packageById: (id: string) => `/v1/b2c-admin/packages/${id}`,
    packages: '/admin/packages',
    activities: '/admin/packages?type=activity',
  },
  client: {
    websiteHero: {
      active: (t: number) => `/website-hero/active?t=${t}`,
      list: '/admin/website-hero',
      byId: (id: string) => `/admin/website-hero/${id}`,
    },
    reviews: {
      adminList: '/reviews/admin',
      create: '/reviews',
      byId: (id: string) => `/reviews/${id}`,
      move: (id: string) => `/reviews/${id}/move`,
      normalize: '/reviews/normalize',
    },
    upload: {
      image: '/upload/image',
      all: (params?: { folder?: string; limit?: number; nextCursor?: string }) => {
        const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return `/upload/all${q}`;
      },
    },
    stories: {
      list: '/admin/stories',
      byId: (id: string) => `/admin/stories/${id}`,
      move: (id: string) => `/admin/stories/${id}/move`,
      normalize: '/admin/stories/normalize',
      public: '/stories',
    },
    destinations: {
      list: '/destinations',
      byId: (id: string) => `/destinations/${id}`,
      move: (id: string) => `/destinations/${id}/move`,
      normalize: '/destinations/normalize',
    },
    analytics: {
      daily: '/analytics/daily',
      apiUsage: '/analytics/api-usage',
    },
    bookings: {
      admin: '/auth/admin/bookings',
    },
    metrics: {
      dashboard: 'admin/metrics',
      queueHealth: 'admin/queue/health',
    },
    blogs: {
      list: '/blogs',
      adminList: 'admin/blogs',
      adminById: (id: string) => `admin/blogs/${id}`,
      byId: (id: string) => `/blogs/${id}`,
      bySlug: (slug: string) => `/blogs/${slug}`,
      like: (id: string) => `/blogs/${id}/like`,
      legacyAdminById: (id: string) => `/blogs/admin/${id}`,
    },
    uiConfig: {
      hero: 'ui-config/website-hero',
      adminHero: 'admin/ui-config/website-hero',
    },
    b2b: {
      login: 'b2b/admin/login',
      logout: 'b2b/admin/logout',
      refresh: 'b2b/admin/refresh',
      agencies: 'b2b/admin/agencies',
      agencyAction: (id: string, action: 'approve' | 'reject' | 'suspend' | 'reactivate') => `b2b/admin/agencies/${id}/${action}`,
      agencyStatusLog: (id: string) => `b2b/admin/agencies/${id}/status-log`,
    },
    auth: {
      login: 'admin/login',
      register: 'admin/register',
      logout: 'admin/logout',
      session: 'admin/session',
      createPackage: 'admin/packages/create',
      updatePackage: (id: string) => `admin/packages/updatePackage/${id}`,
      packageById: (id: string) => `admin/packages/${id}`,
      deletePackage: (id: string) => `admin/packages/deletePackage/${id}`,
      updateRank: (id: string) => `admin/packages/updateRank/${id}`,
      toggleStatus: (id: string) => `admin/packages/toggleStatus/${id}`,
      takenRanks: 'admin/packages/takenRanks',
      bookingsAll: 'admin/bookings/all',
    },
  },
} as const;
