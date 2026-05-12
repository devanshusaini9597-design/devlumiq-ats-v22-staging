import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * POST /api/whatsapp/send
 *
 * Sends a WhatsApp message via the WhatsApp Business Cloud API.
 * Requires WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.
 * If they are not configured the route returns a 503 so callers can show
 * a helpful error instead of silently failing.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { phone, message, candidateId } = await request.json();

  if (!phone || !message) {
    return NextResponse.json({ error: 'phone and message are required' }, { status: 400 });
  }

  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      { error: 'WhatsApp Business API is not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.' },
      { status: 503 }
    );
  }

  // Normalise phone: strip spaces / dashes, ensure leading +
  const to = phone.replace(/[\s\-()]/g, '');

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('WhatsApp API error', err);
    return NextResponse.json(
      { error: 'WhatsApp delivery failed', detail: err },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true, candidateId });
}
