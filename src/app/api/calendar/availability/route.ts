import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/calendar/availability - Get user's availability
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const availability = await prisma.interviewAvailability.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// POST /api/calendar/availability - Set availability
export async function POST(request: Request) {
  try {
    const { userId, availability } = await request.json();

    // Clear existing availability
    await prisma.interviewAvailability.deleteMany({
      where: { userId },
    });

    // Create new availability slots
    const slots = await prisma.interviewAvailability.createMany({
      data: availability.map((slot: any) => ({
        userId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone || 'UTC',
        isRecurring: slot.isRecurring ?? true,
        isBlocked: slot.isBlocked ?? false,
      })),
    });

    return NextResponse.json({ success: true, count: slots.count });
  } catch (error) {
    console.error('Error setting availability:', error);
    return NextResponse.json({ error: 'Failed to set availability' }, { status: 500 });
  }
}
