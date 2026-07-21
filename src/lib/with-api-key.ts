/**
 * API Key Bearer token authentication middleware.
 *
 * Allows external services (Zapier, scripts, integrations) to authenticate
 * using an `Authorization: Bearer <api-key>` header instead of a session cookie.
 *
 * Usage:
 *   export const GET = withApiKey(['read'], async (req, ctx, apiKeyRecord) => { ... });
 *
 * The ApiKey record contains userId + permissions. For full user context, join
 * with the User table inside the handler if needed.
 *
 * Key storage:
 *   New keys must be created via hashApiKey() — raw key returned to user once,
 *   only the SHA-256 hash stored in DB (keyHash column).
 */

import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiKey } from '@prisma/client';

/** Hash a raw API key for safe DB storage / lookup */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/** Full shape of an ApiKey row joined with its owner — includes the new keyHash column */
type ApiKeyRecord = Omit<ApiKey, 'keyHash'> & {
  keyHash?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    organizationId: string | null;
  };
};

type ApiKeyHandler = (
  req: NextRequest,
  ctx: { params?: Promise<Record<string, unknown>> },
  key: ApiKeyRecord,
) => Promise<NextResponse> | NextResponse;

/**
 * @param requiredPermissions  Any of these must be present in ApiKey.permissions
 * @param handler              Route handler receiving the validated key + owning user
 */
export function withApiKey(requiredPermissions: string[], handler: ApiKeyHandler) {
  return async (req: NextRequest, ctx: { params?: Promise<Record<string, unknown>> } = {}) => {
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const rawKey = authHeader.slice(7).trim();
    if (!rawKey) {
      return NextResponse.json({ error: 'API key is empty' }, { status: 401 });
    }

    const keyHash = hashApiKey(rawKey);
    const userSelect = { select: { id: true, name: true, email: true, role: true, isActive: true, organizationId: true } } as const;

    // Prefer hash lookup (secure); fall back to plain-text for legacy keys not yet migrated
    const byHash = await prisma.apiKey.findFirst({
      where: { keyHash },
      include: { user: userSelect },
    });

    const keyRecord: ApiKeyRecord | null = byHash ?? await prisma.apiKey.findUnique({
      where: { key: rawKey },
      include: { user: userSelect },
    });

    if (!byHash && keyRecord) {
      // Migrate on first use: backfill the hash so future lookups bypass the plain-text column
      prisma.apiKey.update({ where: { id: keyRecord.id }, data: { keyHash } }).catch(() => {});
    }

    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    if (!keyRecord.isActive) {
      return NextResponse.json({ error: 'API key is inactive' }, { status: 401 });
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'API key has expired' }, { status: 401 });
    }

    if (!keyRecord.user.isActive) {
      return NextResponse.json({ error: 'Associated user account is inactive' }, { status: 403 });
    }

    // Check required permissions (any match is sufficient)
    if (requiredPermissions.length > 0) {
      const keyPerms = (keyRecord.permissions as unknown as string[]) ?? [];
      const hasPermission = requiredPermissions.some((p) => keyPerms.includes(p));
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient API key permissions', required: requiredPermissions },
          { status: 403 },
        );
      }
    }

    // Update last used timestamp (fire-and-forget)
    prisma.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

    return handler(req, ctx, {
      ...keyRecord,
      user: {
        id: keyRecord.user.id,
        name: keyRecord.user.name,
        email: keyRecord.user.email,
        role: keyRecord.user.role,
        isActive: keyRecord.user.isActive,
        organizationId: keyRecord.user.organizationId,
      },
    });
  };
}
