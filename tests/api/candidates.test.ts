import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET as getCandidatesHandler, POST as createCandidateHandler } from '@/app/api/candidates/route';

describe('Candidates API', () => {
  describe('GET /api/candidates', () => {
    it('should return list of candidates', async () => {
      const { req } = createMocks({
        method: 'GET',
      });

      const response = await getCandidatesHandler(req);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.candidates)).toBe(true);
    });

    it('should support pagination query params', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: {
          page: '1',
          limit: '10',
        },
      });

      const response = await getCandidatesHandler(req);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/candidates', () => {
    it('should create a new candidate with valid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          position: 'Software Engineer',
          source: 'LinkedIn',
        },
      });

      const response = await createCandidateHandler(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
    });

    it('should require name and email', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '',
          email: '',
        },
      });

      const response = await createCandidateHandler(req);
      expect(response.status).toBe(400);
    });
  });
});
