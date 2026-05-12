import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
    if (!cookieValue) return NextResponse.json({ user: null });

    // Try JWT verification
    const payload = verifySession(cookieValue);
    let userId: string | null = payload?.userId ?? null;

    // Fallback: legacy plain JSON
    if (!userId) {
      try {
        const legacy = JSON.parse(cookieValue) as { userId?: string };
        userId = legacy?.userId ?? null;
      } catch { /* not JSON */ }
    }

    if (!userId) return NextResponse.json({ user: null });

    // Demo user — no DB record
    if (userId === 'demo-user') {
      return NextResponse.json({
        user: { id: 'demo-user', name: 'Demo User', email: 'demo@devlumiq.com', role: 'RECRUITER', initials: 'DU' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.name.slice(0, 2).toUpperCase(),
      },
    });
  } catch (e) {
    console.error('GET /api/auth/session', e);
    return NextResponse.json({ user: null });
  }
}
