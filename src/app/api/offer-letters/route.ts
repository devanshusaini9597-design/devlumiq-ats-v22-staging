import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const offers = await prisma.offerLetter.findMany({
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
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Resolve jobId: use provided, or find from candidate's application, or find first job
    let jobId = data.jobId;
    if (!jobId && data.candidateId) {
      const app = await prisma.application.findFirst({
        where: { candidateId: data.candidateId },
        orderBy: { createdAt: 'desc' },
        select: { jobId: true },
      });
      jobId = app?.jobId;
    }
    if (!jobId) {
      const job = await prisma.job.findFirst({ select: { id: true } });
      jobId = job?.id;
    }
    if (!jobId) {
      return NextResponse.json({ error: 'No job found. Create a job first.' }, { status: 400 });
    }

    const offer = await prisma.offerLetter.create({
      data: {
        candidateId: data.candidateId,
        jobId,
        salary: data.salary || '0',
        currency: data.currency || 'USD',
        startDate: data.startDate ? new Date(data.startDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        benefits: data.benefits || '',
        content: data.content || '',
        status: data.status || 'draft',
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('POST /api/offer-letters', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}
