/**
 * B2C Web — client-side route constants.
 *
 * Usage: import { ROUTES } from '@/lib/routes';
 *        router.push(ROUTES.PACKAGE(slug));
 *        href={ROUTES.BLOGS}
 */
export const ROUTES = {
  // Static pages
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  B2B: '/b2b',

  // Package & activity browsing
  ALL_PACKAGES: '/allpackage',
  ACTIVITIES: '/activities',
  LIKED_PACKAGES: '/likePackage',

  // Blogs
  BLOGS: '/blogs',

  // Dynamic routes (functions returning the full path)
  PACKAGE: (slug: string) => `/package/${slug}`,
  ACTIVITY: (slug: string) => `/activity/${slug}`,
  BLOG: (slug: string) => `/blogs/${slug}`,
} as const;
