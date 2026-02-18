import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    
    // Explicitly ignore static files and API routes just in case matcher misses something
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/api') ||
      pathname === '/favicon.ico' ||
      pathname === '/login'
    ) {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get('auth_session');
    const isAuthenticated = authCookie?.value === 'authenticated'; 

    if (!isAuthenticated) {
      // Use new URL() constructor with request.url as base for safer redirect
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware Error:', error);
    // Fail open or redirect to login to prevent 500 loop
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  // Enhanced matcher to be very specific
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
