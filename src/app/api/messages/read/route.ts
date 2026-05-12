import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/messages/read - Mark messages as read
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { messageIds, threadId, markAll = false } = body;

    let where: any = {};

    if (markAll) {
      // Mark all unread inbound messages as read
      where = {
        isRead: false,
        direction: 'INBOUND',
        isDeleted: false,
      };
    } else if (messageIds && messageIds.length > 0) {
      where = {
        id: { in: messageIds },
        isRead: false,
      };
    } else if (threadId) {
      where = {
        threadId,
        isRead: false,
        direction: 'INBOUND',
      };
    } else {
      return NextResponse.json({ error: 'No messages specified' }, { status: 400 });
    }

    const result = await prisma.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      markedAsRead: result.count,
    });
  } catch (e) {
    console.error('POST /api/messages/read', e);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
