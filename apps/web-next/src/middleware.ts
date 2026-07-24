import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from './lib/auth/constants';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

  if (request.nextUrl.pathname.startsWith("/admin/login")) { return NextResponse.next(); } 
  if (!token) {
    // If there is no token, redirect to the login page
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Token is present, we let the request through.
  // We don't decode the JWT on the Edge because standard JWT libraries often rely on Node APIs.
  // The exact role validation happens inside the Server Component via requireAdmin().
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*'
  ],
};


