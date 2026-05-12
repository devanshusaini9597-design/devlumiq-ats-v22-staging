import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stageToDisplay, displayToStage } from '@/lib/api-helpers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage } = body as { stage?: string };

    if (!stage) {
      return NextResponse.json({ error: 'stage is required' }, { status: 400 });
    }

    const prismaStage = displayToStage(stage);
    if (!prismaStage) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { stage: prismaStage },
      include: { candidate: true, job: true },
    });

    return NextResponse.json({
      id: application.id,
      stage: stageToDisplay(application.stage),
      candidate: {
        id: application.candidate.id,
        name: application.candidate.name,
        email: application.candidate.email,
        position: application.job.title,
        source: application.candidate.source,
        status: stageToDisplay(application.stage),
        createdAt: application.candidate.createdAt.toISOString(),
        phone: application.candidate.phone,
      },
    });
  } catch (e) {
    console.error('PATCH /api/applications/[id]', e);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
