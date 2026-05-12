import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/docusign',
  '/api/auth/docusign/callback',
  '/api/webhooks',
  '/api/zapier/webhook',
  '/api/careers',
  '/api/jobs/public',
];

/** Edge-compatible session check — no Node.js crypto needed.
 *  JWT signature verification happens inside getSession() (server-side).
 *  Middleware only needs to confirm a token EXISTS and isn't expired,
 *  which is safe to do by base64-decoding the payload without verifying the sig. */
function extractSession(cookieValue: string): { userId: string; role: string; exp?: number } | null {
  // JWT format: three dot-separated base64url segments
  const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (JWT_RE.test(cookieValue)) {
    try {
      const payloadB64 = cookieValue.split('.')[1];
      const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(json) as { userId?: string; role?: string; exp?: number };
      if (!payload.userId) return null;
      if (payload.exp && payload.exp < Date.now() / 1000) return null;
      return { userId: payload.userId, role: payload.role ?? 'VIEWER', exp: payload.exp };
    } catch { return null; }
  }

  // Legacy plain JSON (backward compat — still accepted until user re-logs in)
  try {
    const session = JSON.parse(cookieValue) as { userId?: string; role?: string };
    if (!session.userId) return null;
    return { userId: session.userId, role: session.role ?? 'VIEWER' };
  } catch { return null; }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isProtectedApi =
    pathname.startsWith('/api') &&
    !PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isDashboard && !isProtectedApi) return NextResponse.next();

  const cookieValue = request.cookies.get('ats_session')?.value;
  const session = cookieValue ? extractSession(cookieValue) : null;

  if (!session) {
    if (isDashboard) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Forward role in a read-only header so server components can read it without a DB call
  const res = NextResponse.next();
  res.headers.set('x-user-id', session.userId);
  res.headers.set('x-user-role', session.role);
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
