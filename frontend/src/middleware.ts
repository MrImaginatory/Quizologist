import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/signin', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('quizologist_token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the requested path is an auth page
  const isAuthPage = AUTH_PAGES.some(page => pathname.startsWith(page));

  // If user is authenticated and tries to access an auth page, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT authenticated and tries to access a protected page (non-auth, non-public)
  // Let's assume everything except auth pages and the root ('/') are protected for now.
  if (!token && !isAuthPage && pathname !== '/') {
    // allow access to public assets like favicon, _next, etc.
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/Quizologist.svg') ||
      pathname.startsWith('/public')
    ) {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|Quizologist.svg).*)',
  ],
};
