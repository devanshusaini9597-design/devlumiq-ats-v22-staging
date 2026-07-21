import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { PLAN_LIMITS, PLAN_DISPLAY, type PlanId } from '@/lib/plan-limits';

/**
 * GET /api/billing/subscription
 * Returns the current org subscription info + plan limits.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  let sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } });

  // Auto-create FREE subscription if none exists
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { organizationId: orgId, plan: 'FREE', status: 'ACTIVE', seats: 3 },
    });
  }

  const plan = sub.plan as PlanId;
  const limits = PLAN_LIMITS[plan];
  const display = PLAN_DISPLAY[plan];

  return NextResponse.json({
    subscription: {
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      seats: sub.seats,
      stripeCustomerId: sub.stripeCustomerId ? true : false,
    },
    limits,
    display,
  });
}
