import { NextRequest, NextResponse } from 'next/server';
import { validateCsrf, isCsrfExemptPath } from '@/lib/csrf';

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
  '/api/portal',
  '/api/auth/sso',
  '/api/auth/validate',
  '/api/linkedin/import',
];

/** Token-gated assessment APIs: /api/assessments/<48-hex>/(answer|submit|run)? */
function isPublicAssessmentTokenApi(pathname: string): boolean {
  return /^\/api\/assessments\/[a-f0-9]{32,64}(\/(answer|submit|run|proctoring-event))?\/?$/.test(pathname);
}

/** Edge-compatible session check — no Node.js crypto needed. */
function extractSession(cookieValue: string): { userId: string; role: string; organizationId?: string | null; exp?: number } | null {
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

  // Universal CSRF for mutating /api/* (cookie sessions). Bearer + exempt paths skip.
  if (pathname.startsWith('/api') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    if (!isCsrfExemptPath(pathname)) {
      const csrfError = validateCsrf(request);
      if (csrfError) return csrfError;
    }
  }

  const isDashboard = pathname.startsWith('/dashboard');
  const isProtectedApi =
    pathname.startsWith('/api') &&
    !PUBLIC_API_PATHS.some((p) => pathname.startsWith(p)) &&
    !isPublicAssessmentTokenApi(pathname);

  if (!isDashboard && !isProtectedApi) return NextResponse.next();

  const cookieValue = request.cookies.get('ats_session')?.value;
  const session = cookieValue ? extractSession(cookieValue) : null;
  const hasBearer = request.headers.get('authorization')?.startsWith('Bearer ');

  // Chrome extension / API keys: let route handlers validate Bearer (no cookie required)
  if (!session && hasBearer && isProtectedApi) {
    return NextResponse.next();
  }

  if (!session) {
    if (isDashboard) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.role;

  const adminOnlyPaths = ['/dashboard/settings/users', '/dashboard/settings/audit-log'];
  const isAdminOnly = adminOnlyPaths.some((p) => pathname.startsWith(p));
  if (isAdminOnly && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const managersOnlyPaths = ['/dashboard/settings'];
  const isManagersOnly = managersOnlyPaths.some((p) => pathname.startsWith(p));
  const managerRoles = ['ADMIN', 'RECRUITER', 'HIRING_MANAGER'];
  if (isManagersOnly && !managerRoles.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const analyticsOnlyPaths = ['/dashboard/analytics', '/dashboard/reports'];
  const isAnalyticsOnly = analyticsOnlyPaths.some((p) => pathname.startsWith(p));
  const analyticsRoles = ['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'VIEWER'];
  if (isAnalyticsOnly && !analyticsRoles.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const res = NextResponse.next();
  res.headers.set('x-user-id', session.userId);
  res.headers.set('x-user-role', session.role);
  if (session.organizationId) res.headers.set('x-org-id', session.organizationId);
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
