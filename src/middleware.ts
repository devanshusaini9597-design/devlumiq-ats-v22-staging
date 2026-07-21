import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/demo',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/docusign',
  '/api/auth/docusign/callback',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/setup-account',
  '/api/auth/resend-verification',
  '/api/webhooks',
  '/api/billing/webhook',
  '/api/zapier/webhook',
  '/api/careers',
  '/api/jobs/public',
  '/api/health',
  '/api/assessments/take',
  '/api/dei/self-id',
  '/api/webhooks/meetings',
  '/api/cron/retention',
];

/** Token-gated assessment APIs: /api/assessments/<48-hex>/(answer|submit|run)? */
function isPublicAssessmentTokenApi(pathname: string): boolean {
  return /^\/api\/assessments\/[a-f0-9]{32,64}(\/(answer|submit|run))?\/?$/.test(pathname);
}

/** Edge-compatible session check — no Node.js crypto needed.
 *  JWT signature verification happens inside getSession() (server-side).
 *  Middleware only needs to confirm a token EXISTS and isn't expired,
 *  which is safe to do by base64-decoding the payload without verifying the sig. */
function extractSession(cookieValue: string): { userId: string; role: string; organizationId?: string | null; exp?: number } | null {
  // JWT format only — three dot-separated base64url segments
  const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (!JWT_RE.test(cookieValue)) return null;
  try {
    const payloadB64 = cookieValue.split('.')[1];
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { userId?: string; role?: string; organizationId?: string | null; exp?: number };
    if (!payload.userId) return null;
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return { userId: payload.userId, role: payload.role ?? 'VIEWER', organizationId: payload.organizationId ?? null, exp: payload.exp };
  } catch { return null; }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isProtectedApi =
    pathname.startsWith('/api') &&
    !PUBLIC_API_PATHS.some((p) => pathname.startsWith(p)) &&
    !isPublicAssessmentTokenApi(pathname);

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

  // Phase 3: Role-based route guards for specific dashboard routes
  const role = session.role;

  // ADMIN-only paths
  const adminOnlyPaths = ['/dashboard/settings/users', '/dashboard/settings/audit-log'];
  const isAdminOnly = adminOnlyPaths.some((p) => pathname.startsWith(p));
  if (isAdminOnly && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Settings section — ADMIN, RECRUITER, HIRING_MANAGER only (not INTERVIEWER or VIEWER)
  const managersOnlyPaths = ['/dashboard/settings'];
  const isManagersOnly = managersOnlyPaths.some((p) => pathname.startsWith(p));
  const managerRoles = ['ADMIN', 'RECRUITER', 'HIRING_MANAGER'];
  if (isManagersOnly && !managerRoles.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Analytics / Reports — requires VIEW_ANALYTICS permission (INTERVIEWER is excluded)
  const analyticsOnlyPaths = ['/dashboard/analytics', '/dashboard/reports'];
  const isAnalyticsOnly = analyticsOnlyPaths.some((p) => pathname.startsWith(p));
  const analyticsRoles = ['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'VIEWER'];
  if (isAnalyticsOnly && !analyticsRoles.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Forward session fields in read-only headers so server components can read without a DB call
  const res = NextResponse.next();
  res.headers.set('x-user-id', session.userId);
  res.headers.set('x-user-role', session.role);
  if (session.organizationId) res.headers.set('x-org-id', session.organizationId);
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
