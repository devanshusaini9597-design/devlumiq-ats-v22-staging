import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const samplePrograms = [
  {
    id: 'prog-1',
    name: 'Engineering Referral Program',
    description: 'Refer talented engineers and earn cash rewards. Covers all engineering positions across frontend, backend, and DevOps.',
    isActive: true,
    rewardType: 'cash',
    rewardAmount: 2500,
    rewardCurrency: 'USD',
    rewardTiming: 'hire',
    minDaysEmployed: 90,
  },
  {
    id: 'prog-2',
    name: 'Product Referral Program',
    description: 'Help us find exceptional product managers and designers. Premium reward for senior-level hires.',
    isActive: true,
    rewardType: 'cash',
    rewardAmount: 3000,
    rewardCurrency: 'USD',
    rewardTiming: 'probation_end',
    minDaysEmployed: 60,
  },
];

// GET /api/referrals/programs - Get all referral programs
export async function GET() {
  try {
    const programs = await prisma.referralProgram.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { referrals: true },
        },
      },
    });

    if (!programs || programs.length === 0) {
      return NextResponse.json({ programs: samplePrograms });
    }

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching referral programs:', error);
    return NextResponse.json({ programs: samplePrograms });
  }
}

// POST /api/referrals/programs - Create a new referral program
export async function POST(request: Request) {
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
      },
    });

    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error('Error creating referral program:', error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}
