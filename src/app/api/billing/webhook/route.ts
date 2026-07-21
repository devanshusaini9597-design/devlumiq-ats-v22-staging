import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { constructWebhookEvent } from '@/lib/stripe';

/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events.
 * Must be added to PUBLIC_API_PATHS in middleware.ts.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  const event = await constructWebhookEvent(rawBody, sig);
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = event;
  const obj = data.object;

  switch (type) {
    case 'checkout.session.completed': {
      const orgId = obj.metadata?.orgId;
      const subId = obj.subscription;
      if (orgId && subId) {
        await prisma.subscription.update({
          where: { organizationId: orgId },
          data: {
            stripeSubId: subId,
            stripeCustomerId: obj.customer,
            status: 'ACTIVE',
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subId = obj.id;
      const sub = await prisma.subscription.findUnique({ where: { stripeSubId: subId } });
      if (sub) {
        const planMap: Record<string, string> = {};
        // Map price IDs from env vars
        if (process.env.STRIPE_PRICE_STARTER) planMap[process.env.STRIPE_PRICE_STARTER] = 'STARTER';
        if (process.env.STRIPE_PRICE_PRO) planMap[process.env.STRIPE_PRICE_PRO] = 'PRO';
        if (process.env.STRIPE_PRICE_ENTERPRISE) planMap[process.env.STRIPE_PRICE_ENTERPRISE] = 'ENTERPRISE';

        const priceId = obj.items?.data?.[0]?.price?.id;
        const plan = priceId ? (planMap[priceId] ?? sub.plan) : sub.plan;

        let status = sub.status;
        if (obj.status === 'active') status = 'ACTIVE';
        else if (obj.status === 'past_due') status = 'PAST_DUE';
        else if (obj.status === 'canceled') status = 'CANCELED';
        else if (obj.status === 'trialing') status = 'TRIALING';

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            plan: plan as any,
            status: status as any,
            cancelAtPeriodEnd: obj.cancel_at_period_end ?? false,
            currentPeriodEnd: obj.current_period_end ? new Date(obj.current_period_end * 1000) : null,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subId = obj.id;
      const sub = await prisma.subscription.findUnique({ where: { stripeSubId: subId } });
      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { plan: 'FREE', status: 'CANCELED', stripeSubId: null, cancelAtPeriodEnd: false },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
