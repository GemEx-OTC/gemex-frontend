import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has('gemotc_session');

  // Protect client, dealer, and admin routes
  if (
    pathname.startsWith('/client') ||
    pathname.startsWith('/dealer') ||
    pathname.startsWith('/admin')
  ) {
    if (!hasSession) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/dealer/:path*',
    '/admin/:path*',
  ],
};
