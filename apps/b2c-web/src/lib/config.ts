/**
 * B2C Web — centralized app configuration.
 *
 * NEXT_PUBLIC_API_BASE_URL must be set at build time.
 * It should include the full path prefix used by all API calls,
 * e.g. "https://api.example.com/api"
 *
 * The axiosClient (from @travelagency/api-client) uses this as its baseURL,
 * so client-side paths are relative to it (e.g. "packages/bestpackages").
 *
 * Server-side fetch() calls in page.tsx / sitemap.ts use it directly,
 * building absolute URLs like `${config.apiBaseUrl}/packages/bestpackages`.
 *
 * Slug-based detail pages (package/[slug], blogs/[slug]) use the /v1/b2c/ prefix
 * on top of the base URL — this is an existing backend convention, preserved as-is.
 */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl && process.env.NODE_ENV !== 'development') {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL environment variable is required. ' +
    'Set it to the full API base URL including any path prefix, e.g. https://api.example.com/api'
  );
}

export const config = {
  apiBaseUrl: apiBaseUrl || 'http://localhost:5000/api',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;
