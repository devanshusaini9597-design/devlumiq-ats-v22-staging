import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/with-permission';

// GET /api/referrals/programs - Get all referral programs
export const GET = withAuth(async (_req, _ctx, session) => {
  try {
    const orgFilter = session.organizationId ? { organizationId: session.organizationId } : {};
    const programs = await prisma.referralProgram.findMany({
      where: orgFilter,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { referrals: true },
        },
      },
    });

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching referral programs:', error);
    return NextResponse.json({ programs: [] });
  }
});

// POST /api/referrals/programs - Create a new referral program
export const POST = withPermission('MANAGE_REFERRALS', async (request: NextRequest, _ctx, session) => {
  try {
    const {
      name,
      description,
      rewardType,
      rewardAmount,
      rewardCurrency,
      rewardTiming,
      minDaysEmployed,
      maxReferralsPerMonth,
      eligibleJobIds,
      excludedJobIds,
    } = await request.json();

    const program = await prisma.referralProgram.create({
      data: {
        name,
        description,
        rewardType: rewardType || 'cash',
        rewardAmount: rewardAmount || 0,
        rewardCurrency: rewardCurrency || 'USD',
        rewardTiming: rewardTiming || 'hire',
        minDaysEmployed: minDaysEmployed || 90,
        maxReferralsPerMonth,
        eligibleJobIds: eligibleJobIds || [],
        excludedJobIds: excludedJobIds || [],
        isActive: true,
        organizationId: session.organizationId ?? undefined,
      },
    });

    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error('Error creating referral program:', error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
});
