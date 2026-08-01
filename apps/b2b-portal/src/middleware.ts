import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from '@travelagency/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('b2b_portal_access_token')?.value;
  const status = request.cookies.get('agency_status')?.value;
  const path = request.nextUrl.pathname;

  // Redirect already authenticated users away from login/register pages
  if (token && (path.startsWith('/login') || path.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Let authentication endpoints go through if they don't have a token
  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  ) {
    return NextResponse.next();
  }

  // Require login token for protected sections (except pending approval and suspended states)
  if (!token) {
    if (path.startsWith('/pending-approval') && status === 'pending') {
      return NextResponse.next();
    }
    if (path.startsWith('/suspended') && status === 'suspended') {
      return NextResponse.next();
    }
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
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/quotes/:path*',
    '/custom-package/:path*',
    '/proposals/:path*',
    '/correction/:path*',
    '/reapply/:path*',
    '/pending-approval/:path*',
    '/suspended/:path*',
  ],
};
