import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Returns the session user, or falls back to the first user in the DB (for seeded/legacy data). */
async function resolveUser(req: NextRequest) {
  const session = await getSession();
  if (session?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user) return user;
  }
  // Fallback: use the first existing user (never creates a phantom record)
  return prisma.user.findFirst();
}

async function getOrCreateInterview(candidateId: string, userId: string) {
  let interview = await prisma.interviewEvent.findFirst({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
  });

  if (!interview) {
    interview = await prisma.interviewEvent.create({
      data: {
        title: 'Interview Evaluation',
        type: 'general',
        candidateId,
        assignedToId: userId,
        start: new Date(),
        status: 'completed',
      },
    });
  }

  return interview;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const interviews = await prisma.interviewEvent.findMany({
      where: { candidateId: id },
      select: { id: true },
    });

    if (interviews.length === 0) {
      return NextResponse.json({ scores: [] });
    }

    const interviewIds = interviews.map(i => i.id);

    const scores = await prisma.interviewScore.findMany({
      where: { interviewId: { in: interviewIds } },
      include: { scoredBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      scores: scores.map(s => ({
        id: s.id,
        criteria: s.criteriaName,
        score: s.score,
        maxScore: s.maxScore,
        notes: s.notes || '',
        scoredBy: s.scoredBy?.name ?? 'Unknown',
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('GET /api/candidates/[id]/scores', error);
    return NextResponse.json({ scores: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: 'No user found to record score' }, { status: 500 });
    }

    const interview = await getOrCreateInterview(id, user.id);

    // Upsert: update if same criteria exists, else create
    const existing = await prisma.interviewScore.findFirst({
      where: {
        interviewId: interview.id,
        criteriaName: data.criteria,
      },
    });

    let score;
    if (existing) {
      score = await prisma.interviewScore.update({
        where: { id: existing.id },
        data: {
          score: data.score,
          notes: data.notes || '',
        },
        include: { scoredBy: { select: { name: true } } },
      });
    } else {
      score = await prisma.interviewScore.create({
        data: {
          interviewId: interview.id,
          criteriaName: data.criteria,
          score: data.score,
          maxScore: data.maxScore || 5,
          notes: data.notes || '',
          scoredById: user.id,
          weight: 1.0,
        },
        include: { scoredBy: { select: { name: true } } },
      });
    }

    return NextResponse.json({
      id: score.id,
      criteria: score.criteriaName,
      score: score.score,
      maxScore: score.maxScore,
      notes: score.notes || '',
      scoredBy: score.scoredBy?.name ?? user.name,
      createdAt: score.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/candidates/[id]/scores', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete all scores for this candidate's interviews
    const interviews = await prisma.interviewEvent.findMany({
      where: { candidateId: id },
      select: { id: true },
    });

    if (interviews.length > 0) {
      await prisma.interviewScore.deleteMany({
        where: { interviewId: { in: interviews.map(i => i.id) } },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/candidates/[id]/scores', error);
    return NextResponse.json({ error: 'Failed to delete scores' }, { status: 500 });
  }
}
