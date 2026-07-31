/**
 * @travelagency/utils
 *
 * Shared utility functions used across all applications.
 * Each utility has a single responsibility and its own module.
 */

export { cn } from "./cn";
export {
  decodeJwtPayload,
  getJwtExpirySeconds,
  maxAgeSecondsFromJwt,
  readBrowserCookie,
  clearBrowserCookie,
  type JwtPayload,
} from "./jwt";
