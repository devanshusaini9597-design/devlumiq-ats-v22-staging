import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/assessments/templates/[id] - Get single template with questions
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { assignments: true, questions: true } },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching assessment template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

// PATCH /api/assessments/templates/[id] - Update template
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name, description, category, type, duration, difficulty, passingScore, isActive,
      proctoringEnabled, proctoringStrictness, requireFullscreen, snapshotIntervalSec,
    } = body;

    const template = await prisma.assessmentTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(type !== undefined && { type }),
        ...(duration !== undefined && { duration }),
        ...(difficulty !== undefined && { difficulty }),
        ...(passingScore !== undefined && { passingScore }),
        ...(isActive !== undefined && { isActive }),
        ...(proctoringEnabled !== undefined && { proctoringEnabled: !!proctoringEnabled }),
        ...(proctoringStrictness !== undefined && { proctoringStrictness }),
        ...(requireFullscreen !== undefined && { requireFullscreen: !!requireFullscreen }),
        ...(snapshotIntervalSec !== undefined && { snapshotIntervalSec: Number(snapshotIntervalSec) || 30 }),
      },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { assignments: true, questions: true } },
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error updating assessment template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

// DELETE /api/assessments/templates/[id] - Delete template with all related data
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Must delete in order: responses → assignments → template (questions cascade from template)
    await prisma.$transaction(async (tx) => {
      // 1. Delete all assessment responses for any assignment of this template
      await tx.assessmentResponse.deleteMany({
        where: { assignment: { templateId: id } },
      });
      // 2. Delete all assignments for this template
      await tx.assessmentAssignment.deleteMany({
        where: { templateId: id },
      });
      // 3. Delete the template (questions cascade via onDelete: Cascade)
      await tx.assessmentTemplate.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
