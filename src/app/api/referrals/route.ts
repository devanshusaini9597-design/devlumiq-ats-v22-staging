import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/with-permission';
import { requireOrgId, isOrgError } from '@/lib/require-org';


// GET /api/referrals - Get all referrals
export const GET = withAuth(async (request: NextRequest, _ctx, session) => {
  try {
    const orgId = requireOrgId(session);
    if (isOrgError(orgId)) return orgId;

    const { searchParams } = new URL(request.url);
    const referrerId = searchParams.get('referrerId');
    const orgFilter = { program: { organizationId: orgId } };

    const referrals = await prisma.referral.findMany({
      where: { ...orgFilter, ...(referrerId ? { referrerId } : {}) },
      include: {
        program: {
          select: { name: true, rewardAmount: true, rewardCurrency: true },
        },
        referrer: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });


    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json([], { status: 500 });
  }
});

// POST /api/referrals - Submit new referral
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { programId, referrerId, candidateName, candidateEmail, candidatePhone, relationship, notes } = await request.json();

    const referral = await prisma.referral.create({
      data: {
        programId,
        referrerId,
        candidateName,
        candidateEmail,
        candidatePhone,
        relationship,
        notes,
        status: 'submitted',
        rewardStatus: 'pending',
      },
    });

    return NextResponse.json({ success: true, referral });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
  }
});

// PATCH /api/referrals - Update referral status
export const PATCH = withPermission('MANAGE_REFERRALS', async (request: NextRequest) => {
  try {
    const { id, status, rewardStatus, rewardAmount } = await request.json();

    const updateData: any = { status };
    if (rewardStatus) updateData.rewardStatus = rewardStatus;
    if (rewardAmount) updateData.rewardAmount = rewardAmount;
    if (status === 'paid') updateData.rewardPaidAt = new Date();

    const referral = await prisma.referral.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, referral });
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
});
