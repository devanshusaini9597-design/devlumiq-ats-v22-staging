import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';

const DEMO_EMAIL = 'demo@devlumiq.com';
const DEMO_PASSWORD = 'demo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email ?? '').toString().trim().toLowerCase();
    const password = (body?.password ?? '').toString();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'Password is required' }, { status: 400 });

    // ── Demo bypass ──────────────────────────────────────────────────────────
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = signSession({ userId: 'demo-user', email: DEMO_EMAIL, name: 'Demo User', role: 'RECRUITER' });
      const res = NextResponse.json({
        user: { id: 'demo-user', name: 'Demo User', email: DEMO_EMAIL, role: 'RECRUITER', initials: 'DU' },
      });
      res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
      return res;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated. Contact your administrator.' }, { status: 403 });
    }

    if (user.password) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    } else {
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    }

    // Update last login timestamp
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

    // Log activity
    await prisma.userActivityLog.create({
      data: { userId: user.id, action: 'login', metadata: { method: 'password' } },
    }).catch(() => {});

    const token = signSession({ userId: user.id, email: user.email, name: user.name, role: user.role });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.name.slice(0, 2).toUpperCase() },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (e) {
    console.error('POST /api/auth/login', e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
