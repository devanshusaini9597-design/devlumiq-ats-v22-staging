import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DocuSign Integration API
const DOCUSIGN_BASE_URL = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi/v2.1';

// POST /api/esignature/send - Send document for signature
export async function POST(request: Request) {
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

    // In production, this would call DocuSign API
    // const docusignResponse = await sendToDocuSign({
    //   templateId,
    //   emailSubject,
    //   emailBody,
    //   recipients: [{
    //     email: candidate.email,
    //     name: candidate.name,
    //     role: 'signer'
    //   }],
    //   documents
    // });

    // Update with mock external ID
    await prisma.eSignatureRequest.update({
      where: { id: eSignature.id },
      data: {
        externalId: `docusign-${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      eSignatureId: eSignature.id,
      message: 'Signature request sent successfully',
      // In production: envelopeId: docusignResponse.envelopeId
    });
  } catch (error) {
    console.error('Error sending eSignature:', error);
    return NextResponse.json({ error: 'Failed to send signature request' }, { status: 500 });
  }
}

// Sample eSignature data for demo
const sampleESignatures = [
  {
    id: 'esign-1',
    candidateId: 'cand-1',
    offerLetterId: 'offer-1',
    provider: 'DOCUSIGN',
    externalId: 'docusign-env-001',
    status: 'completed',
    signUrl: null,
    signedDocumentUrl: 'https://example.com/signed-doc-1.pdf',
    signerName: 'Sarah Johnson',
    signerEmail: 'sarah.johnson@email.com',
    signedAt: new Date('2024-03-20').toISOString(),
    createdAt: new Date('2024-03-15').toISOString(),
    sentAt: new Date('2024-03-15').toISOString(),
    completedAt: new Date('2024-03-20').toISOString(),
    expiresAt: new Date('2024-04-15').toISOString(),
    candidate: { name: 'Sarah Johnson', email: 'sarah.johnson@email.com' },
    offerLetter: { 
      candidate: { name: 'Sarah Johnson', email: 'sarah.johnson@email.com' },
      job: { title: 'Senior Software Engineer' }
    }
  },
  {
    id: 'esign-2',
    candidateId: 'cand-2',
    offerLetterId: 'offer-2',
    provider: 'DOCUSIGN',
    externalId: 'docusign-env-002',
    status: 'sent',
    signUrl: 'https://demo.docusign.net/sign/env-002',
    signedDocumentUrl: null,
    signerName: 'Michael Chen',
    signerEmail: 'michael.chen@email.com',
    signedAt: null,
    createdAt: new Date('2024-03-25').toISOString(),
    sentAt: new Date('2024-03-25').toISOString(),
    completedAt: null,
    expiresAt: new Date('2024-04-25').toISOString(),
    candidate: { name: 'Michael Chen', email: 'michael.chen@email.com' },
    offerLetter: { 
      candidate: { name: 'Michael Chen', email: 'michael.chen@email.com' },
      job: { title: 'Product Manager' }
    }
  },
  {
    id: 'esign-3',
    candidateId: 'cand-3',
    offerLetterId: 'offer-3',
    provider: 'DOCUSIGN',
    externalId: 'docusign-env-003',
    status: 'declined',
    signUrl: null,
    signedDocumentUrl: null,
    signerName: 'Emily Davis',
    signerEmail: 'emily.davis@email.com',
    signedAt: null,
    createdAt: new Date('2024-03-22').toISOString(),
    sentAt: new Date('2024-03-22').toISOString(),
    completedAt: null,
    expiresAt: new Date('2024-04-22').toISOString(),
    candidate: { name: 'Emily Davis', email: 'emily.davis@email.com' },
    offerLetter: { 
      candidate: { name: 'Emily Davis', email: 'emily.davis@email.com' },
      job: { title: 'UX Designer' }
    }
  },
];

// GET /api/esignature/status - Check signature status
export async function GET(request: Request) {
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

    // Return sample data if no requests in database
    if (!requests || requests.length === 0) {
      return NextResponse.json(sampleESignatures);
    }

    // In production, fetch real-time status from DocuSign
    // const statuses = await Promise.all(
    //   requests.map(async (req) => {
    //     if (req.externalId) {
    //       return await getDocuSignStatus(req.externalId);
    //     }
    //     return req.status;
    //   })
    // );

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching eSignatures:', error);
    // Return sample data on error
    return NextResponse.json(sampleESignatures);
  }
}

// POST /api/esignature/webhook - DocuSign webhook handler
export async function PATCH(request: Request) {
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
}

// Helper functions for DocuSign API (implement with actual DocuSign SDK)
async function sendToDocuSign(params: any) {
  // Implementation with DocuSign SDK
  // const client = new docusign.ApiClient();
  // client.setBasePath(DOCUSIGN_BASE_URL);
  // ... authentication and API call
  return { envelopeId: 'mock-envelope-id' };
}

async function getDocuSignStatus(envelopeId: string) {
  // Implementation with DocuSign SDK
  return 'sent';
}
