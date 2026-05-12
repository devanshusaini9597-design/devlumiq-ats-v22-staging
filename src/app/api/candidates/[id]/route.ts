import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stageToDisplay } from '@/lib/api-helpers';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: { include: { job: true } },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const app = candidate.applications[0];
    const position = app?.job?.title ?? '';
    const status = app ? stageToDisplay(app.stage) : 'Applied';

    return NextResponse.json({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      position,
      source: candidate.source ?? '',
      status,
      createdAt: candidate.createdAt.toISOString(),
      phone: candidate.phone ?? '',
      skills: candidate.skills ?? [],
      tags: candidate.tags ?? [],
      experience: candidate.experience,
      location: candidate.location ?? '',
      city: candidate.city ?? '',
      country: candidate.country ?? '',
      currentTitle: candidate.currentTitle ?? '',
      currentCompany: candidate.currentCompany ?? '',
      linkedInUrl: candidate.linkedInUrl ?? '',
      portfolioUrl: candidate.portfolioUrl ?? '',
      githubUrl: candidate.githubUrl ?? '',
      websiteUrl: candidate.websiteUrl ?? '',
      resumeUrl: candidate.resumeUrl ?? '',
      resumeParsed: candidate.resumeParsed,
      applications: candidate.applications.map((a) => ({
        id: a.id,
        jobId: a.jobId,
        jobTitle: a.job.title,
        stage: stageToDisplay(a.stage),
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('GET /api/candidates/[id]', e);
    return NextResponse.json({ error: 'Failed to load candidate' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, source } = body as {
      name?: string;
      email?: string;
      phone?: string;
      source?: string;
    };

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(email != null && { email }),
        ...(phone != null && { phone }),
        ...(source != null && { source }),
      },
      include: {
        applications: { take: 1, include: { job: true } },
      },
    });

    const app = candidate.applications[0];
    const position = app?.job?.title ?? '';
    const status = app ? stageToDisplay(app.stage) : 'Applied';

    return NextResponse.json({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      position,
      source: candidate.source ?? '',
      status,
      createdAt: candidate.createdAt.toISOString(),
      phone: candidate.phone ?? '',
    });
  } catch (e) {
    console.error('PATCH /api/candidates/[id]', e);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.application.deleteMany({ where: { candidateId: id } });
    await prisma.candidate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/candidates/[id]', e);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}
