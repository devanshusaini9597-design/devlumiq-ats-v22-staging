import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/with-permission';

/** GET /api/audit-logs — view activity logs (ADMIN only) */
export const GET = withPermission('VIEW_AUDIT_LOGS', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50'));
    const userId = searchParams.get('userId') ?? undefined;
    const action = searchParams.get('action') ?? undefined;

    const where = {
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.userActivityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.userActivityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        metadata: l.metadata,
        createdAt: l.createdAt.toISOString(),
        user: l.user,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error('GET /api/audit-logs', e);
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
});
