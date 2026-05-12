import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stageToDisplay } from '@/lib/api-helpers';
import { withPermission, withAuth } from '@/lib/with-permission';

export const GET = withAuth(async () => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        applications: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          include: { job: true },
        },
      },
    });

    const list = candidates.map((c) => {
      const app = c.applications[0];
      const position = app?.job?.title ?? '';
      const status = app ? stageToDisplay(app.stage) : 'Applied';
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        position,
        source: c.source ?? '',
        status,
        createdAt: c.createdAt.toISOString(),
        phone: c.phone ?? '',
        experience: c.experience ?? null,
      };
    });

    return NextResponse.json({ candidates: list, candidatesList: list });
  } catch (e) {
    console.error('GET /api/candidates', e);
    return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 });
  }
});

export const POST = withPermission('CREATE_CANDIDATE', async (request: NextRequest, _ctx, session) => {
  try {
    const body = await request.json();
    const { name, email, phone, source, position, experience, jobId } = body as {
      name?: string;
      email?: string;
      phone?: string;
      source?: string;
      position?: string;
      experience?: number;
      jobId?: string;
    };

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const job = jobId
      ? await prisma.job.findUnique({ where: { id: jobId } })
      : await prisma.job.findFirst();

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        source: source ?? 'LinkedIn',
        experience: experience ?? null,
        applications: job
          ? {
              create: {
                jobId: job.id,
                stage: 'APPLIED',
              },
            }
          : undefined,
      },
      include: {
        applications: {
          take: 1,
          include: { job: true },
        },
      },
    });

    const app = candidate.applications[0];
    const positionTitle = app?.job?.title ?? position ?? '';
    const status = app ? stageToDisplay(app.stage) : 'Applied';

    await prisma.userActivityLog.create({
      data: { userId: session.id, action: 'candidate_created', entityType: 'candidate', entityId: candidate.id, metadata: { name: candidate.name, email: candidate.email, position: positionTitle } },
    }).catch(() => {});

    return NextResponse.json({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      position: positionTitle,
      source: candidate.source ?? '',
      status,
      createdAt: candidate.createdAt.toISOString(),
      phone: candidate.phone ?? '',
      experience: candidate.experience ?? null,
    });
  } catch (e) {
    console.error('POST /api/candidates', e);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
});
