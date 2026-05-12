import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sample referrals data for demo
const sampleReferrals = [
  {
    id: 'ref-1',
    programId: 'prog-1',
    referrerId: 'user-1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    candidatePhone: '+1 555-0123',
    relationship: 'Former Colleague',
    notes: 'Excellent engineer, worked together at TechCorp for 3 years.',
    status: 'hired',
    rewardStatus: 'paid',
    rewardAmount: 2500,
    rewardCurrency: 'USD',
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-04-15').toISOString(),
    program: { name: 'Engineering Referral Program', rewardAmount: 2500, rewardCurrency: 'USD' },
    referrer: { name: 'Michael Chen', email: 'michael.chen@company.com' },
  },
  {
    id: 'ref-2',
    programId: 'prog-1',
    referrerId: 'user-2',
    candidateName: 'David Williams',
    candidateEmail: 'david.williams@email.com',
    candidatePhone: '+1 555-0456',
    relationship: 'Friend',
    notes: 'Senior backend developer with 8 years experience.',
    status: 'interviewing',
    rewardStatus: 'pending',
    rewardAmount: null,
    rewardCurrency: 'USD',
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString(),
    program: { name: 'Engineering Referral Program', rewardAmount: 2500, rewardCurrency: 'USD' },
    referrer: { name: 'Emily Davis', email: 'emily.davis@company.com' },
  },
  {
    id: 'ref-3',
    programId: 'prog-2',
    referrerId: 'user-3',
    candidateName: 'Jennifer Martinez',
    candidateEmail: 'jennifer.martinez@email.com',
    candidatePhone: '+1 555-0789',
    relationship: 'University Alumni',
    notes: 'Top performer, graduated from Stanford with honors.',
    status: 'submitted',
    rewardStatus: 'pending',
    rewardAmount: null,
    rewardCurrency: 'USD',
    createdAt: new Date('2024-04-01').toISOString(),
    updatedAt: new Date('2024-04-05').toISOString(),
    program: { name: 'Product Referral Program', rewardAmount: 3000, rewardCurrency: 'USD' },
    referrer: { name: 'James Wilson', email: 'james.wilson@company.com' },
  },
  {
    id: 'ref-4',
    programId: 'prog-1',
    referrerId: 'user-4',
    candidateName: 'Robert Anderson',
    candidateEmail: 'robert.anderson@email.com',
    candidatePhone: '+1 555-0321',
    relationship: 'LinkedIn Connection',
    notes: 'Full-stack developer with React and Node expertise.',
    status: 'contacted',
    rewardStatus: 'pending',
    rewardAmount: 2500,
    rewardCurrency: 'USD',
    createdAt: new Date('2024-02-28').toISOString(),
    updatedAt: new Date('2024-03-25').toISOString(),
    program: { name: 'Engineering Referral Program', rewardAmount: 2500, rewardCurrency: 'USD' },
    referrer: { name: 'Lisa Taylor', email: 'lisa.taylor@company.com' },
  },
];

// GET /api/referrals - Get all referrals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referrerId = searchParams.get('referrerId');

    const referrals = await prisma.referral.findMany({
      where: referrerId ? { referrerId } : {},
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

    // Return sample data if no referrals in database
    if (!referrals || referrals.length === 0) {
      return NextResponse.json(sampleReferrals);
    }

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    // Return sample data on error
    return NextResponse.json(sampleReferrals);
  }
}

// POST /api/referrals - Submit new referral
export async function POST(request: Request) {
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
}

// PATCH /api/referrals - Update referral status
export async function PATCH(request: Request) {
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
}
