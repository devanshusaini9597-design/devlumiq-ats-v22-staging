import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;
    const notes = await prisma.candidateNote.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      notes.map((n) => ({
        id: n.id,
        authorName: n.authorName,
        body: n.body,
        createdAt: n.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error('GET /api/candidates/[id]/notes', e);
    return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: candidateId } = await params;
    const body = await request.json();
    const authorName = (body?.authorName ?? body?.author ?? 'Recruiter').toString().trim() || 'Recruiter';
    const noteBody = (body?.body ?? body?.text ?? '').toString().trim();
    if (!noteBody) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    const note = await prisma.candidateNote.create({
      data: { candidateId, authorName, body: noteBody },
    });
    return NextResponse.json({
      id: note.id,
      authorName: note.authorName,
      body: note.body,
      createdAt: note.createdAt.toISOString(),
    });
  } catch (e) {
    console.error('POST /api/candidates/[id]/notes', e);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
