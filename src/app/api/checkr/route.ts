import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Checkr API Configuration
const CHECKR_API_URL = process.env.CHECKR_API_URL || 'https://api.checkr.com/v1';
const CHECKR_API_KEY = process.env.CHECKR_API_KEY || '';

// Helper function for Checkr API calls
async function checkrApi(endpoint: string, options: RequestInit = {}) {
  const url = `${CHECKR_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Token ${CHECKR_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Checkr API error: ${response.status}`);
  }

  return response.json();
}

// POST /api/checkr - Create a background check
export async function POST(request: Request) {
  try {
    if (!CHECKR_API_KEY) {
      return NextResponse.json(
        { error: 'Checkr API not configured. Missing CHECKR_API_KEY.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      candidateId, 
      candidateEmail,
      candidatePhone,
      candidateName,
      packageType = 'standard',
      customPackages,
      workflowId,
    } = body;

    // Create Checkr candidate first
    const nameParts = candidateName?.split(' ') || ['', ''];
    const candidateData = await checkrApi('/candidates', {
      method: 'POST',
      body: JSON.stringify({
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || 'Unknown',
        email: candidateEmail,
        phone: candidatePhone,
        // Add any additional metadata
        metadata: {
          ats_candidate_id: candidateId,
        },
      }),
    });

    // Create background check (invitation)
    const invitationData = await checkrApi('/invitations', {
      method: 'POST',
      body: JSON.stringify({
        candidate_id: candidateData.id,
        package: packageType,
        ...(customPackages && { package_ids: customPackages }),
        ...(workflowId && { workflow_id: workflowId }),
        // Options for candidate experience
        email: candidateEmail,
        custom_message: {
          subject: 'Background Check Required',
          body: 'Please complete the background check process by clicking the link below.',
        },
      }),
    });

    // Create record in database
    const bgCheck = await prisma.backgroundCheck.create({
      data: {
        candidateId,
        provider: 'CHECKR',
        providerCandidateId: candidateData.id,
        providerInvitationId: invitationData.id,
        status: 'pending',
        packageType,
        invitationUrl: invitationData.invitation_url,
        expiresAt: invitationData.expires_at ? new Date(invitationData.expires_at) : null,
        checkTypes: ['criminal', 'employment', 'education', 'mvr'], // Based on package
      },
    });

    return NextResponse.json({
      success: true,
      backgroundCheckId: bgCheck.id,
      checkrCandidateId: candidateData.id,
      invitationId: invitationData.id,
      invitationUrl: invitationData.invitation_url,
      message: 'Background check invitation sent successfully',
    });
  } catch (error) {
    console.error('Error creating Checkr background check:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create background check' },
      { status: 500 }
    );
  }
}

// Sample background checks data for demo
const sampleBackgroundChecks = [
  {
    id: 'bgc-1',
    candidateId: 'cand-1',
    provider: 'CHECKR',
    providerCandidateId: 'checkr-cand-001',
    providerInvitationId: 'checkr-inv-001',
    status: 'clear',
    packageType: 'standard',
    invitationUrl: 'https://checkr.com/invitation/001',
    reportUrl: 'https://checkr.com/report/001',
    checkTypes: ['criminal', 'employment', 'education'],
    notes: 'All checks passed successfully',
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
    completedAt: new Date('2024-03-15').toISOString(),
    expiresAt: new Date('2024-04-10').toISOString(),
    candidate: { name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '+1 555-0101' }
  },
  {
    id: 'bgc-2',
    candidateId: 'cand-2',
    provider: 'CHECKR',
    providerCandidateId: 'checkr-cand-002',
    providerInvitationId: 'checkr-inv-002',
    status: 'pending',
    packageType: 'standard',
    invitationUrl: 'https://checkr.com/invitation/002',
    reportUrl: null,
    checkTypes: ['criminal', 'employment', 'education'],
    notes: null,
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString(),
    completedAt: null,
    expiresAt: new Date('2024-04-20').toISOString(),
    candidate: { name: 'Michael Chen', email: 'michael.chen@email.com', phone: '+1 555-0102' }
  },
  {
    id: 'bgc-3',
    candidateId: 'cand-3',
    provider: 'CHECKR',
    providerCandidateId: 'checkr-cand-003',
    providerInvitationId: 'checkr-inv-003',
    status: 'consider',
    packageType: 'comprehensive',
    invitationUrl: 'https://checkr.com/invitation/003',
    reportUrl: 'https://checkr.com/report/003',
    checkTypes: ['criminal', 'employment', 'education', 'mvr', 'credit'],
    notes: 'Minor discrepancy found in employment history',
    createdAt: new Date('2024-03-22').toISOString(),
    updatedAt: new Date('2024-03-25').toISOString(),
    completedAt: new Date('2024-03-25').toISOString(),
    expiresAt: new Date('2024-04-22').toISOString(),
    candidate: { name: 'David Williams', email: 'david.williams@email.com', phone: '+1 555-0103' }
  },
  {
    id: 'bgc-4',
    candidateId: 'cand-4',
    provider: 'CHECKR',
    providerCandidateId: 'checkr-cand-004',
    providerInvitationId: 'checkr-inv-004',
    status: 'in_progress',
    packageType: 'standard',
    invitationUrl: 'https://checkr.com/invitation/004',
    reportUrl: null,
    checkTypes: ['criminal', 'employment'],
    notes: null,
    createdAt: new Date('2024-03-28').toISOString(),
    updatedAt: new Date('2024-03-28').toISOString(),
    completedAt: null,
    expiresAt: new Date('2024-04-28').toISOString(),
    candidate: { name: 'Jennifer Martinez', email: 'jennifer.martinez@email.com', phone: '+1 555-0104' }
  },
];

// GET /api/checkr - List background checks
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const status = searchParams.get('status');

    const checks = await prisma.backgroundCheck.findMany({
      where: {
        ...(candidateId && { candidateId }),
        ...(status && { status }),
        provider: 'CHECKR',
      },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return sample data if no checks in database
    if (!checks || checks.length === 0) {
      return NextResponse.json({
        success: true,
        checks: sampleBackgroundChecks,
      });
    }

    // If real-time sync is needed, fetch from Checkr API
    if (CHECKR_API_KEY) {
      const syncedChecks = await Promise.all(
        checks.map(async (check) => {
          if (check.providerInvitationId && !['complete', 'clear', 'dispute'].includes(check.status)) {
            try {
              const checkrData = await checkrApi(`/invitations/${check.providerInvitationId}`);
              
              // Update if status changed
              if (checkrData.status !== check.status) {
                await prisma.backgroundCheck.update({
                  where: { id: check.id },
                  data: {
                    status: mapCheckrStatus(checkrData.status),
                    completedAt: checkrData.completed_at ? new Date(checkrData.completed_at) : null,
                  },
                });
              }
              
              return {
                ...check,
                status: mapCheckrStatus(checkrData.status),
                checkrData,
              };
            } catch (error) {
              console.error(`Error syncing Checkr data for check ${check.id}:`, error);
              return check;
            }
          }
          return check;
        })
      );
      
      return NextResponse.json({
        success: true,
        checks: syncedChecks,
      });
    }

    return NextResponse.json({
      success: true,
      checks,
    });
  } catch (error) {
    console.error('Error fetching background checks:', error);
    // Return sample data on error
    return NextResponse.json({
      success: true,
      checks: sampleBackgroundChecks,
    });
  }
}

// PATCH /api/checkr - Update background check status
export async function PATCH(request: Request) {
  try {
    const { checkId, status, reportUrl, notes } = await request.json();

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (reportUrl) updateData.reportUrl = reportUrl;
    if (notes) updateData.notes = notes;
    if (status === 'complete' || status === 'clear' || status === 'consider') {
      updateData.completedAt = new Date();
    }

    const updatedCheck = await prisma.backgroundCheck.update({
      where: { id: checkId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      check: updatedCheck,
      message: 'Background check updated successfully',
    });
  } catch (error) {
    console.error('Error updating background check:', error);
    return NextResponse.json(
      { error: 'Failed to update background check' },
      { status: 500 }
    );
  }
}

// Helper: Map Checkr status to our status
function mapCheckrStatus(checkrStatus: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'in_progress': 'in_progress',
    'complete': 'complete',
    'clear': 'clear',
    'consider': 'consider',
    'dispute': 'dispute',
    'expired': 'expired',
    'suspended': 'suspended',
  };
  
  return statusMap[checkrStatus] || checkrStatus;
}
