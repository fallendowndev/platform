import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has('accessToken');

  // Public pages: redirect to dashboard if already logged in
  if (PUBLIC_PATHS.includes(pathname)) {
    if (hasToken) return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.next();
  }

  // Root → always redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasToken ? '/dashboard' : '/login', req.url));
  }

  // Protected pages: require token
  if (!hasToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|fonts|icons).*)'],
};
