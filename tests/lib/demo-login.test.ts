import { describe, it, expect, afterEach } from 'vitest';
import { isDemoLoginEnabled } from '@/lib/demo-login';

describe('isDemoLoginEnabled', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFlag = process.env.ENABLE_DEMO_LOGIN;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalFlag === undefined) delete process.env.ENABLE_DEMO_LOGIN;
    else process.env.ENABLE_DEMO_LOGIN = originalFlag;
  });

  it('is disabled in production by default', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_DEMO_LOGIN;
    expect(isDemoLoginEnabled()).toBe(false);
  });

  it('can be explicitly enabled in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEMO_LOGIN = 'true';
    expect(isDemoLoginEnabled()).toBe(true);
  });

  it('is enabled in development by default', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.ENABLE_DEMO_LOGIN;
    expect(isDemoLoginEnabled()).toBe(true);
  });

  it('can be explicitly disabled in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_DEMO_LOGIN = 'false';
    expect(isDemoLoginEnabled()).toBe(false);
  });
});
