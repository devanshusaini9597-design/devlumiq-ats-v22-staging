import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/with-permission';

// GET /api/webhooks - Get all webhooks
export const GET = withPermission('MANAGE_INTEGRATIONS', async () => {
  try {
    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { eventsLog: true },
        },
      },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
});

// POST /api/webhooks - Create webhook
export const POST = withPermission('MANAGE_INTEGRATIONS', async (request: NextRequest) => {
  try {
    const { name, url, secret, events, headers, retryCount, timeout } = await request.json();

    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        secret,
        events,
        headers,
        retryCount: retryCount || 3,
        timeout: timeout || 30,
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
});

// DELETE /api/webhooks - Delete webhook
export const DELETE = withPermission('MANAGE_INTEGRATIONS', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
    }

    await prisma.webhook.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
});
