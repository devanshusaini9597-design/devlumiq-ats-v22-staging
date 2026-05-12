import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const list = items.map((a) => ({
      id: a.id,
      type: a.type as 'announcement' | 'news' | 'reminder',
      title: a.title,
      summary: a.summary,
      time: a.timeLabel ?? undefined,
      cta: a.cta ?? undefined,
      href: a.href ?? undefined,
    }));

    return NextResponse.json(list);
  } catch (e) {
    console.error('GET /api/announcements', e);
    return NextResponse.json({ error: 'Failed to load announcements' }, { status: 500 });
  }
}
