import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/calendar/integrations - Get user's calendar integrations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const integrations = await prisma.calendarIntegration.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        calendarId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Error fetching calendar integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

// POST /api/calendar/integrations - Connect calendar
export async function POST(request: Request) {
  try {
    const { userId, provider, accessToken, refreshToken, expiresAt, calendarId } = await request.json();

    // In production, you'd exchange auth code for tokens via OAuth2 flow
    const integration = await prisma.calendarIntegration.create({
      data: {
        userId,
        provider,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        calendarId,
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error creating calendar integration:', error);
    return NextResponse.json({ error: 'Failed to connect calendar' }, { status: 500 });
  }
}

// DELETE /api/calendar/integrations - Disconnect calendar
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Integration ID required' }, { status: 400 });
    }

    await prisma.calendarIntegration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar integration:', error);
    return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 });
  }
}
