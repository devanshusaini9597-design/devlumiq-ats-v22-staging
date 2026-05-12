import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission, withAuth } from '@/lib/with-permission';

// Get or create default company
async function getOrCreateDefaultCompany() {
  let company = await prisma.company.findFirst();
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Default Company',
        slug: 'default-company',
        description: 'Your company description',
      },
    });
  }
  
  return company;
}

export const GET = withAuth(async () => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        _count: {
          select: { applications: true }
        }
      },
    });

    const list = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      applicants: j._count.applications,
      status: j.status,
      postedAt: j.postedAt.toISOString(),
      company: j.company,
    }));

    return NextResponse.json({ jobs: list });
  } catch (e) {
    console.error('GET /api/jobs', e);
    return NextResponse.json({ jobs: [], error: 'Failed to load jobs' }, { status: 500 });
  }
});

export const POST = withPermission('CREATE_JOB', async (request: NextRequest, _ctx, session) => {
  try {
    const body = await request.json();
    const { title, department, location, type, status, description, requirements } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get or create default company
    const company = await getOrCreateDefaultCompany();

    const job = await prisma.job.create({
      data: {
        title,
        department: department ?? 'General',
        location: location ?? 'Remote',
        type: type ?? 'Full-time',
        status: status ?? 'Active',
        description,
        requirements,
        companyId: company.id,
      },
    });

    await prisma.userActivityLog.create({
      data: { userId: session.id, action: 'job_created', entityType: 'job', entityId: job.id, metadata: { title: job.title, department: job.department } },
    }).catch(() => {});

    return NextResponse.json({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      applicants: 0,
      status: job.status,
      postedAt: job.postedAt.toISOString(),
    });
  } catch (e) {
    console.error('POST /api/jobs', e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
});
