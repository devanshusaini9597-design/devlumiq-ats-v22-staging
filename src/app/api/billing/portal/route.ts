import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createPortalSession, isStripeConfigured } from '@/lib/stripe';

/**
 * POST /api/billing/portal
 * Creates a Stripe Customer Portal session and returns the URL.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can manage billing' }, { status: 403 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const sub = await prisma.subscription.findUnique({ where: { organizationId: orgId } });
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found. Please subscribe first.' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { url } = await createPortalSession(sub.stripeCustomerId, `${appUrl}/dashboard/settings/billing`);

  return NextResponse.json({ url });
}
