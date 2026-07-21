import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission } from '@/lib/with-permission';

// POST /api/jobboards/post - Post job to multiple boards
export const POST = withPermission('MANAGE_INTEGRATIONS', async (request: NextRequest) => {
  try {
    const { jobId, boards } = await request.json();

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Create board postings
    const postings = await Promise.all(
      boards.map(async (board: string) => {
        // ── Job Board API Integration (stub) ─────────────────────────
        // To enable real posting, implement API calls to LinkedIn Jobs,
        // Indeed Employer API, Glassdoor Partner API, etc.
        // The DB record is created so the posting workflow is functional.
        const posting = await prisma.jobBoardIntegration.create({
          data: {
            jobId,
            board: board as any,
            status: 'draft',
            externalId: `stub-${board.toLowerCase()}-${Date.now()}`,
            postUrl: '',
          },
        });

        return posting;
      })
    );

    return NextResponse.json({
      success: true,
      postings,
      message: `Job board records created for ${postings.length} boards (API integration required for live posting)`,
    });
  } catch (error) {
    console.error('Error posting to job boards:', error);
    return NextResponse.json({ error: 'Failed to post job' }, { status: 500 });
  }
});

// GET /api/jobboards/post - Get job board postings for a job
export const GET = withPermission('MANAGE_INTEGRATIONS', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const postings = await prisma.jobBoardIntegration.findMany({
      where: { jobId },
      orderBy: { postedAt: 'desc' },
    });

    return NextResponse.json(postings);
  } catch (error) {
    console.error('Error fetching board postings:', error);
    return NextResponse.json({ error: 'Failed to fetch postings' }, { status: 500 });
  }
});

// DELETE /api/jobboards/post - Remove job from board
export const DELETE = withPermission('MANAGE_INTEGRATIONS', async (request: NextRequest) => {
  try {
    const { postingId } = await request.json();

    await prisma.jobBoardIntegration.delete({
      where: { id: postingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing job posting:', error);
    return NextResponse.json({ error: 'Failed to remove posting' }, { status: 500 });
  }
});
