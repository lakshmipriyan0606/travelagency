/**
 * B2C Web — centralized API endpoint constants.
 *
 * TWO CALLING CONVENTIONS — intentional, not inconsistent:
 *
 * ENDPOINTS.server.*
 *   Used by Next.js server components and sitemap.ts via raw fetch().
 *   These are FUNCTIONS that return absolute URL strings, built from config.apiBaseUrl.
 *   They include the { next: { revalidate } } option on the fetch call at the use site.
 *   Slug-based detail pages (/package/[slug], /blogs/[slug]) use the /v1/b2c/ path prefix
 *   — this is an existing backend convention, preserved as-is.
 *
 * ENDPOINTS.client.*
 *   Used by client components via axiosClient (from @travelagency/api-client).
 *   These are plain path strings relative to NEXT_PUBLIC_API_BASE_URL.
 *   axiosClient has this base URL set, so you pass e.g. "packages/bestpackages".
 */

import { config } from './config';

export const ENDPOINTS = {
  /**
   * Server-side fetch() endpoints (absolute URL builders).
   * Always called inside async server components / sitemap.ts.
   * Preserve the { next: { revalidate } } options at the call site.
   */
  server: {
    // Home page — SSG with 1h revalidation
    bestPackages: () => `${config.apiBaseUrl}/packages/bestpackages`,
    bestActivities: () => `${config.apiBaseUrl}/packages/bestactivities`,
    reviews: () => `${config.apiBaseUrl}/reviews?status=Published`,

    // Slug-based detail pages — SSG per-slug, 1h revalidation
    // Note: these use the /v1/b2c/ prefix — existing backend convention
    packageBySlug: (slug: string) => `${config.apiBaseUrl}/v1/b2c/packages/${slug}`,
    blogBySlug: (slug: string) => `${config.apiBaseUrl}/v1/b2c/blogs/${slug}`,
    blogsByCategory: (category: string, limit = 4) =>
      `${config.apiBaseUrl}/v1/b2c/blogs?category=${encodeURIComponent(category)}&limit=${limit}`,
    recentBlogs: (limit = 4) => `${config.apiBaseUrl}/v1/b2c/blogs?limit=${limit}`,

    // Sitemap — 1h revalidation
    sitemapPackages: (limit = 1000) => `${config.apiBaseUrl}/packages?limit=${limit}`,
    sitemapBlogs: (limit = 1000) => `${config.apiBaseUrl}/blogs?limit=${limit}`,
  },

  /**
   * Client-side axiosClient endpoints (relative path strings).
   * Used in api/user/api.tsx, api/blog.api.ts, api/story.api.ts, api/websiteHero.api.ts.
   * axiosClient baseURL is NEXT_PUBLIC_API_BASE_URL, so these are relative to it.
   */
  client: {
    // Packages (public read)
    bestPackages: 'packages/bestpackages',
    bestActivities: 'packages/bestactivities',
    packages: 'packages',                          // + query params (pagination, search, city, etc.)
    packageLikeCount: 'packages/likeCount',
    packageLiked: 'packages/liked',               // + query params
    packageLike: 'packages/like',                  // POST
    packageSuggestions: (query: string) => `packages/suggestions?q=${encodeURIComponent(query)}`,
    activityCategories: 'packages/activitycategories',

    // Reviews (public read)
    reviews: 'reviews',                            // + params: { status: 'Published' }

    // Blogs (public read + like)
    blogs: '/blogs',                               // + params (pagination, search, category, sortBy)
    blogBySlug: (slug: string) => `/blogs/${slug}`,
    blogLike: (id: string) => `/blogs/${id}/like`, // POST

    // Stories (public read)
    stories: '/stories',

    // Website Hero (public read)
    websiteHeroActive: 'website-hero/active',       // + cache-buster ?t= appended at call site

    // Bookings
    bookingCreate: 'bookings/create',               // POST

    // Newsletter
    newsletterSubscribe: 'newsletter/subscribe',    // POST

    // Visitor analytics beacon
    analyticsVisit: 'analytics/visit',              // POST
  },
} as const;
