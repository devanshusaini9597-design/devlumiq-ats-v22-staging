/**
 * CSRF Protection — Origin-based validation
 *
 * Next.js App Router API routes automatically reject requests without a valid
 * body when using `request.json()`. This module adds an extra layer by
 * validating the Origin / Referer header against the configured app URL.
 *
 * Usage in API routes:
 *   import { validateCsrf } from '@/lib/csrf';
 *
 *   export async function POST(request: NextRequest) {
 *     const csrfError = validateCsrf(request);
 *     if (csrfError) return csrfError;
 *     // ... handle request
 *   }
 *
 * This is a lightweight approach suited to SPA/cookie-based auth.
 * For form-based flows, consider adding a double-submit cookie pattern.
 */

import { NextRequest, NextResponse } from 'next/server';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Validates that mutating requests come from the same origin.
 * Returns null if valid, or a 403 NextResponse if invalid.
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Safe methods don't need CSRF protection
  if (SAFE_METHODS.has(request.method)) return null;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // In development, allow requests without origin (e.g., Postman, curl)
  if (process.env.NODE_ENV === 'development') return null;

  // At least one of origin or referer must be present
  if (!origin && !referer) {
    return NextResponse.json(
      { error: 'Forbidden — missing Origin header' },
      { status: 403 }
    );
  }

  // Validate origin matches app URL
  const requestOrigin = origin || new URL(referer!).origin;

  if (appUrl && !requestOrigin.startsWith(new URL(appUrl).origin)) {
    return NextResponse.json(
      { error: 'Forbidden — origin mismatch' },
      { status: 403 }
    );
  }

  return null;
}
