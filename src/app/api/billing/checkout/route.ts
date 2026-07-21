import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createCustomer, createCheckoutSession, isStripeConfigured } from '@/lib/stripe';

/**
 * POST /api/billing/checkout
 * Body: { priceId: string }
 * Creates a Stripe Checkout session and returns the URL.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' }, { status: 503 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can manage billing' }, { status: 403 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const body = await req.json().catch(() => null);
  const priceId = body?.priceId;
  if (!priceId) return NextResponse.json({ error: 'priceId is required' }, { status: 400 });

  // Get or create subscription record
  let sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { organizationId: orgId, plan: 'FREE', status: 'ACTIVE', seats: 3 },
    });
  }

  // Get or create Stripe customer
  let customerId = sub.stripeCustomerId;
  if (!customerId) {
    const org = await prisma.company.findUnique({ where: { id: orgId } });
    customerId = await createCustomer(session.email + '@billing', org?.name ?? 'Org', orgId);
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { url } = await createCheckoutSession({
    customerId,
    priceId,
    orgId,
    successUrl: `${appUrl}/dashboard/settings/billing?success=true`,
    cancelUrl: `${appUrl}/dashboard/settings/billing?canceled=true`,
  });

  return NextResponse.json({ url });
}
