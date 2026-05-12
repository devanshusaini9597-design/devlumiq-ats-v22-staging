import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stageToDisplay } from '@/lib/api-helpers';

/** GET: list all applications with candidate + job (for kanban by stage) */
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: {
        candidate: true,
        job: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const list = applications.map((a) => ({
      id: a.id,
      candidateId: a.candidateId,
      jobId: a.jobId,
      stage: stageToDisplay(a.stage),
      candidate: {
        id: a.candidate.id,
        name: a.candidate.name,
        email: a.candidate.email,
        phone: a.candidate.phone,
        source: a.candidate.source,
        createdAt: a.candidate.createdAt.toISOString(),
      },
      job: {
        id: a.job.id,
        title: a.job.title,
      },
    }));

    return NextResponse.json({ applications: list });
  } catch (e) {
    console.error('GET /api/applications', e);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}
