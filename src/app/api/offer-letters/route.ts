import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/with-permission';
import { sanitizeHtml } from '@/lib/sanitize';

export const GET = withAuth(async (_req, _ctx, session) => {
  try {
    const orgFilter = session.organizationId
      ? { candidate: { organizationId: session.organizationId } }
      : {};
    const offers = await prisma.offerLetter.findMany({
      where: orgFilter,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true, department: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ offers });
  } catch {
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
});

export const POST = withPermission('GENERATE_OFFER_LETTER', async (req: NextRequest, _ctx, session) => {
  try {
    const data = await req.json();

    // Resolve jobId: use provided, or find from candidate's application
    let jobId = data.jobId;
    if (!jobId && data.candidateId) {
      const orgJobIds = session.organizationId
        ? (await prisma.job.findMany({ where: { companyId: session.organizationId }, select: { id: true } })).map(j => j.id)
        : [];
      const app = await prisma.application.findFirst({
        where: {
          candidateId: data.candidateId,
          ...(orgJobIds.length > 0 ? { jobId: { in: orgJobIds } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: { jobId: true },
      });
      jobId = app?.jobId;
    }
    if (!jobId) {
      const job = await prisma.job.findFirst({
        where: session.organizationId ? { companyId: session.organizationId } : {},
        select: { id: true },
      });
      jobId = job?.id;
    }
    if (!jobId) {
      return NextResponse.json({ error: 'No job found. Create a job first.' }, { status: 400 });
    }

    // Verify candidate belongs to org if candidateId provided
    if (data.candidateId && session.organizationId) {
      const candidate = await prisma.candidate.findFirst({
        where: { id: data.candidateId, organizationId: session.organizationId },
        select: { id: true },
      });
      if (!candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }
    }

    const offer = await prisma.offerLetter.create({
      data: {
        candidateId: data.candidateId,
        jobId,
        salary: data.salary || '0',
        currency: data.currency || 'USD',
        startDate: data.startDate ? new Date(data.startDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        benefits: data.benefits || '',
        content: sanitizeHtml(data.content || ''),
        status: data.status || 'draft',
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('POST /api/offer-letters', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
});
