import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/search/advanced - Advanced candidate search with boolean logic
// POST /api/search (with `name` field) - Save a search for the current user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      userId,
      query,
      booleanQuery,
      skills,
      experienceMin,
      experienceMax,
      location,
      remoteOnly,
      source,
      tags,
      status,
    } = body;

    // If `name` is present → persist as a saved search
    if (name) {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required to save a search' }, { status: 400 });
      }
      const saved = await prisma.savedSearch.create({
        data: {
          userId,
          name,
          query: query ?? null,
          booleanQuery: booleanQuery ?? null,
          skills: skills ?? [],
          experienceMin: experienceMin ?? null,
          experienceMax: experienceMax ?? null,
          location: location ?? null,
          remoteOnly: remoteOnly ?? false,
          source: source ?? [],
          tags: tags ?? [],
          education: [],
          statusFilters: [],
          stageFilters: [],
        },
      });
      return NextResponse.json(saved, { status: 201 });
    }

    // Build dynamic where clause
    const where: any = {};

    // Full-text search on name/email
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Skills filter (array overlap)
    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
    }

    // Experience range
    if (experienceMin !== undefined || experienceMax !== undefined) {
      where.experience = {};
      if (experienceMin !== undefined) where.experience.gte = experienceMin;
      if (experienceMax !== undefined) where.experience.lte = experienceMax;
    }

    // Location
    if (location) {
      where.OR = where.OR || [];
      where.OR.push(
        { location: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } },
        { country: { contains: location, mode: 'insensitive' } }
      );
    }

    // Remote only
    if (remoteOnly) {
      where.isRemote = true;
    }

    // Source filter
    if (source && source.length > 0) {
      where.source = { in: source };
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        applications: {
          select: {
            id: true,
            stage: true,
            status: true,
            job: { select: { title: true } },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      candidates,
      total: candidates.length,
      filters: { query, skills, experienceMin, experienceMax, location, remoteOnly, source, tags },
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// GET /api/search/saved - Get user's saved searches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(searches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 });
  }
}
