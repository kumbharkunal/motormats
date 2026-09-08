import { NextResponse, type NextRequest } from 'next/server';

// UX fast-reject only — auth is enforced server-side in route handlers and Server Actions.
const ACCESS_COOKIE = 'mm_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!request.cookies.has(ACCESS_COOKIE)) {
      const signIn = new URL('/sign-in', request.url);
      signIn.searchParams.set('next', pathname);
      return NextResponse.redirect(signIn);
    }
  }

  if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
    if (!request.cookies.has(ACCESS_COOKIE)) {
      const signIn = new URL('/sign-in', request.url);
      signIn.searchParams.set('next', pathname);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*'],
};
