import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/dashboard - Get analytics dashboard data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const jobId = searchParams.get('jobId');

    const dateFilter = getDateFilter(period);

    // Pipeline metrics
    const pipelineMetrics = await prisma.pipelineMetric.findMany({
      where: {
        date: { gte: dateFilter },
        ...(jobId ? { jobId } : {}),
      },
      orderBy: { date: 'asc' },
    });

    // Source quality metrics
    const sourceMetrics = await prisma.sourceQualityMetric.findMany({
      where: {
        date: { gte: dateFilter },
      },
      orderBy: { date: 'asc' },
    });

    // Time to hire metrics
    const timeToHire = await prisma.timeToHireMetric.findMany({
      where: {
        appliedAt: { gte: dateFilter },
        ...(jobId ? { jobId } : {}),
      },
    });

    // Calculate aggregate stats
    const stats = {
      totalApplicants: await prisma.application.count({
        where: { appliedAt: { gte: dateFilter } },
      }),
      avgTimeToHire: calculateAvgTimeToHire(timeToHire),
      conversionRates: calculateConversionRates(pipelineMetrics),
      topSources: getTopSources(sourceMetrics),
    };

    return NextResponse.json({
      period,
      stats,
      pipelineMetrics,
      sourceMetrics,
      timeToHire,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function getDateFilter(period: string): Date {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '90d':
      return new Date(now.setDate(now.getDate() - 90));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
}

function calculateAvgTimeToHire(metrics: any[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + (m.totalTimeToHire || 0), 0);
  return Math.round(total / metrics.length / 24); // Convert hours to days
}

function calculateConversionRates(metrics: any[]): any {
  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
  return stages.map(stage => {
    const stageMetrics = metrics.filter(m => m.stageName === stage);
    const totalIn = stageMetrics.reduce((sum, m) => sum + m.candidatesIn, 0);
    const totalOut = stageMetrics.reduce((sum, m) => sum + m.candidatesOut, 0);
    return {
      stage,
      conversionRate: totalIn > 0 ? (totalOut / totalIn) * 100 : 0,
    };
  });
}

function getTopSources(metrics: any[]): any[] {
  const grouped = metrics.reduce((acc, m) => {
    if (!acc[m.source]) {
      acc[m.source] = { source: m.source, hires: 0, applicants: 0 };
    }
    acc[m.source].hires += m.hires;
    acc[m.source].applicants += m.totalApplicants;
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a: any, b: any) => b.hires - a.hires)
    .slice(0, 5);
}
