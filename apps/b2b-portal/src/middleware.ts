import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from './lib/auth/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN || 'access_token')?.value;
  const status = request.cookies.get('agency_status')?.value;
  const path = request.nextUrl.pathname;

  // Let authentication endpoints go through
  if (path.startsWith('/login') || path.startsWith('/register')) {
    return NextResponse.next();
  }

  // Require login token for protected sections
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Enforce page restrictions based on Agency application status
  if (status === 'needs_correction') {
    if (!path.startsWith('/correction')) {
      return NextResponse.redirect(new URL('/correction', request.url));
    }
  } else if (status === 'rejected') {
    if (!path.startsWith('/reapply')) {
      return NextResponse.redirect(new URL('/reapply', request.url));
    }
  } else if (status === 'pending') {
    if (!path.startsWith('/pending-approval')) {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
  } else if (status === 'suspended') {
    if (!path.startsWith('/suspended')) {
      return NextResponse.redirect(new URL('/suspended', request.url));
    }
  } else {
    // If status is active, redirect away from correction/reapply/pending screens
    if (
      path.startsWith('/correction') ||
      path.startsWith('/reapply') ||
      path.startsWith('/pending-approval') ||
      path.startsWith('/suspended')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/correction/:path*',
    '/reapply/:path*',
    '/pending-approval/:path*',
    '/suspended/:path*',
  ],
};
