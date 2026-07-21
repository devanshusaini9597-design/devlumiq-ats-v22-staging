'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, TrendingUp, BarChart3, RefreshCw,
  Eye, Clock, CheckCircle, XCircle, Sparkles, ChevronRight,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface PipelineStage { stage: string; count: number }
interface SummaryData {
  totalCandidates: number;
  openPositions: number;
  conversionRate: number;
  rejectionRate: number;
  avgTimeToHire: number;
  pipeline: PipelineStage[];
  thisMonth: number;
  lastMonth: number;
  topSources: { source: string; count: number }[];
}

const STAGE_META: Record<string, { barFrom: string; barTo: string }> = {
  Applied:   { barFrom: 'from-brand-400', barTo: 'to-brand-600' },
  Screening: { barFrom: 'from-sky-400', barTo: 'to-sky-600' },
  Interview: { barFrom: 'from-amber-400', barTo: 'to-amber-600' },
  Offer:     { barFrom: 'from-emerald-400', barTo: 'to-emerald-600' },
  Hired:     { barFrom: 'from-green-400', barTo: 'to-green-600' },
  Rejected:  { barFrom: 'from-red-400', barTo: 'to-red-600' },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } };

export default function ViewerDashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/summary', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setLastRefreshed(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pipeline = data?.pipeline ?? [];
  const totalInPipeline = pipeline.reduce((s, p) => s + p.count, 0);

  const statCards = [
    { label: 'Total Candidates', value: data?.totalCandidates ?? 0, icon: Users, accent: 'brand', sub: `+${data?.thisMonth ?? 0} this month`, trend: '' },
    { label: 'Open Positions',   value: data?.openPositions ?? 0,   icon: Briefcase, accent: 'sky', sub: 'Active jobs', trend: '' },
    { label: 'Hire Rate',        value: `${data?.conversionRate ?? 0}%`, icon: CheckCircle, accent: 'emerald', sub: 'Conversion rate', trend: '' },
    { label: 'Avg. Time to Hire', value: data?.avgTimeToHire ? `${data.avgTimeToHire}d` : '—', icon: Clock, accent: 'amber', sub: 'Days average', trend: '' },
  ];

  const accentGrad: Record<string, string> = {
    brand: 'from-brand-500 to-teal-600',
    sky: 'from-sky-500 to-blue-600',
    emerald: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">
      {/* ── Hero Header ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-50 via-white to-brand-50/30 border border-stone-200/80 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stone-200/40 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-300/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-stone-500" />
              <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Read-only View</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">Recruitment Overview</h1>
            <p className="text-sm text-stone-500 mt-1.5">Read-only snapshot · <span className="text-stone-700 font-medium">{lastRefreshed.toLocaleTimeString()}</span></p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={load} disabled={loading} className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition-all text-stone-500 disabled:opacity-40 shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Premium Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={fadeUp}
              className="group relative rounded-2xl bg-white border border-stone-200/80 p-5 overflow-hidden hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${accentGrad[card.accent]} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGrad[card.accent]} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {card.trend && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{card.trend}</span>
                  )}
                </div>
                <p className="text-3xl font-bold text-stone-900 tracking-tight">{card.value}</p>
                <p className="text-sm font-medium text-stone-600 mt-0.5">{card.label}</p>
                <p className="text-xs text-stone-400 mt-1">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Pipeline Breakdown ── */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Pipeline Breakdown</h2>
              <p className="text-xs text-stone-500">{totalInPipeline} candidates in pipeline</p>
            </div>
          </div>

          {totalInPipeline === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 font-medium">No pipeline data yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pipeline.filter(p => p.count > 0).map(p => {
                const pct = Math.round((p.count / totalInPipeline) * 100);
                const meta = STAGE_META[p.stage] ?? { barFrom: 'from-stone-400', barTo: 'to-stone-500' };
                return (
                  <div key={p.stage} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-stone-700">{p.stage}</span>
                      <span className="text-sm font-bold text-stone-900">{p.count} <span className="text-xs text-stone-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${meta.barFrom} ${meta.barTo}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Key Metrics ── */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Key Metrics</h2>
              <p className="text-xs text-stone-500">Performance indicators</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { icon: CheckCircle, label: 'Hire Rate', value: `${data?.conversionRate ?? 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600', barPct: data?.conversionRate ?? 0 },
              { icon: XCircle, label: 'Rejection Rate', value: `${data?.rejectionRate ?? 0}%`, color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-gradient-to-r from-red-400 to-red-600', barPct: data?.rejectionRate ?? 0 },
              { icon: Clock, label: 'Avg. Time to Hire', value: data?.avgTimeToHire ? `${data.avgTimeToHire} days` : '—', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-gradient-to-r from-amber-400 to-amber-600', barPct: data?.avgTimeToHire ? Math.min((data.avgTimeToHire / 30) * 100, 100) : 0 },
              { icon: Users, label: 'New This Month', value: String(data?.thisMonth ?? 0), color: 'text-brand-600', bg: 'bg-brand-50', bar: 'bg-gradient-to-r from-brand-400 to-brand-600', barPct: data?.thisMonth ? Math.min((data.thisMonth / 20) * 100, 100) : 0 },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-stone-800">{m.label}</span>
                      <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.barPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${m.bar}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Sources */}
          {data?.topSources && data.topSources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Top Sources</p>
              </div>
              <div className="space-y-2">
                {data.topSources.map(s => (
                  <div key={s.source} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((s.count / (data.topSources?.[0]?.count ?? 1)) * 100, 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                    </div>
                    <span className="text-sm text-stone-600 w-24 text-right truncate">{s.source}</span>
                    <span className="text-sm font-bold text-stone-800 w-6 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick Links ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 via-white to-brand-50/30 border border-stone-200/80 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stone-200/20 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <p className="text-sm font-bold text-stone-800">Browse (Read-Only)</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/candidates" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm hover:shadow-md">
              <Users className="w-4 h-4 text-brand-500" />Candidates
            </Link>
            <Link href="/dashboard/jobs" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm hover:shadow-md">
              <Briefcase className="w-4 h-4 text-sky-500" />Jobs
            </Link>
            <Link href="/dashboard/analytics" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm hover:shadow-md">
              <BarChart3 className="w-4 h-4 text-amber-500" />Analytics
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
