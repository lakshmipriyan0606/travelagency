export const ROUTES = {
  login: '/b2c/admin/login',
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
    dashboard: '/b2b/admin/dashboard',
  }
} as const;
