import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/with-permission';

export const GET = withAuth(async (_req, _ctx, session) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: {
        OR: [
          { isSystem: true },
          { organizationId: session.organizationId ?? undefined },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ templates: [] }, { status: 500 });
  }
});

export const POST = withPermission('USE_EMAIL_TEMPLATES', async (req: NextRequest, _ctx, session) => {
  try {
    const data = await req.json();
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        smsBody: typeof data.smsBody === 'string' ? data.smsBody : null,
        whatsappBody: typeof data.whatsappBody === 'string' ? data.whatsappBody : null,
        category: data.category || 'general',
        variables: data.variables || '{{candidateName}},{{position}},{{companyName}}',
        isDefault: data.isDefault || false,
        organizationId: session.organizationId ?? undefined,
      },
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
});

export const PATCH = withPermission('USE_EMAIL_TEMPLATES', async (req: NextRequest, _ctx, session) => {
  try {
    const data = await req.json();
    const id = typeof data.id === 'string' ? data.id : '';
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const existing = await prisma.emailTemplate.findFirst({
      where: {
        id,
        OR: [
          { organizationId: session.organizationId ?? undefined },
          { isSystem: true },
        ],
      },
    });
    if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    if (existing.isSystem && existing.organizationId !== session.organizationId) {
      // Allow org to customize short forms on system templates by cloning fields in-place when org-owned;
      // system global templates: only update sms/whatsapp if org owns a copy — block name/body edits
      if (!existing.organizationId) {
        return NextResponse.json(
          { error: 'System templates are read-only — create a copy for your organization' },
          { status: 403 },
        );
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(typeof data.name === 'string' ? { name: data.name } : {}),
        ...(typeof data.subject === 'string' ? { subject: data.subject } : {}),
        ...(typeof data.body === 'string' ? { body: data.body } : {}),
        ...(data.smsBody === null || typeof data.smsBody === 'string'
          ? { smsBody: data.smsBody }
          : {}),
        ...(data.whatsappBody === null || typeof data.whatsappBody === 'string'
          ? { whatsappBody: data.whatsappBody }
          : {}),
      },
    });
    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
});
