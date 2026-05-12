import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/assessments/assign - Assign assessment to candidate
export async function POST(request: Request) {
  try {
    const { templateId, candidateId, applicationId, assignedById, expiresInDays = 7 } = await request.json();

    if (!templateId || !candidateId) {
      return NextResponse.json({ error: 'templateId and candidateId are required' }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const assignment = await prisma.assessmentAssignment.create({
      data: {
        templateId,
        candidateId,
        applicationId: applicationId ?? null,
        assignedById: assignedById ?? 'system',
        expiresAt,
        status: 'pending',
      },
    });

    // Get template for email
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: `Assessment "${template?.name}" assigned successfully`,
    });
  } catch (error) {
    console.error('Error assigning assessment:', error);
    return NextResponse.json({ error: 'Failed to assign assessment' }, { status: 500 });
  }
}

// GET /api/assessments/assign - Get candidate's assessments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    const assignments = await prisma.assessmentAssignment.findMany({
      where: {
        ...(candidateId ? { candidateId } : {}),
        ...(applicationId ? { applicationId } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: {
        template: {
          select: { name: true, category: true, duration: true },
        },
        candidate: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Prisma Decimal fields come as strings in JSON — normalise to number
    const serialised = assignments.map(a => ({
      ...a,
      percentage: a.percentage != null ? parseFloat(a.percentage.toString()) : null,
    }));

    return NextResponse.json({ assignments: serialised });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}
