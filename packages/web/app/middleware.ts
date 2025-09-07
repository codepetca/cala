import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  if (path.startsWith('/share/')) {
    return NextResponse.next();
  }

  if (path.startsWith('/plans/') || path.startsWith('/workspace/')) {
    const token = req.cookies.get('convex-auth');
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/plans/:path*', '/workspace/:path*'],
};