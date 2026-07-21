import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { PLAN_LIMITS, PLAN_DISPLAY, parseAddOns, type PlanId, hasFeature } from '@/lib/plan-limits';

/**
 * GET /api/billing/subscription
 * Returns the current org subscription info + plan limits + add-ons.
 */
export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  let sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } });

  if (!sub) {
    sub = await prisma.subscription.create({
      data: { organizationId: orgId, plan: 'FREE', status: 'ACTIVE', seats: 3, addOns: {} },
    });
  }

  const plan = sub.plan as PlanId;
  const limits = PLAN_LIMITS[plan];
  const display = PLAN_DISPLAY[plan];
  const addOns = parseAddOns(sub.addOns);

  const entitlements = {
    advancedAnalytics: hasFeature(plan, 'advancedAnalytics') || !!addOns.analyticsPlus,
    whiteLabel: hasFeature(plan, 'whiteLabel') || !!addOns.whiteLabelKit,
    sso: hasFeature(plan, 'sso') || !!addOns.sso,
  };

  return NextResponse.json({
    subscription: {
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      seats: sub.seats,
      stripeCustomerId: !!sub.stripeCustomerId,
      addOns,
    },
    limits,
    entitlements,
    display,
  });
}
