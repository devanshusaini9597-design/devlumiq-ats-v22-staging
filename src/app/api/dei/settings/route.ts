import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission, withAuth } from '@/lib/with-permission';
import { validateCsrf } from '@/lib/csrf';

export const GET = withAuth(async (_req, _ctx, session) => {
  if (!session.organizationId) {
    return NextResponse.json({
      settings: {
        blindScreeningEnabled: false,
        diverseSlateAlerts: false,
        selfIdFormEnabled: true,
      },
    });
  }
  let settings = await prisma.orgDeiSettings.findUnique({
    where: { organizationId: session.organizationId },
  });
  if (!settings) {
    settings = await prisma.orgDeiSettings.create({
      data: { organizationId: session.organizationId },
    });
  }
  return NextResponse.json({ settings });
});

export const PATCH = withPermission('MANAGE_SETTINGS', async (req: NextRequest, _ctx, session) => {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;
  if (!session.organizationId) {
    return NextResponse.json({ error: 'Organization required' }, { status: 400 });
  }
  const body = await req.json();
  const settings = await prisma.orgDeiSettings.upsert({
    where: { organizationId: session.organizationId },
    create: {
      organizationId: session.organizationId,
      blindScreeningEnabled: !!body.blindScreeningEnabled,
      diverseSlateAlerts: !!body.diverseSlateAlerts,
      selfIdFormEnabled: body.selfIdFormEnabled !== false,
    },
    update: {
      ...(typeof body.blindScreeningEnabled === 'boolean'
        ? { blindScreeningEnabled: body.blindScreeningEnabled }
        : {}),
      ...(typeof body.diverseSlateAlerts === 'boolean'
        ? { diverseSlateAlerts: body.diverseSlateAlerts }
        : {}),
      ...(typeof body.selfIdFormEnabled === 'boolean'
        ? { selfIdFormEnabled: body.selfIdFormEnabled }
        : {}),
    },
  });
  return NextResponse.json({ settings });
});
