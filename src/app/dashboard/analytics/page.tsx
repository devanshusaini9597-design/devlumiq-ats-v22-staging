'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Target, Clock, TrendingUp, TrendingDown,
  Activity, Briefcase, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useLocale } from '@/components/providers/LocaleProvider';
import { WeeklyChart, PipelineDoughnut } from '@/components/charts/DashboardCharts';

type DashboardSummary = {
  totalCandidates: number;
  thisMonth: number;
  pendingReview: number;
  conversionRate?: number;
  candidateTrend?: number;
  pipeline?: { stage: string; count: number }[];
  topPositions?: { position: string; count: number }[];
  topSources?: { source: string; count: number }[];
  dailySubmissions?: { date: string; count: number }[];
};

const positionColors = [
  { bar: 'from-brand-400 to-brand-600', badge: 'bg-brand-50 text-brand-700' },
  { bar: 'from-blue-400 to-blue-600', badge: 'bg-blue-50 text-blue-700' },
  { bar: 'from-violet-400 to-violet-600', badge: 'bg-violet-50 text-violet-700' },
  { bar: 'from-teal-400 to-teal-600', badge: 'bg-teal-50 text-teal-700' },
  { bar: 'from-amber-400 to-amber-600', badge: 'bg-amber-50 text-amber-700' },
  { bar: 'from-pink-400 to-pink-600', badge: 'bg-pink-50 text-pink-700' },
];

const sourceColors = [
  { bar: 'from-emerald-400 to-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
  { bar: 'from-sky-400 to-sky-600', badge: 'bg-sky-50 text-sky-700' },
  { bar: 'from-orange-400 to-orange-600', badge: 'bg-orange-50 text-orange-700' },
  { bar: 'from-rose-400 to-rose-600', badge: 'bg-rose-50 text-rose-700' },
  { bar: 'from-indigo-400 to-indigo-600', badge: 'bg-indigo-50 text-indigo-700' },
  { bar: 'from-cyan-400 to-cyan-600', badge: 'bg-cyan-50 text-cyan-700' },
];

export default function AnalyticsPage() {
  const { t } = useLocale();
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/dashboard/summary', { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then((json) => { if (!cancelled) setData(json as DashboardSummary); })
      .catch(() => {
        if (!cancelled) setData({ totalCandidates: 0, thisMonth: 0, pendingReview: 0, conversionRate: 0, topPositions: [], topSources: [], pipeline: [], dailySubmissions: [] });
      });
    return () => { cancelled = true; };
  }, []);

  const d = data ?? { totalCandidates: 0, thisMonth: 0, pendingReview: 0, conversionRate: 0, topPositions: [], topSources: [], pipeline: [], dailySubmissions: [] };

  if (data === null) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 w-48 rounded-xl bg-stone-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-2xl bg-stone-100" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-64 rounded-2xl bg-stone-100" /><div className="h-64 rounded-2xl bg-stone-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="h-52 rounded-2xl bg-stone-100" /><div className="h-52 rounded-2xl bg-stone-100" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: t('analytics.totalCandidates'), value: String(d.totalCandidates), icon: Users, trend: d.candidateTrend, gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100', blob: 'bg-indigo-300', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: t('analytics.thisMonth'), value: String(d.thisMonth), icon: Activity, gradient: 'bg-gradient-to-br from-teal-50 to-emerald-100', blob: 'bg-teal-200', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
    { label: t('analytics.conversionRate'), value: `${d.conversionRate ?? 0}%`, icon: Target, gradient: 'bg-gradient-to-br from-violet-50 to-purple-100', blob: 'bg-violet-200', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
    { label: t('analytics.pendingReview'), value: String(d.pendingReview), icon: Clock, gradient: 'bg-gradient-to-br from-amber-50 to-orange-100', blob: 'bg-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  ];

  const maxPos = Math.max(...(d.topPositions ?? []).map(p => p.count), 1);
  const maxSrc = Math.max(...(d.topSources ?? []).map(s => s.count), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="space-y-5">
      {/* --- Section: Analytics Root - start --- */}
      <PageHeader icon={BarChart3} title={t('analytics.title')} subtitle={t('analytics.subtitle')} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4, scale: 1.01 }}
              className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${s.gradient} transition-all duration-300`}>
              <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full ${s.blob} opacity-35 blur-sm pointer-events-none`} />
              <div className={`absolute -bottom-3 -right-7 w-16 h-16 rounded-full ${s.blob} opacity-20 pointer-events-none`} />
              <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-2 sm:mb-3 shadow-sm`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.iconColor}`} />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-stone-800 tabular-nums tracking-tight leading-none">{s.value}</p>
              <p className="text-[11px] sm:text-sm font-medium text-stone-500 mt-0.5 leading-tight">{s.label}</p>
              {s.trend !== undefined && s.trend !== null && (
                <div className="flex items-center gap-1 mt-1.5 min-w-0">
                  {s.trend >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />}
                  <span className={`text-[10px] sm:text-xs font-bold ${s.trend >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{s.trend >= 0 ? '+' : ''}{s.trend}%</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"><BarChart3 className="w-4 h-4 text-brand-600" /></div>
            <h2 className="text-base font-bold text-stone-900">{t('analytics.weeklyApplications')}</h2>
          </div>
          <WeeklyChart dailySubmissions={d.dailySubmissions} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0"><Target className="w-4 h-4 text-violet-600" /></div>
            <h2 className="text-base font-bold text-stone-900">{t('analytics.pipelineDistribution')}</h2>
          </div>
          <PipelineDoughnut pipeline={d.pipeline} />
        </motion.div>
      </div>

      {/* Top Positions & Sources with animated bar charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0"><Briefcase className="w-4 h-4 text-blue-600" /></div>
            <h2 className="text-base font-bold text-stone-900">{t('analytics.topPositions')}</h2>
          </div>
          {(d.topPositions ?? []).length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3"><Briefcase className="w-5 h-5 text-stone-300" /></div>
              <p className="text-sm text-stone-400 font-medium">No positions data yet</p>
              <p className="text-xs text-stone-400 mt-1">Add candidates to see top positions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(d.topPositions ?? []).slice(0, 6).map((p, i) => {
                const pct = Math.round((p.count / maxPos) * 100);
                const c = positionColors[i % positionColors.length];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="text-sm font-medium text-stone-700 truncate min-w-0 flex-1">{p.position}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${c.badge}`}>{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.75, delay: 0.3 + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={`h-full rounded-full bg-gradient-to-r ${c.bar}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0"><ArrowUpRight className="w-4 h-4 text-emerald-600" /></div>
            <h2 className="text-base font-bold text-stone-900">{t('analytics.topSources')}</h2>
          </div>
          {(d.topSources ?? []).length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3"><CheckCircle2 className="w-5 h-5 text-stone-300" /></div>
              <p className="text-sm text-stone-400 font-medium">No source data yet</p>
              <p className="text-xs text-stone-400 mt-1">Add candidates with source info</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(d.topSources ?? []).slice(0, 6).map((s, i) => {
                const pct = Math.round((s.count / maxSrc) * 100);
                const c = sourceColors[i % sourceColors.length];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="text-sm font-medium text-stone-700 truncate min-w-0 flex-1">{s.source}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${c.badge}`}>{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.75, delay: 0.35 + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className={`h-full rounded-full bg-gradient-to-r ${c.bar}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      {/* --- Section: Analytics Root - end --- */}
    </motion.div>
  );
}

