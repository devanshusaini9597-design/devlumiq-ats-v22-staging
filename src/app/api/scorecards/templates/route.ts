import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/scorecards/templates - Get all scorecard templates
export async function GET() {
  try {
    const templates = await prisma.scorecardTemplate.findMany({
      where: { isActive: true },
      include: {
        criteria: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching scorecard templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/scorecards/templates - Create scorecard template
export async function POST(request: Request) {
  try {
    const { name, description, category, criteria, isDefault } = await request.json();

    const template = await prisma.scorecardTemplate.create({
      data: {
        name,
        description,
        category,
        isDefault,
        criteria: {
          create: criteria.map((c: any, index: number) => ({
            name: c.name,
            description: c.description,
            maxScore: c.maxScore || 5,
            weight: c.weight || 1.0,
            sortOrder: index,
            suggestedQuestions: c.suggestedQuestions || [],
            whatToLookFor: c.whatToLookFor,
            redFlags: c.redFlags,
          })),
        },
      },
      include: {
        criteria: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating scorecard template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
