import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission, withAuth } from '@/lib/with-permission';

// id param = candidateId (used from the candidate profile page)
export const GET = withAuth(async (_req: NextRequest, ctx) => {
  try {
    const { id: candidateId } = await (ctx.params as Promise<{ id: string }>);

    // Get all interviews for this candidate, with their scores
    const interviews = await prisma.interviewEvent.findMany({
      where: { candidateId },
      include: { scores: { orderBy: { createdAt: 'desc' } } },
    });

    // Flatten scores across all interviews
    const scores = interviews.flatMap(iv =>
      iv.scores.map(s => ({
        id: s.id,
        criteria: s.criteriaName,
        score: s.score,
        maxScore: s.maxScore,
        notes: s.notes ?? '',
        scoredBy: s.scoredById,
        createdAt: s.createdAt.toISOString(),
      }))
    );

    return NextResponse.json({ scores });
  } catch (e) {
    console.error('GET scores', e);
    return NextResponse.json({ scores: [] });
  }
});

export const POST = withPermission('SCORE_INTERVIEW', async (req: NextRequest, ctx) => {
  try {
    const { id: candidateId } = await (ctx.params as Promise<{ id: string }>);
    const data = await req.json();

    // Find or create an interview event for this candidate
    let interview = await prisma.interviewEvent.findFirst({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });

    if (!interview) {
      // Get first admin/recruiter user for scoredById
      const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (!user) {
        return NextResponse.json({ error: 'No admin user found' }, { status: 400 });
      }

      interview = await prisma.interviewEvent.create({
        data: {
          candidateId,
          title: 'Interview Scoring',
          type: 'general',
          start: new Date(),
          assignedToId: user.id,
        },
      });
    }

    // Get a valid user id for scoredBy
    let scoredById = data.scoredBy;
    const userExists = await prisma.user.findFirst({ where: { id: scoredById } });
    if (!userExists) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      scoredById = admin?.id ?? '';
    }

    const score = await prisma.interviewScore.create({
      data: {
        interviewId: interview.id,
        criteriaName: data.criteria,
        score: data.score,
        maxScore: data.maxScore || 5,
        notes: data.notes || '',
        scoredById,
        weight: data.weight || 1.0,
      },
    });

    return NextResponse.json({
      score: {
        id: score.id,
        criteria: score.criteriaName,
        score: score.score,
        maxScore: score.maxScore,
        notes: score.notes ?? '',
        scoredBy: score.scoredById,
        createdAt: score.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST score', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
});
