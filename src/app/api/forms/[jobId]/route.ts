import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/with-permission';
import { requireOrgId, isOrgError } from '@/lib/require-org';

async function assertJobInOrg(jobId: string, orgId: string) {
  return prisma.job.findFirst({
    where: { id: jobId, companyId: orgId },
    select: { id: true },
  });
}

// GET /api/forms/[jobId] - Get custom form for a job (org-scoped)
export const GET = withAuth(async (
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
  session,
) => {
  try {
    const orgId = requireOrgId(session);
    if (isOrgError(orgId)) return orgId;

    const { jobId } = await params;
    const job = await assertJobInOrg(jobId, orgId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

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
});

// POST /api/forms/[jobId] - Create/update custom form
export const POST = withPermission('EDIT_JOB', async (
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
  session,
) => {
  try {
    const orgId = requireOrgId(session);
    if (isOrgError(orgId)) return orgId;

    const { jobId } = await params;
    const job = await assertJobInOrg(jobId, orgId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { title, description, fields } = await request.json();
    const fieldList = Array.isArray(fields) ? fields : [];

    const form = await prisma.jobApplicationForm.upsert({
      where: { jobId },
      create: {
        jobId,
        title: title || 'Application Form',
        description,
        fields: {
          create: fieldList.map((f: {
            type: string;
            label: string;
            placeholder?: string;
            helpText?: string;
            isRequired?: boolean;
            options?: { label: string; value: string }[];
          }, index: number) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired ?? false,
            sortOrder: index,
            options: f.options ? {
              create: f.options.map((o, i) => ({
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
          create: fieldList.map((f: {
            type: string;
            label: string;
            placeholder?: string;
            helpText?: string;
            isRequired?: boolean;
            options?: { label: string; value: string }[];
          }, index: number) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired ?? false,
            sortOrder: index,
            options: f.options ? {
              create: f.options.map((o, i) => ({
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
});
