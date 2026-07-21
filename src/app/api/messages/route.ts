import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/messages - Create new message
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { threadId, toEmail, subject, body: messageBody, attachments, candidateId } = body;

    // If no threadId, create new thread
    let thread;
    if (!threadId) {
      thread = await prisma.messageThread.create({
        data: {
          subject: subject || 'No Subject',
          organizationId: user.organizationId ?? undefined,
          candidateId: typeof candidateId === 'string' ? candidateId : undefined,
          lastMessageAt: new Date(),
        },
      });
    } else {
      thread = await prisma.messageThread.findFirst({
        where: {
          id: threadId,
          ...(user.organizationId ? { organizationId: user.organizationId } : {}),
        },
      });
      if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      }
    }

    // Create message (email channel — SMS/WhatsApp use dedicated routes)
    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        fromUserId: user.id,
        fromName: user.name || 'Recruiter',
        fromEmail: user.email,
        toEmail,
        channel: 'EMAIL',
        body: messageBody,
        direction: 'OUTBOUND',
        status: 'sent',
        attachments: attachments || [],
        sentAt: new Date(),
      },
    });

    // Update thread lastMessageAt
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ message, thread }, { status: 201 });
  } catch (e) {
    console.error('POST /api/messages', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// GET /api/messages - Get all messages with filtering
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const search = searchParams.get('search');
    const direction = searchParams.get('direction');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const orgFilter = user.organizationId
      ? { thread: { organizationId: user.organizationId } }
      : {};

    const where: Record<string, unknown> = {
      isDeleted: false,
      ...orgFilter,
    };

    if (threadId) where.threadId = threadId;
    if (direction) where.direction = direction;
    if (search) {
      where.OR = [
        { body: { contains: search, mode: 'insensitive' } },
        { fromName: { contains: search, mode: 'insensitive' } },
        { fromEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          thread: {
            select: {
              id: true,
              subject: true,
            },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({
      messages: messages.map(m => ({
        ...m,
        sentAt: m.sentAt.toISOString(),
        readAt: m.readAt?.toISOString(),
        createdAt: m.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + messages.length < total,
      },
    });
  } catch (e) {
    console.error('GET /api/messages', e);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
