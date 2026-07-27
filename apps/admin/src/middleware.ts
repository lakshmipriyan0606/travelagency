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

  // Allow login pages through unconditionally
  if (pathname.startsWith('/b2c/admin/login') || pathname.startsWith('/b2b/admin/login')) {
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
    // Protect everything except static assets and Next internals
    '/((?!_next/static|_next/image|favicon.ico|b2c/admin/login|b2b/admin/login).*)',
  ],
};
