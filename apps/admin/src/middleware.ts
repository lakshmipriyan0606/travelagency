import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from '@travelagency/constants';

/**
 * Admin Middleware
 * Protects all routes except /login.
 * Role validation happens inside Server Components via requireAdmin().
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    // Protect everything except static assets, Next internals, and public auth pages
    '/((?!_next/static|_next/image|favicon.ico|b2c/admin/login|b2c/admin/forgot-password|b2c/admin/reset-password|b2b/admin/login|b2b/admin/forgot-password|b2b/admin/reset-password).*)',
  ],
};
