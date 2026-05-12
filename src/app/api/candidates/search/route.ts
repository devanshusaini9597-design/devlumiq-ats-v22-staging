import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stageToDisplay } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const experience = searchParams.get('experience');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const source = searchParams.get('source');
    const stage = searchParams.get('stage');

    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { currentTitle: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (skills.length > 0) {
      where.skills = { hasSome: skills };
    }

    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (experience) {
      if (experience.endsWith('+')) {
        const min = parseInt(experience);
        if (!isNaN(min)) where.experience = { gte: min };
      } else {
        const [min, max] = experience.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          where.experience = { gte: min, lte: max };
        } else if (!isNaN(min)) {
          where.experience = { gte: min };
        }
      }
    }

    if (source) {
      where.source = source;
    }

    if (stage) {
      where.applications = { some: { stage } };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        applications: { orderBy: { updatedAt: 'desc' }, take: 1, include: { job: true } },
        interviews: true,
        notes: true,
        comments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match the format expected by frontend
    const list = candidates.map((c) => {
      const app = c.applications[0];
      const position = app?.job?.title ?? c.currentTitle ?? '';
      const status = app ? stageToDisplay(app.stage) : 'Applied';
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone ?? '',
        position,
        source: c.source ?? '',
        status,
        experience: c.experience ?? null,
        skills: c.skills ?? [],
        tags: c.tags ?? [],
        createdAt: c.createdAt.toISOString(),
        applications: c.applications,
        interviews: c.interviews,
        notes: c.notes,
        comments: c.comments
      };
    });

    return NextResponse.json({ 
      candidates: list,
      total: list.length,
      filters: { skills, experience, tags, source, stage }
    });
  } catch {
    return NextResponse.json({ candidates: [], total: 0 }, { status: 500 });
  }
}
