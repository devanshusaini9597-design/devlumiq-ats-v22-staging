import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/company - Get company profile
export async function GET() {
  try {
    const company = await prisma.company.findFirst({
      include: {
        benefits: { orderBy: { sortOrder: 'asc' } },
        teamMembers: { orderBy: { sortOrder: 'asc' } },
        socialLinks: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

// POST /api/company - Create or update company profile
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const {
      name,
      slug,
      description,
      website,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      customCss,
      metaTitle,
      metaDescription,
      ogImageUrl,
      twitterHandle,
      linkedinUrl,
      heroTitle,
      heroSubtitle,
      heroBackground,
      showBenefits,
      showTeamPhotos,
      customDomain,
      enableLinkedInShare,
      enableTwitterShare,
      enableFacebookShare,
      enableEmailShare,
      isPublished,
      benefits,
      teamMembers,
      socialLinks,
    } = data;

    // Check if company exists
    const existing = await prisma.company.findFirst();

    const companyData: any = {
      name,
      slug,
      description,
      website,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      customCss,
      metaTitle,
      metaDescription,
      ogImageUrl,
      twitterHandle,
      linkedinUrl,
      heroTitle,
      heroSubtitle,
      heroBackground,
      showBenefits,
      showTeamPhotos,
      customDomain,
      enableLinkedInShare,
      enableTwitterShare,
      enableFacebookShare,
      enableEmailShare,
      isPublished,
    };

    let company;

    if (existing) {
      // Update existing
      company = await prisma.company.update({
        where: { id: existing.id },
        data: companyData,
      });

      // Update benefits
      if (benefits) {
        await prisma.companyBenefit.deleteMany({ where: { companyId: existing.id } });
        if (benefits.length > 0) {
          await prisma.companyBenefit.createMany({
            data: benefits.map((b: any, i: number) => ({
              title: b.title || '',
              description: b.description || '',
              icon: b.icon || '',
              companyId: existing.id,
              sortOrder: i,
            })),
          });
        }
      }

      // Update team members
      if (teamMembers) {
        await prisma.teamMember.deleteMany({ where: { companyId: existing.id } });
        if (teamMembers.length > 0) {
          await prisma.teamMember.createMany({
            data: teamMembers.map((m: any, i: number) => ({
              name: m.name || '',
              role: m.role || '',
              bio: m.bio || '',
              photoUrl: m.photoUrl || '',
              companyId: existing.id,
              sortOrder: i,
            })),
          });
        }
      }

      // Update social links
      if (socialLinks) {
        await prisma.companySocialLink.deleteMany({ where: { companyId: existing.id } });
        if (socialLinks.length > 0) {
          await prisma.companySocialLink.createMany({
            data: socialLinks.map((l: any, i: number) => ({
              platform: l.platform || '',
              url: l.url || '',
              companyId: existing.id,
              sortOrder: i,
            })),
          });
        }
      }
    } else {
      // Create new
      company = await prisma.company.create({
        data: {
          ...companyData,
          benefits: benefits?.length > 0 ? {
            createMany: {
              data: benefits.map((b: any, i: number) => ({
                title: b.title || '', description: b.description || '', icon: b.icon || '', sortOrder: i,
              })),
            },
          } : undefined,
          teamMembers: teamMembers?.length > 0 ? {
            createMany: {
              data: teamMembers.map((m: any, i: number) => ({
                name: m.name || '', role: m.role || '', bio: m.bio || '', photoUrl: m.photoUrl || '', sortOrder: i,
              })),
            },
          } : undefined,
          socialLinks: socialLinks?.length > 0 ? {
            createMany: {
              data: socialLinks.map((l: any, i: number) => ({
                platform: l.platform || '', url: l.url || '', sortOrder: i,
              })),
            },
          } : undefined,
        },
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error saving company:', error);
    return NextResponse.json({ error: 'Failed to save company' }, { status: 500 });
  }
}

// PATCH /api/company - Partial update
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const existing = await prisma.company.findFirst();

    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = await prisma.company.update({
      where: { id: existing.id },
      data,
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}
