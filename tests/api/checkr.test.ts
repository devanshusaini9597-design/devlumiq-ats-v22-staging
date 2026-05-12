import { describe, it, expect, vi } from 'vitest';
import { POST as createCheckHandler, GET as getChecksHandler } from '@/app/api/checkr/route';

describe('Checkr API Integration', () => {
  describe('POST /api/checkr', () => {
    it('should return error if Checkr API key not configured', async () => {
      process.env.CHECKR_API_KEY = '';
      
      const req = new Request('http://localhost/api/checkr', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: 'test-123',
          candidateName: 'Test User',
          candidateEmail: 'test@example.com',
        }),
      });

      const response = await createCheckHandler(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Checkr API not configured');
    });

    it('should validate required fields', async () => {
      const req = new Request('http://localhost/api/checkr', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: '',
        }),
      });

      const response = await createCheckHandler(req);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/checkr', () => {
    it('should filter by candidateId when provided', async () => {
      const req = new Request('http://localhost/api/checkr?candidateId=test-123');
      
      const response = await getChecksHandler(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should filter by status when provided', async () => {
      const req = new Request('http://localhost/api/checkr?status=pending');
      
      const response = await getChecksHandler(req);
      
      expect(response.status).toBe(200);
    });
  });
});

describe('Checkr Webhook Handler', () => {
  it('should handle report.completed event', async () => {
    const { POST: webhookHandler } = await import('@/app/api/webhooks/checkr/route');
    
    const req = new Request('http://localhost/api/webhooks/checkr', {
      method: 'POST',
      body: JSON.stringify({
        type: 'report.completed',
        data: {
          id: 'rep-123',
          candidate_id: 'cand-123',
          status: 'complete',
          adjudication: 'clear',
        },
      }),
    });

    const response = await webhookHandler(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it('should acknowledge receipt even on error', async () => {
    const { POST: webhookHandler } = await import('@/app/api/webhooks/checkr/route');
    
    const req = new Request('http://localhost/api/webhooks/checkr', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await webhookHandler(req);
    
    // Should return 200 to prevent retries
    expect(response.status).toBe(200);
  });
});
