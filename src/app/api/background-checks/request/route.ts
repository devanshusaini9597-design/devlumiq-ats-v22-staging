import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Checkr API Integration
const CHECKR_API_URL = process.env.CHECKR_API_URL || 'https://api.checkr.com/v1';
const CHECKR_API_KEY = process.env.CHECKR_API_KEY;

// POST /api/background-checks/request - Initiate background check
export async function POST(request: Request) {
  try {
    const { 
      candidateId, 
      applicationId,
      requestedById,
      checkTypes = ['criminal', 'employment', 'education'],
    } = await request.json();

    // Get candidate details
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Create background check record
    const bgCheck = await prisma.backgroundCheck.create({
      data: {
        candidateId,
        applicationId,
        provider: 'CHECKR',
        status: 'pending',
        requestedById,
        checkTypes,
        consentObtained: true,
      },
    });

    // In production, call Checkr API
    // const checkrResponse = await initiateCheckrBackgroundCheck({
    //   candidate: {
    //     first_name: candidate.name.split(' ')[0],
    //     last_name: candidate.name.split(' ').slice(1).join(' '),
    //     email: candidateEmail || candidate.email,
    //     phone: candidatePhone,
    //   },
    //   package: packageType,
    // });

    // Update with Checkr candidate ID
    await prisma.backgroundCheck.update({
      where: { id: bgCheck.id },
      data: {
        externalId: `checkr-${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      backgroundCheckId: bgCheck.id,
      message: 'Background check initiated',
      // In production: checkrCandidateId: checkrResponse.id
    });
  } catch (error) {
    console.error('Error initiating background check:', error);
    return NextResponse.json({ error: 'Failed to initiate check' }, { status: 500 });
  }
}

// GET /api/background-checks/request - Get background check status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    const checks = await prisma.backgroundCheck.findMany({
      where: candidateId ? { candidateId } : {},
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        application: {
          select: {
            job: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // In production, fetch real-time status from Checkr
    // const updatedChecks = await Promise.all(
    //   checks.map(async (check) => {
    //     if (check.externalId) {
    //       const status = await getCheckrStatus(check.externalId);
    //       return { ...check, status };
    //     }
    //     return check;
    //   })
    // );

    return NextResponse.json(checks);
  } catch (error) {
    console.error('Error fetching background checks:', error);
    return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 });
  }
}

// POST /api/background-checks/webhook - Checkr webhook handler
export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    
    // Handle Checkr webhook events
    const { event, data } = payload;
    
    if (event === 'report.completed') {
      await prisma.backgroundCheck.updateMany({
        where: { externalId: data.candidate_id },
        data: {
          status: 'complete',
          completedAt: new Date(),
          resultSummary: data.adjudication,
          rawResults: {
            reportId: data.id,
            adjudication: data.adjudication,
            status: data.status,
            completedAt: data.completed_at,
          },
        },
      });
    } else if (event === 'report.cleared') {
      await prisma.backgroundCheck.updateMany({
        where: { externalId: data.candidate_id },
        data: {
          status: 'clear',
          resultSummary: 'clear',
          completedAt: new Date(),
        },
      });
    } else if (event === 'report.consider') {
      await prisma.backgroundCheck.updateMany({
        where: { externalId: data.candidate_id },
        data: {
          status: 'consider',
          resultSummary: 'consider',
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
