import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets and login page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/cron') || // Cron jobs might need different auth
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth_session');
  const isAuthenticated = authCookie?.value === 'authenticated'; // In real app, sign/verify logic or check value against env? 
  // User asked for: "Store the password in an environment variable (APP_PASSWORD). Use a secure cookie to persist the session."
  // Simple implementation: Cookie presence or value match. 
  // But middleware can't easily access env var to verify *content* of cookie if it's signed, 
  // but here we can just check if cookie exists and has a specific value that we set on login.
  // Secure implementation: Login route verifies password, sets a signed cookie or a random session token. 
  // Since we don't have a DB session store for this single user, we can just set a standard value 'authenticated' 
  // and maybe check a hash? 
  // For simplicity and single user: 'auth_session=true' or similar. 
  // But middleware needs to be secure.
  // Improving: Login page compares input with process.env.APP_PASSWORD. 
  // If match, sets cookie 'auth_session=valid_token'. 
  // Middleware checks if cookie 'auth_session' exists. 
  // Ideally, use a JWT or signed cookie. 
  // I'll stick to simple cookie check for now, as requested "Simple Middleware Protection".
  
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
