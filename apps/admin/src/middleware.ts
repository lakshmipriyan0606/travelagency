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

  // Allow login page through unconditionally
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect everything except static assets and Next internals
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
};
