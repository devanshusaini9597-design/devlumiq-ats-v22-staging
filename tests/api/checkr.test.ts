import { describe, it, expect } from 'vitest';
import { POST as createCheckHandler, GET as getChecksHandler } from '@/app/api/checkr/route';
import { POST as webhookHandler } from '@/app/api/webhooks/checkr/route';

describe('Checkr API Integration — RBAC enforcement', () => {
  it('returns 401 for unauthenticated POST /api/checkr', async () => {
    const req = new Request('http://localhost/api/checkr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: 'test-123' }),
    }) as any;
    const response = await createCheckHandler(req);
    expect(response.status).toBe(401);
  });

  it('returns 401 for unauthenticated GET /api/checkr', async () => {
    const req = new Request('http://localhost/api/checkr?candidateId=test-123') as any;
    const response = await getChecksHandler(req);
    expect(response.status).toBe(401);
  });
});

describe('Checkr Webhook Handler — signature verification', () => {
  it('accepts webhook when no CHECKR_WEBHOOK_SECRET is configured', async () => {
    process.env.CHECKR_WEBHOOK_SECRET = '';
    const req = new Request('http://localhost/api/webhooks/checkr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'report.completed',
        data: { id: 'rep-123', candidate_id: 'cand-123', adjudication: 'clear' },
      }),
    });
    const response = await webhookHandler(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.received).toBe(true);
  });

  it('rejects webhook with wrong HMAC signature when secret is configured', async () => {
    process.env.CHECKR_WEBHOOK_SECRET = 'test-secret';
    const req = new Request('http://localhost/api/webhooks/checkr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Checkr-Signature': 'bad-signature',
      },
      body: JSON.stringify({ type: 'report.completed', data: {} }),
    });
    const response = await webhookHandler(req);
    expect(response.status).toBe(401);
    process.env.CHECKR_WEBHOOK_SECRET = '';
  });

  it('accepts webhook with valid HMAC signature', async () => {
    const { createHmac } = await import('crypto');
    const secret = 'test-secret-valid';
    process.env.CHECKR_WEBHOOK_SECRET = secret;
    const body = JSON.stringify({ type: 'candidate.created', data: {} });
    const sig = createHmac('sha256', secret).update(body).digest('hex');
    const req = new Request('http://localhost/api/webhooks/checkr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Checkr-Signature': sig },
      body,
    });
    const response = await webhookHandler(req);
    expect(response.status).toBe(200);
    process.env.CHECKR_WEBHOOK_SECRET = '';
  });
});
