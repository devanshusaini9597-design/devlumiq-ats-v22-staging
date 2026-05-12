import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/jobboards/post - Post job to multiple boards
export async function POST(request: Request) {
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
        // In production, integrate with actual job board APIs
        const posting = await prisma.jobBoardIntegration.create({
          data: {
            jobId,
            board: board as any,
            status: 'posted',
            externalId: `mock-${Date.now()}`,
            postUrl: `https://${board.toLowerCase()}.com/jobs/${jobId}`,
          },
        });

        return posting;
      })
    );

    return NextResponse.json({
      success: true,
      postings,
      message: `Job posted to ${postings.length} boards`,
    });
  } catch (error) {
    console.error('Error posting to job boards:', error);
    return NextResponse.json({ error: 'Failed to post job' }, { status: 500 });
  }
}

// GET /api/jobboards/post - Get job board postings for a job
export async function GET(request: Request) {
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
}

// DELETE /api/jobboards/post - Remove job from board
export async function DELETE(request: Request) {
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
}
