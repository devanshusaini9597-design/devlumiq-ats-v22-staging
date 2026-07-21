import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/with-permission';

/**
 * GET /api/admin/gdpr/export?userId=
 * ADMIN only — export all personal data for a given user (GDPR Article 20 — Data Portability).
 */
export const GET = withPermission('MANAGE_USERS', async (request: NextRequest, _ctx, session) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true,
      organizationId: true,
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        select: { action: true, metadata: true, createdAt: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Org-scope guard
  if (session.organizationId && user.organizationId !== session.organizationId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const candidates = await prisma.candidate.findMany({
    where: { organizationId: user.organizationId ?? undefined },
    select: {
      id: true, name: true, email: true, phone: true, createdAt: true, source: true,
      applications: { select: { stage: true, appliedAt: true, job: { select: { title: true } } } },
    },
  });

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.email,
    subject: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      activityLogs: user.activityLogs,
    },
    associatedCandidates: candidates,
  };

  await prisma.userActivityLog.create({
    data: { userId: session.id, action: 'gdpr_export', metadata: { targetUserId: userId } },
  }).catch(() => {});

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="gdpr-export-${userId}-${Date.now()}.json"`,
    },
  });
});
