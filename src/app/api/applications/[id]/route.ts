import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stageToDisplay, displayToStage } from '@/lib/api-helpers';
import { withPermission } from '@/lib/with-permission';

export const PATCH = withPermission('MOVE_APPLICATION', async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  session
) => {
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

    // Verify ownership via job's company
    const orgJobIds = session.organizationId
      ? (await prisma.job.findMany({ where: { companyId: session.organizationId }, select: { id: true } })).map(j => j.id)
      : [];
    const existing = await prisma.application.findFirst({
      where: {
        id,
        ...(orgJobIds.length > 0 ? { jobId: { in: orgJobIds } } : {}),
      },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { stage: prismaStage },
      include: { candidate: true, job: true },
    });

    // Opt-in only: existing buyers' reject flow is unchanged unless they pass addToTalentPool: true
    let poolAdded: string | null = null;
    if (
      (prismaStage === 'REJECTED' || stage === 'Rejected') &&
      session.organizationId &&
      body.addToTalentPool === true
    ) {
      try {
        const cand = application.candidate;
        if (body.grantConsent === true) {
          await prisma.candidate.update({
            where: { id: application.candidateId },
            data: { talentPoolConsent: true, talentPoolConsentAt: new Date() },
          });
        }
        // Skip pool quietly without consent — stage move already succeeded
        if (body.grantConsent === true || cand.talentPoolConsent) {
          let pool = await prisma.talentPool.findFirst({
            where: {
              organizationId: session.organizationId,
              poolType: 'silver_medalist',
              isActive: true,
            },
          });
          if (!pool) {
            pool = await prisma.talentPool.create({
              data: {
                organizationId: session.organizationId,
                name: 'Silver medalists',
                poolType: 'silver_medalist',
                description: 'Auto-created from rejection flow',
                createdById: session.id,
              },
            });
          }
          await prisma.talentPoolMember.upsert({
            where: {
              poolId_candidateId: { poolId: pool.id, candidateId: application.candidateId },
            },
            create: {
              poolId: pool.id,
              candidateId: application.candidateId,
              addedReason: 'rejected_keep_warm',
              addedById: session.id,
              tags: ['rejection'],
            },
            update: { addedReason: 'rejected_keep_warm' },
          });
          poolAdded = pool.id;
        }
      } catch {
        /* non-fatal — never break stage moves for existing buyers */
      }
    }

    return NextResponse.json({
      id: application.id,
      stage: stageToDisplay(application.stage),
      talentPoolId: poolAdded,
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
});
