import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { encrypt, decrypt, maskKey } from '@/lib/encryption';

const ALLOWED_PROVIDERS = ['openai', 'checkr', 'smtp', 'whatsapp', 'docusign', 'judge0', 'recall'];

/**
 * GET /api/settings/api-keys
 * Returns masked API keys for the org (BYOK).
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const keys = await prisma.orgApiKeyConfig.findMany({ where: { organizationId: orgId } });

  const masked = keys.map((k) => {
    let maskedValue = '****';
    try {
      const raw = decrypt(k.encryptedKey);
      maskedValue = maskKey(raw);
    } catch { /* encryption key changed — mask entirely */ }
    return {
      id: k.id,
      provider: k.provider,
      maskedKey: maskedValue,
      isActive: k.isActive,
      updatedAt: k.updatedAt,
    };
  });

  return NextResponse.json({ keys: masked, providers: ALLOWED_PROVIDERS });
}

/**
 * POST /api/settings/api-keys
 * Body: { provider: string, apiKey: string }
 * Upserts an encrypted API key for a provider.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  // Check if ENCRYPTION_KEY is set
  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
    return NextResponse.json({ error: 'ENCRYPTION_KEY env var not configured (64 hex chars required)' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const { provider, apiKey } = body ?? {};
  if (!provider || !ALLOWED_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: `Invalid provider. Allowed: ${ALLOWED_PROVIDERS.join(', ')}` }, { status: 400 });
  }
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 8) {
    return NextResponse.json({ error: 'apiKey must be at least 8 characters' }, { status: 400 });
  }

  const encryptedKey = encrypt(apiKey);

  const result = await prisma.orgApiKeyConfig.upsert({
    where: { organizationId_provider: { organizationId: orgId, provider } },
    update: { encryptedKey, isActive: true, updatedAt: new Date() },
    create: { organizationId: orgId, provider, encryptedKey, isActive: true },
  });

  return NextResponse.json({ id: result.id, provider: result.provider, maskedKey: maskKey(apiKey) });
}

/**
 * DELETE /api/settings/api-keys
 * Body: { provider: string }
 * Deletes an API key for a provider.
 */
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const orgId = session.organizationId;
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const body = await req.json().catch(() => null);
  const { provider } = body ?? {};
  if (!provider) return NextResponse.json({ error: 'provider is required' }, { status: 400 });

  await prisma.orgApiKeyConfig.deleteMany({ where: { organizationId: orgId, provider } });

  return NextResponse.json({ deleted: true });
}
