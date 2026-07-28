/**
 * B2C Web — local apiClient wrapper.
 *
 * Re-exports the shared axios client from @travelagency/api-client.
 * All client-side API call files (api/user/api.tsx, api/blog.api.ts, etc.)
 * should import from here rather than directly from @travelagency/api-client,
 * so that interceptors or auth logic can be customised per-app in one place.
 */
export { default } from '@travelagency/api-client';
