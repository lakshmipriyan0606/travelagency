export const ROUTES = {
  login: '/b2c/admin/login',
  forgotPassword: '/b2c/admin/forgot-password',
  resetPassword: '/b2c/admin/reset-password',
  dashboard: '/b2c/admin/dashboard',
  unauthorized: '/b2c/admin/unauthorized',
  packages: {
    list: '/b2c/admin/packages',
    new: '/b2c/admin/packages/new',
    edit: (id: string) => `/b2c/admin/packages/${id}`,
  },
  activities: {
    list: '/b2c/admin/activities',
    new: '/b2c/admin/activities/new',
    edit: (id: string) => `/b2c/admin/activities/${id}`,
  },
  blogs: {
    list: '/b2c/admin/blogs',
    new: '/b2c/admin/blogs/new',
    edit: (id: string) => `/b2c/admin/blogs/${id}`,
  },
  destinations: {
    list: '/b2c/admin/destinations',
    new: '/b2c/admin/destinations/new',
    edit: (id: string) => `/b2c/admin/destinations/${id}`,
  },
  stories: {
    list: '/b2c/admin/stories',
    new: '/b2c/admin/stories/new',
    edit: (id: string) => `/b2c/admin/stories/${id}`,
  },
  reviews: {
    list: '/b2c/admin/reviews',
    new: '/b2c/admin/reviews/new',
    edit: (id: string) => `/b2c/admin/reviews/${id}`,
  },
  bookings: '/b2c/admin/bookings',
  media: '/b2c/admin/media',
  website: {
    hero: '/b2c/admin/website/hero',
  },
  b2b: {
    prefix: '/b2b/admin',
    login: '/b2b/admin/login',
    forgotPassword: '/b2b/admin/forgot-password',
    resetPassword: '/b2b/admin/reset-password',
    dashboard: '/b2b/admin/dashboard',
    agencyDetails: '/b2b/admin/agency-details',
    cities: '/b2b/admin/cities',
    hotels: '/b2b/admin/hotels',
    packages: '/b2b/admin/packages',
    proposals: '/b2b/admin/proposals',
    agencyDetail: (params?: {
      agencyId?: string;
      /** Preferred deep-link section on the agency detail page */
      section?: 'info' | 'quotes' | 'packages' | 'activity';
      /** @deprecated Use `section` — still accepted for older call sites */
      tab?: 'quotes' | 'packages' | 'details' | 'log' | 'info' | 'activity';
      quoteId?: string;
    }) => {
      const base = '/b2b/admin/agency-details';
      if (!params) return base;
      const qs = new URLSearchParams();
      if (params.agencyId) qs.set('agencyId', params.agencyId);
      const section =
        params.section ??
        (params.tab === 'details'
          ? 'info'
          : params.tab === 'log'
            ? 'activity'
            : params.tab);
      if (section && section !== 'info') qs.set('section', section);
      if (params.quoteId) qs.set('quoteId', params.quoteId);
      const query = qs.toString();
      return query ? `${base}?${query}` : base;
    },
  }
} as const;
