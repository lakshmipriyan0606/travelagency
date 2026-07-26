import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from '@travelagency/constants';

/**
 * B2C Customer Middleware
 * Protects customer-only routes (/dashboard).
 * Admin routes are no longer served by this application.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
