import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const COOKIE_NAME = 'trainack-token';

// Public paths that don't require authentication
const publicPaths = [
  '/login',
  '/sessions/', // public signing pages at /sessions/[id]/sign
  '/api/auth/login',
  '/api/auth/logout',
  '/api/sessions/', // public acknowledge API
];

function isPublicPath(pathname: string): boolean {
  // Exact matches
  if (pathname === '/login') return true;
  if (pathname.startsWith('/api/auth/')) return true;

  // Public session signing: /sessions/[id]/sign
  if (/^\/sessions\/[^/]+\/sign/.test(pathname)) return true;

  // Public acknowledge API: /api/sessions/[id]/acknowledge
  if (/^\/api\/sessions\/[^/]+\/acknowledge/.test(pathname)) return true;

  // Static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.startsWith('/img/') || pathname.includes('.')) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Invalid/expired token — redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (all Next.js internals: static, image, data, HMR, webpack)
     * - favicon.ico
     * - public folder assets (img, etc.)
     */
    '/((?!_next|favicon.ico|img/).*)',
  ],
};
