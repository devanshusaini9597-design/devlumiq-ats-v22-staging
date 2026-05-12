import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getJobs(filters?: {
  department?: string;
  location?: string;
  type?: string;
  search?: string;
}) {
  const where: any = { status: 'Active' };

  if (filters?.department && filters.department !== 'all') {
    where.department = filters.department;
  }
  if (filters?.location && filters.location !== 'all') {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }
  if (filters?.type && filters.type !== 'all') {
    where.type = filters.type;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { department: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [jobs, departments, locations] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        postedAt: true,
        applicants: true,
      },
    }),
    prisma.job.findMany({
      where: { status: 'Active' },
      distinct: ['department'],
      select: { department: true },
    }),
    prisma.job.findMany({
      where: { status: 'Active' },
      distinct: ['location'],
      select: { location: true },
    }),
  ]);

  return {
    jobs,
    filters: {
      departments: departments.map(d => d.department).filter(Boolean),
      locations: locations.map(l => l.location).filter(Boolean),
      types: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    },
  };
}

export async function getJobById(id: string) {
  const job = await prisma.job.findFirst({
    where: { id, status: 'Active' },
    select: {
      id: true,
      title: true,
      department: true,
      location: true,
      type: true,
      postedAt: true,
      applicants: true,
    },
  });

  return job;
}
