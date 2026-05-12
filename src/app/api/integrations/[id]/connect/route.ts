import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/integrations/[id]/connect — persist connection in Integration table
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const provider = id.toUpperCase();

    // Upsert: mark as active (real OAuth tokens would be stored here per-provider)
    await prisma.integration.upsert({
      where: { userId_provider: { userId: user.id, provider } },
      create: {
        userId: user.id,
        provider,
        accessToken: 'connected',
        expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      update: { isActive: true, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, integrationId: id, connected: true });
  } catch (e) {
    console.error('POST /api/integrations/[id]/connect', e);
    return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 });
  }
}

// DELETE /api/integrations/[id]/connect — soft-disconnect
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const provider = id.toUpperCase();

    await prisma.integration.updateMany({
      where: { userId: user.id, provider },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true, integrationId: id, connected: false });
  } catch (e) {
    console.error('DELETE /api/integrations/[id]/connect', e);
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
  }
}
