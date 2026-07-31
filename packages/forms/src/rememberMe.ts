/**
 * Client-side "Remember me" helpers.
 * Persists email + preference in localStorage and returns cookie max-age values.
 */

export const REMEMBER_COOKIE_MAX_AGE = {
  /**
   * Access-token cookie fallback when JWT `exp` is unavailable.
   * Prefer `maxAgeSecondsFromJwt(accessToken, …)` at set-time — access JWTs are
   * ~1h (B2B / B2C), not multi-day.
   */
  accessDefault: 60 * 60,
  /** Refresh token cookie when remember is off (7 days) */
  refreshDefault: 60 * 60 * 24 * 7,
  /** Access token cookie fallback when remember is on */
  accessRemember: 60 * 60,
  /** Refresh token cookie when remember is on (30 days) */
  refreshRemember: 60 * 60 * 24 * 30,
} as const;

export function rememberStorageKeys(namespace: string) {
  return {
    email: `${namespace}_remember_email`,
    enabled: `${namespace}_remember_enabled`,
  };
}

export function loadRememberedEmail(namespace: string): {
  email: string;
  remember: boolean;
} {
  if (typeof window === "undefined") {
    return { email: "", remember: false };
  }
  const keys = rememberStorageKeys(namespace);
  const remember = window.localStorage.getItem(keys.enabled) === "1";
  const email = remember ? window.localStorage.getItem(keys.email) || "" : "";
  return { email, remember };
}

export function persistRememberPreference(
  namespace: string,
  remember: boolean,
  email: string
): void {
  if (typeof window === "undefined") return;
  const keys = rememberStorageKeys(namespace);
  if (remember) {
    window.localStorage.setItem(keys.enabled, "1");
    window.localStorage.setItem(keys.email, email.trim().toLowerCase());
  } else {
    window.localStorage.removeItem(keys.enabled);
    window.localStorage.removeItem(keys.email);
  }
}

export function cookieMaxAges(remember: boolean): {
  accessMaxAge: number;
  refreshMaxAge: number;
} {
  return remember
    ? {
        accessMaxAge: REMEMBER_COOKIE_MAX_AGE.accessRemember,
        refreshMaxAge: REMEMBER_COOKIE_MAX_AGE.refreshRemember,
      }
    : {
        accessMaxAge: REMEMBER_COOKIE_MAX_AGE.accessDefault,
        refreshMaxAge: REMEMBER_COOKIE_MAX_AGE.refreshDefault,
      };
}
