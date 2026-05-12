import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/auth';

/** POST /api/auth/register — create a new user account */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body?.name ?? '').toString().trim();
    const email = (body?.email ?? '').toString().trim().toLowerCase();
    const password = (body?.password ?? '').toString();

    if (!name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: 'RECRUITER',
      },
    });

    // Create a welcome notification for the new user
    await prisma.notification.create({
      data: {
        title: 'Welcome to the team!',
        message: `Hi ${name}, your account is ready. Start by adding your first candidate or explore the dashboard.`,
        type: 'success',
        href: '/dashboard',
      },
    }).catch(() => {});

    const token = signSession({ userId: user.id, email: user.email, name: user.name, role: user.role });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.name.slice(0, 2).toUpperCase() },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (e) {
    console.error('POST /api/auth/register', e);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
