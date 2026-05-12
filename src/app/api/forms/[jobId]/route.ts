import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/forms/[jobId] - Get custom form for a job
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const form = await prisma.jobApplicationForm.findUnique({
      where: { jobId },
      include: {
        fields: {
          include: { options: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

// POST /api/forms/[jobId] - Create/update custom form
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { title, description, fields } = await request.json();

    // Upsert form
    const form = await prisma.jobApplicationForm.upsert({
      where: { jobId },
      create: {
        jobId,
        title: title || 'Application Form',
        description,
        fields: {
          create: fields.map((f: any, index: number) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired ?? false,
            sortOrder: index,
            options: f.options ? {
              create: f.options.map((o: any, i: number) => ({
                label: o.label,
                value: o.value,
                sortOrder: i,
              })),
            } : undefined,
          })),
        },
      },
      update: {
        title,
        description,
        fields: {
          deleteMany: {},
          create: fields.map((f: any, index: number) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired ?? false,
            sortOrder: index,
            options: f.options ? {
              create: f.options.map((o: any, i: number) => ({
                label: o.label,
                value: o.value,
                sortOrder: i,
              })),
            } : undefined,
          })),
        },
      },
      include: {
        fields: {
          include: { options: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}
