import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devlumiq-ats-fallback-secret-change-in-production';
export const SESSION_COOKIE = 'ats_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Sign a session payload into a JWT string */
export function signSession(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** Verify + decode a JWT string. Returns null if invalid/expired. */
export function verifySession(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/** Cookie options shared across all session cookie writes */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  };
}

/** Resolve userId from cookie — supports JWT (new) and plain JSON (legacy) */
function resolveUserId(cookieValue: string): string | null {
  // Try JWT first
  const payload = verifySession(cookieValue);
  if (payload?.userId) return payload.userId;

  // Fallback: legacy plain JSON (old sessions before this update)
  try {
    const legacy = JSON.parse(cookieValue) as { userId?: string };
    return legacy?.userId ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
    if (!cookieValue) return null;

    const userId = resolveUserId(cookieValue);
    if (!userId) return null;

    // Demo user — no DB record needed
    if (userId === 'demo-user') {
      return { id: 'demo-user', name: 'Demo User', email: 'demo@devlumiq.com', role: 'RECRUITER' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return null;

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  } catch (error) {
    console.error('getSession error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser | null> {
  return getSession();
}

export async function requireRole(roles: string[]): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
}
