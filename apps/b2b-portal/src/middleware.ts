import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIES } from './lib/auth/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

  if (request.nextUrl.pathname.startsWith("/login")) { return NextResponse.next(); } 
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*'
  ],
};
