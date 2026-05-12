import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/linkedin/import - Import LinkedIn profile
export async function POST(request: Request) {
  try {
    const { linkedInUrl, linkedInData, importedById } = await request.json();

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
    
    const candidate = await prisma.candidate.create({
      data: {
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
      },
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
}

// Helper to parse LinkedIn data
function parseLinkedInData(data: any) {
  // In production, this would use AI/ML to parse structured LinkedIn data
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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const imports = await prisma.linkedInImport.findMany({
      where: userId ? { importedById: userId } : {},
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
}
