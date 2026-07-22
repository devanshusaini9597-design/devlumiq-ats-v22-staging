import { describe, it, expect, afterEach } from 'vitest';
import { GET as getComments, POST as postComments, DELETE as deleteComments } from '@/app/api/candidates/[id]/comments/route';
import { GET as getScores, POST as postScores, DELETE as deleteScores } from '@/app/api/candidates/[id]/scores/route';
import { POST as parseResume } from '@/app/api/candidates/[id]/resume/parse/route';
import { GET as getThread, DELETE as deleteThread } from '@/app/api/messages/threads/[id]/route';
import { GET as getIntegrations, POST as postIntegrations, PATCH as patchIntegrations } from '@/app/api/jobs/[id]/integrations/route';
import { GET as getBgCheck, DELETE as deleteBgCheck } from '@/app/api/background-checks/request/[id]/route';
import { POST as demoLogin } from '@/app/api/auth/demo/route';

const params = Promise.resolve({ id: 'foreign-tenant-id' });

function makeReq(method = 'GET', body?: unknown, path = '/api/test', host = 'localhost') {
  const url = `http://${host}${path}`;
  const req = new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: `http://${host}`,
      Host: host,
      // Skip CSRF path for unit tests; auth still required via session
      Authorization: 'Bearer test-token',
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }) as any;
  req.nextUrl = new URL(url);
  return req;
}

describe('Critical IDOR / auth gates — unauthenticated callers', () => {
  it('rejects unauthenticated candidate comments', async () => {
    expect((await getComments(makeReq(), { params })).status).toBe(401);
    expect((await postComments(makeReq('POST', { body: 'hi' }), { params })).status).toBe(401);
    expect((await deleteComments(makeReq('DELETE'), { params })).status).toBe(401);
  });

  it('rejects unauthenticated candidate scores', async () => {
    expect((await getScores(makeReq(), { params })).status).toBe(401);
    expect((await postScores(makeReq('POST', { criteria: 'tech', score: 3 }), { params })).status).toBe(401);
    expect((await deleteScores(makeReq('DELETE'), { params })).status).toBe(401);
  });

  it('rejects unauthenticated resume parse', async () => {
    expect((await parseResume(makeReq('POST', { rawText: 'x', fileName: 'r.pdf' }), { params })).status).toBe(401);
  });

  it('rejects unauthenticated message thread access', async () => {
    expect((await getThread(makeReq(), { params })).status).toBe(401);
    expect((await deleteThread(makeReq('DELETE'), { params })).status).toBe(401);
  });

  it('rejects unauthenticated job integrations', async () => {
    expect((await getIntegrations(makeReq(), { params })).status).toBe(401);
    expect((await postIntegrations(makeReq('POST', { board: 'linkedin' }), { params })).status).toBe(401);
    expect((await patchIntegrations(makeReq('PATCH', { integrationId: 'x' }), { params })).status).toBe(401);
  });

  it('rejects unauthenticated background-check by id (was fully open)', async () => {
    expect((await getBgCheck(makeReq(), { params })).status).toBe(401);
    expect((await deleteBgCheck(makeReq('DELETE'), { params })).status).toBe(401);
  });
});

describe('Demo login production gate', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFlag = process.env.ENABLE_DEMO_LOGIN;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalFlag === undefined) delete process.env.ENABLE_DEMO_LOGIN;
    else process.env.ENABLE_DEMO_LOGIN = originalFlag;
  });

  it('returns 403 in production when ENABLE_DEMO_LOGIN is unset', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_DEMO_LOGIN;
    // Non-staging host — must not unlock demo login
    const res = await demoLogin(makeReq('POST', { role: 'ADMIN' }, '/api/auth/demo', 'app.customer.com'));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.code).toBe('DEMO_LOGIN_DISABLED');
  });
});
