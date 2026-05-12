import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withPermission } from '@/lib/with-permission';
import { ROLES } from '@/lib/roles';

/** GET /api/users — list all users (ADMIN only) */
export const GET = withPermission('MANAGE_USERS', async () => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (e) {
    console.error('GET /api/users', e);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
});

/** POST /api/users — invite/create a new user (ADMIN only) */
export const POST = withPermission('MANAGE_USERS', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const name = (body?.name ?? '').toString().trim();
    const email = (body?.email ?? '').toString().trim().toLowerCase();
    const role = (body?.role ?? 'RECRUITER').toString().toUpperCase();
    const password = (body?.password ?? '').toString();

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    if (!Object.keys(ROLES).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const finalPassword = password.length >= 6 ? password : 'Welcome123!';
    const passwordHash = await bcrypt.hash(finalPassword, 12);

    const user = await prisma.user.create({
      data: { name, email, password: passwordHash, role: role as keyof typeof ROLES },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    await prisma.notification.create({
      data: {
        title: 'Welcome to the team!',
        message: `Hi ${name}, your account has been created. Your temporary password is: ${finalPassword}`,
        type: 'success',
        userId: user.id,
        href: '/dashboard',
      },
    }).catch(() => {});

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error('POST /api/users', e);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
