import { prisma } from '@/lib/prisma';

const DEMO_POOLS = [
  {
    name: 'Silver medalists — Engineering',
    poolType: 'silver_medalist',
    description: 'Strong final-round candidates we almost hired — keep warm for the next Eng opening.',
    tags: ['engineering', 'silver'],
    reason: 'Reached final round; excellent culture fit',
  },
  {
    name: 'Keep warm — Product & Design',
    poolType: 'keep_warm',
    description: 'Designers and PMs to nurture with quarterly check-ins.',
    tags: ['product', 'design'],
    reason: 'Strong portfolio; timing was not right',
  },
  {
    name: 'Future fit — Leadership',
    poolType: 'future_fit',
    description: 'Senior ICs and managers for upcoming leadership roles.',
    tags: ['leadership', 'future'],
    reason: 'High potential for future leadership hire',
  },
] as const;

/**
 * If the org has no talent pools yet, create 3 demo pools and add
 * consented candidates so the Talent pools UI is never empty in demos.
 */
export async function ensureDemoTalentPools(organizationId: string, createdById?: string) {
  const existing = await prisma.talentPool.count({
    where: { organizationId, isActive: true },
  });
  if (existing > 0) return { created: false, pools: 0, members: 0 };

  const candidates = await prisma.candidate.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 15,
    select: { id: true, name: true, location: true, skills: true },
  });
  if (candidates.length === 0) return { created: false, pools: 0, members: 0 };

  await prisma.candidate.updateMany({
    where: { id: { in: candidates.map((c) => c.id) } },
    data: { talentPoolConsent: true, talentPoolConsentAt: new Date() },
  });

  let members = 0;
  const now = Date.now();

  for (let i = 0; i < DEMO_POOLS.length; i++) {
    const def = DEMO_POOLS[i];
    const pool = await prisma.talentPool.create({
      data: {
        organizationId,
        name: def.name,
        description: def.description,
        poolType: def.poolType,
        tags: [...def.tags],
        createdById: createdById ?? null,
      },
    });

    const slice = candidates.slice(i * 4, i * 4 + 5);
    for (let j = 0; j < slice.length; j++) {
      const c = slice[j];
      await prisma.talentPoolMember.upsert({
        where: { poolId_candidateId: { poolId: pool.id, candidateId: c.id } },
        create: {
          poolId: pool.id,
          candidateId: c.id,
          addedReason: def.reason,
          addedById: createdById ?? null,
          tags: def.tags,
          lastContactedAt: j % 2 === 0 ? new Date(now - (j + 1) * 7 * 86400000) : null,
          notes: j === 0 ? 'Priority nurture — schedule coffee chat next month.' : null,
        },
        update: {},
      });
      members += 1;
    }
  }

  return { created: true, pools: DEMO_POOLS.length, members };
}
