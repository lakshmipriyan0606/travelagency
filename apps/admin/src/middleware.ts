import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from '@travelagency/constants';
import {
  getTodayIstParts,
  isSameIstCalendarDay,
  parseDevopsDateSegment,
} from '@/features/devops/dateOtp';

/** Exact protected dashboards — require devops_session (no soft redirect to login). */
const DEVOPS_PROTECTED = new Set([
  '/devops',
  '/devops/capacity',
  '/devops/health',
  '/devops/api',
  '/devops/errors',
  '/devops/logs',
  '/devops/business',
  '/devops/traffic',
  '/devops/security',
  '/devops/queues',
  '/devops/deploy',
  '/devops/audit',
  '/devops/alerts',
]);

/** Step-up challenge UI — only while B2C session exists (mid-challenge). */
const DEVOPS_CHALLENGE = new Set(['/devops/challenge/otp']);

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Rewrite to a non-route so the root enterprise `not-found.tsx` renders (obscurity). */
function obscureNotFound(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/__obscure_not_found__';
  return NextResponse.rewrite(url);
}

function withDevopsHeaders(res: NextResponse) {
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

/** Public DevOps entry: `/devops/{today}/login` (Asia/Kolkata, D-M-YYYY | DD-MM-YYYY). */
function isTodayDevopsLogin(pathname: string): boolean {
  const m = /^\/devops\/(\d{1,2}-\d{1,2}-\d{4})\/login$/.exec(pathname);
  if (!m) return false;
  const parsed = parseDevopsDateSegment(m[1]);
  if (!parsed) return false;
  return isSameIstCalendarDay(parsed, getTodayIstParts());
}

/**
 * Admin Middleware
 * Protects all routes except /login.
 * Role validation happens inside Server Components via requireAdmin().
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Same-origin API proxy to backend — never auth-gate these
  if (pathname.startsWith('/api-proxy')) {
    return NextResponse.next();
  }

  // Allow auth pages through unconditionally
  const isPublicAuthPath =
    pathname.startsWith('/b2c/admin/login') ||
    pathname.startsWith('/b2c/admin/forgot-password') ||
    pathname.startsWith('/b2c/admin/reset-password') ||
    pathname.startsWith('/b2b/admin/login') ||
    pathname.startsWith('/b2b/admin/forgot-password') ||
    pathname.startsWith('/b2b/admin/reset-password');

  if (isPublicAuthPath) {
    return NextResponse.next();
  }

  // DevOps: exact-route allowlist + obscurity 404 (never redirect unknown paths to login).
  if (pathname.startsWith('/devops')) {
    const path = normalizePath(pathname);

    if (isTodayDevopsLogin(path)) {
      const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
      if (!token) {
        const login = new URL('/b2c/admin/login', request.url);
        login.searchParams.set('next', path);
        return NextResponse.redirect(login);
      }
      return withDevopsHeaders(NextResponse.next());
    }

    if (DEVOPS_CHALLENGE.has(path)) {
      const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
      if (!token) return obscureNotFound(request);
      return withDevopsHeaders(NextResponse.next());
    }

    if (DEVOPS_PROTECTED.has(path)) {
      const session = request.cookies.get('devops_session')?.value;
      if (!session) return obscureNotFound(request);
      return withDevopsHeaders(NextResponse.next());
    }

    // Wrong/malformed dated login or any other /devops/* → enterprise 404
    return obscureNotFound(request);
  }

  // Redirect root path to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/b2c/admin/dashboard', request.url));
  }

  if (pathname.startsWith('/b2b/admin')) {
    const token = request.cookies.get('b2b_access_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/b2b/admin/login', request.url));
    }
  } else {
    const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/b2c/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect everything except static assets, Next internals, public auth pages, and API proxy
    '/((?!_next/static|_next/image|favicon.ico|api-proxy|b2c/admin/login|b2c/admin/forgot-password|b2c/admin/reset-password|b2b/admin/login|b2b/admin/forgot-password|b2b/admin/reset-password).*)',
  ],
};
