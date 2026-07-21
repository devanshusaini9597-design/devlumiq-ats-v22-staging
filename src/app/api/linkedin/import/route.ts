import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission, withAuth } from '@/lib/with-permission';

// POST /api/linkedin/import - Import LinkedIn profile
export const POST = withPermission('CREATE_CANDIDATE', async (request: NextRequest, _ctx, session) => {
  try {
    const { linkedInUrl, linkedInData } = await request.json();
    const importedById = session.id;

    // Create import record
    const importRecord = await prisma.linkedInImport.create({
      data: {
        linkedInUrl,
        importedById,
        rawData: linkedInData,
        importStatus: 'processing',
      },
    });

    // Parse LinkedIn data and create candidate
    const candidateData = parseLinkedInData(linkedInData);
    
    const candidateDataAny: any = {
      name: candidateData.name,
      email: candidateData.email,
      phone: candidateData.phone,
      source: 'linkedin',
      sourceDetail: linkedInUrl,
      skills: candidateData.skills || [],
      experience: candidateData.experience,
      currentTitle: candidateData.currentTitle,
      currentCompany: candidateData.currentCompany,
      linkedInUrl,
      location: candidateData.location,
    };
    if (session.organizationId) candidateDataAny.organizationId = session.organizationId;

    const candidate = await prisma.candidate.create({
      data: candidateDataAny,
    });

    // Update import record
    await prisma.linkedInImport.update({
      where: { id: importRecord.id },
      data: {
        candidateId: candidate.id,
        importStatus: 'completed',
        parsedData: candidateData,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      candidate,
      importId: importRecord.id,
    });
  } catch (error) {
    console.error('Error importing LinkedIn profile:', error);
    return NextResponse.json({ error: 'Failed to import profile' }, { status: 500 });
  }
});

// ── LinkedIn Data Parser ────────────────────────────────────────────────────
// Accepts structured profile data sent by the Chrome extension.
// The extension scrapes LinkedIn profile fields and sends them here.
// This is a passthrough mapper — no AI/ML processing is applied.
function parseLinkedInData(data: any) {
  return {
    name: data.name || data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    skills: data.skills || [],
    experience: data.yearsOfExperience || 0,
    currentTitle: data.currentTitle || data.headline || '',
    currentCompany: data.currentCompany || '',
    location: data.location || '',
  };
}

// GET /api/linkedin/import - Get import history
export const GET = withAuth(async (request: NextRequest, _ctx, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const imports = await prisma.linkedInImport.findMany({
      where: userId ? { importedById: userId } : { importedById: session.id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(imports);
  } catch (error) {
    console.error('Error fetching imports:', error);
    return NextResponse.json({ error: 'Failed to fetch imports' }, { status: 500 });
  }
});
