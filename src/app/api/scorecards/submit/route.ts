import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/scorecards/submit - Submit interview scores
export async function POST(request: Request) {
  try {
    const { interviewId, scores, recommendation, overallScore, scoredById } = await request.json();

    // Create individual scores
    await prisma.interviewScore.createMany({
      data: scores.map((s: any) => ({
        interviewId,
        criteriaId: s.criteriaId,
        criteriaName: s.criteriaName,
        criteriaDescription: s.criteriaDescription,
        score: s.score,
        maxScore: s.maxScore || 5,
        weight: s.weight || 1.0,
        notes: s.notes,
        scoredById,
        recommendation,
      })),
    });

    // Update interview with overall score
    await prisma.interviewEvent.update({
      where: { id: interviewId },
      data: {
        overallScore,
        recommendation,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting scores:', error);
    return NextResponse.json({ error: 'Failed to submit scores' }, { status: 500 });
  }
}

// GET /api/scorecards/submit - Get scores for an interview
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID required' }, { status: 400 });
    }

    const scores = await prisma.interviewScore.findMany({
      where: { interviewId },
      include: {
        scoredBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}
