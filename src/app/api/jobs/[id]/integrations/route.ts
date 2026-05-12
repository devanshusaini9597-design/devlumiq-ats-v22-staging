import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const integrations = await prisma.jobBoardIntegration.findMany({
      where: { jobId: id },
      orderBy: { postedAt: 'desc' }
    });
    return NextResponse.json({ integrations });
  } catch {
    return NextResponse.json({ integrations: [] }, { status: 500 });
  }
}

const BOARD_MAP: Record<string, string> = {
  linkedin: 'LINKEDIN',
  indeed: 'INDEED',
  glassdoor: 'GLASSDOOR',
  website: 'LINKEDIN', // fallback for company website
  ziprecruiter: 'ZIPRECRUITER',
  monster: 'MONSTER',
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const boardEnum = BOARD_MAP[data.board?.toLowerCase()] || 'LINKEDIN';
    const integration = await prisma.jobBoardIntegration.create({
      data: {
        jobId: id,
        board: boardEnum as any,
        externalId: data.externalId || `ext-${Date.now()}`,
        postUrl: data.postUrl || `https://${data.board}.com/jobs/${id}`,
        status: 'active',
      },
    });

    // Create notification for job posting
    await prisma.notification.create({
      data: {
        title: `Job posted to ${data.board}`,
        message: `The job has been successfully posted to ${data.board}.`,
        type: 'success',
        href: `/dashboard/jobs/${id}`
      }
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { integrationId, clicks, applications } = data;
    
    const integration = await prisma.jobBoardIntegration.update({
      where: { id: integrationId },
      data: {
        ...(clicks !== undefined && { clicks: { increment: clicks } }),
        ...(applications !== undefined && { applications: { increment: applications } }),
        lastSyncedAt: new Date()
      }
    });

    return NextResponse.json({ integration });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
