/**
 * Lightweight JWT helpers (payload decode only — no signature verify).
 * Safe for client-side session countdown / cookie max-age alignment.
 */

export type JwtPayload = {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

function base64UrlDecode(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  if (typeof atob === "function") {
    return atob(padded);
  }
  const Buf = (globalThis as { Buffer?: { from: (s: string, enc: string) => { toString: (e: string) => string } } }).Buffer;
  if (Buf) {
    return Buf.from(padded, "base64").toString("utf8");
  }
  throw new Error("No base64 decoder available");
}

function base64UrlToJson(segment: string): unknown {
  return JSON.parse(base64UrlDecode(segment));
}

/** Decode JWT payload without verifying the signature. */
export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = base64UrlToJson(parts[1]);
    if (!payload || typeof payload !== "object") return null;
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/** Unix seconds expiry from JWT `exp`, or null if missing/invalid. */
export function getJwtExpirySeconds(token: string | null | undefined): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" && Number.isFinite(exp) ? exp : null;
}

/** Seconds until JWT expiry (min 1), or fallback when token has no exp. */
export function maxAgeSecondsFromJwt(
  token: string | null | undefined,
  fallbackSeconds: number
): number {
  const exp = getJwtExpirySeconds(token);
  if (exp == null) return Math.max(1, fallbackSeconds);
  return Math.max(1, exp - Math.floor(Date.now() / 1000));
}

/** Read a cookie value from `document.cookie` (browser only). */
export function readBrowserCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Clear a cookie on the current path (and common `/` path). */
export function clearBrowserCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}
