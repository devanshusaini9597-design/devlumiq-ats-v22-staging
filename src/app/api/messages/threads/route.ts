import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const threads = await prisma.messageThread.findMany({
      orderBy: { lastMessageAt: 'desc' },
      where: {
        messages: { some: { isDeleted: false } },
      },
      include: {
        messages: {
          where: { isDeleted: false },
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                isDeleted: false,
                isRead: false,
                direction: 'INBOUND',
              },
            },
          },
        },
      },
    });

    const list = threads.map((t) => ({
      id: t.id,
      subject: t.subject,
      createdAt: t.createdAt.toISOString(),
      lastMessageAt: t.lastMessageAt.toISOString(),
      unreadCount: t._count.messages,
      lastMessage: t.messages[0]
        ? {
            id: t.messages[0].id,
            fromName: t.messages[0].fromName,
            fromEmail: t.messages[0].fromEmail,
            body: t.messages[0].body,
            direction: t.messages[0].direction,
            isRead: t.messages[0].isRead,
            sentAt: t.messages[0].sentAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ threads: list });
  } catch (e) {
    console.error('GET /api/messages/threads', e);
    return NextResponse.json({ error: 'Failed to load threads' }, { status: 500 });
  }
}

// POST /api/messages/threads - Create new thread with first message
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { subject, toEmail, message, attachments } = body;

    // Create thread
    const thread = await prisma.messageThread.create({
      data: {
        subject: subject || 'No Subject',
        lastMessageAt: new Date(),
      },
    });

    // Create first message
    const msg = await prisma.message.create({
      data: {
        threadId: thread.id,
        fromUserId: user.id,
        fromName: user.name || 'Recruiter',
        fromEmail: user.email,
        toEmail,
        body: message,
        direction: 'OUTBOUND',
        status: 'sent',
        attachments: attachments || [],
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      thread: {
        id: thread.id,
        subject: thread.subject,
        createdAt: thread.createdAt.toISOString(),
        lastMessageAt: thread.lastMessageAt.toISOString(),
        unreadCount: 0,
        lastMessage: {
          id: msg.id,
          fromName: msg.fromName,
          fromEmail: msg.fromEmail,
          body: msg.body,
          direction: msg.direction,
          isRead: true,
          sentAt: msg.sentAt.toISOString(),
        },
      },
    }, { status: 201 });
  } catch (e) {
    console.error('POST /api/messages/threads', e);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}
