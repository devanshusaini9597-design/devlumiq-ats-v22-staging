import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as registerHandler } from '@/app/api/auth/register/route';

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should return error for invalid credentials', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      const response = await loginHandler(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should require email and password', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: '',
          password: '',
        },
      });

      const response = await loginHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/register', () => {
    it('should validate email format', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        },
      });

      const response = await registerHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should require password of minimum length', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        },
      });

      const response = await registerHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });
});
