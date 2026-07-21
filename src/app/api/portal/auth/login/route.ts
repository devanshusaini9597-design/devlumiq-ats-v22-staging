import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// POST /api/portal/auth/login - Login candidate portal
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`portal-login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
      );
    }

    const { email, password } = await request.json();

    // Find user
    const user = await prisma.candidatePortalUser.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await prisma.candidatePortalUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, type: 'candidate' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
