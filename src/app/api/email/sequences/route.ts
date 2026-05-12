import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/email/sequences - Get all email sequences
export async function GET() {
  try {
    const sequences = await prisma.emailSequence.findMany({
      where: { isActive: true },
      include: {
        steps: {
          include: { template: true },
          orderBy: { stepNumber: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sequences);
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 });
  }
}

// POST /api/email/sequences - Create email sequence
export async function POST(request: Request) {
  try {
    const { name, description, triggerType, steps } = await request.json();

    const sequence = await prisma.emailSequence.create({
      data: {
        name,
        description,
        triggerType,
        steps: {
          create: steps.map((s: any, index: number) => ({
            stepNumber: index + 1,
            delayHours: s.delayHours || 0,
            templateId: s.templateId,
            subject: s.subject,
            body: s.body,
            condition: s.condition,
          })),
        },
      },
      include: {
        steps: true,
      },
    });

    return NextResponse.json(sequence);
  } catch (error) {
    console.error('Error creating sequence:', error);
    return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 });
  }
}

// POST /api/email/sequences/enroll - Enroll candidate in sequence
export async function PATCH(request: Request) {
  try {
    const { sequenceId, candidateId, applicationId } = await request.json();

    const enrollment = await prisma.emailSequenceEnrollment.create({
      data: {
        sequenceId,
        candidateId,
        applicationId,
        status: 'active',
        currentStep: 0,
      },
    });

    // Schedule first email
    const sequence = await prisma.emailSequence.findUnique({
      where: { id: sequenceId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });

    if (sequence && sequence.steps.length > 0) {
      const firstStep = sequence.steps[0];
      const scheduledAt = new Date();
      scheduledAt.setHours(scheduledAt.getHours() + firstStep.delayHours);

      await prisma.scheduledEmail.create({
        data: {
          enrollmentId: enrollment.id,
          stepId: firstStep.id,
          candidateId,
          to: '', // Would get from candidate record
          subject: firstStep.subject || '',
          body: firstStep.body || '',
          scheduledAt,
        },
      });
    }

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error enrolling candidate:', error);
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}
