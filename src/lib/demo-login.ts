/**
 * Demo login gate — mirrors the assessment code-runner pattern.
 *
 * Production: OFF unless ENABLE_DEMO_LOGIN is explicitly true|1|on.
 * Development: ON by default (set ENABLE_DEMO_LOGIN=false to disable).
 *
 * Never leave this enabled on a live customer deployment.
 */

export function isDemoLoginEnabled(): boolean {
  const flag = (process.env.ENABLE_DEMO_LOGIN || '').toLowerCase().trim();
  if (flag === 'false' || flag === '0' || flag === 'off') return false;
  if (flag === 'true' || flag === '1' || flag === 'on') return true;
  // Default: allow only outside production
  return process.env.NODE_ENV !== 'production';
}
