import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withPermission } from '@/lib/with-permission';

// DocuSign Integration API
const DOCUSIGN_BASE_URL = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi/v2.1';

// POST /api/esignature/send - Send document for signature
export const POST = withPermission('USE_ESIGNATURE', async (request: NextRequest) => {
  try {
    const { 
      candidateId, 
      offerLetterId, 
      templateId, 
      emailSubject, 
      emailBody,
      documents,
      recipients 
    } = await request.json();

    // Get candidate details
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Create eSignature record
    const eSignature = await prisma.eSignatureRequest.create({
      data: {
        candidateId,
        offerLetterId,
        provider: 'DOCUSIGN',
        status: 'sent',
        documentUrl: documents[0]?.url || '',
        sentAt: new Date(),
        metadata: {
          templateId,
          emailSubject,
          emailBody,
          recipients,
        },
      },
    });

    // ── DocuSign API Integration (stub) ─────────────────────────────────────
    // To enable real DocuSign, set DOCUSIGN_CLIENT_ID, DOCUSIGN_CLIENT_SECRET,
    // and DOCUSIGN_ACCOUNT_ID in .env, then implement the sendToDocuSign()
    // function below with the official DocuSign SDK.
    //
    // Without DocuSign credentials, a placeholder external ID is stored so the
    // workflow (create → track → complete) still functions end-to-end.
    const externalId = process.env.DOCUSIGN_CLIENT_ID
      ? await sendToDocuSign({
          templateId,
          emailSubject,
          emailBody,
          recipients: [{ email: candidate.email, name: candidate.name, role: 'signer' }],
          documents,
        }).then(r => r.envelopeId)
      : `stub-${Date.now()}`;

    await prisma.eSignatureRequest.update({
      where: { id: eSignature.id },
      data: { externalId },
    });

    return NextResponse.json({
      success: true,
      eSignatureId: eSignature.id,
      externalId,
      message: process.env.DOCUSIGN_CLIENT_ID
        ? 'Signature request sent via DocuSign'
        : 'Signature request created (DocuSign not configured — using stub ID)',
    });
  } catch (error) {
    console.error('Error sending eSignature:', error);
    return NextResponse.json({ error: 'Failed to send signature request' }, { status: 500 });
  }
});


// GET /api/esignature/status - Check signature status
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    const requests = await prisma.eSignatureRequest.findMany({
      where: candidateId ? { candidateId } : {},
      include: {
        candidate: {
          select: { name: true, email: true },
        },
      },
      orderBy: { sentAt: 'desc' },
    });


    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching eSignatures:', error);
    return NextResponse.json([], { status: 500 });
  }
});

// POST /api/esignature/webhook - DocuSign webhook handler
export const PATCH = withPermission('USE_ESIGNATURE', async (request: NextRequest) => {
  try {
    const payload = await request.json();
    
    // Handle DocuSign Connect webhook events
    const { event, data } = payload;
    
    if (event === 'resend') {
      await prisma.eSignatureRequest.update({
        where: { id: data.id },
        data: { status: 'sent', sentAt: new Date() },
      });
      return NextResponse.json({ received: true, status: 'resent' });
    } else if (event === 'envelope-completed') {
      // Update signature as completed
      await prisma.eSignatureRequest.updateMany({
        where: { externalId: data.envelopeId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          signedDocumentUrl: data.certificateUrl,
        },
      });
    } else if (event === 'envelope-declined') {
      await prisma.eSignatureRequest.updateMany({
        where: { externalId: data.envelopeId },
        data: {
          status: 'declined',
          metadata: { declineReason: data.declinedReason },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
});

// ── DocuSign SDK Integration Point ───────────────────────────────────────────
// Replace this stub with the official DocuSign eSignature SDK:
//   npm install docusign-esign
// Then implement envelope creation using your DOCUSIGN_ACCOUNT_ID.
async function sendToDocuSign(params: {
  templateId?: string;
  emailSubject?: string;
  emailBody?: string;
  recipients: { email: string; name: string; role: string }[];
  documents?: any[];
}): Promise<{ envelopeId: string }> {
  // TODO: Implement with docusign-esign SDK
  // const apiClient = new docusign.ApiClient();
  // apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL);
  // ... OAuth2 + createEnvelope
  throw new Error('DocuSign SDK not implemented — set DOCUSIGN_CLIENT_ID to enable');
}
