'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, User, Briefcase, Video, MapPin,
  RefreshCw, CheckCircle2, AlertCircle, Star, ArrowRight,
  ChevronRight, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface InterviewItem {
  id: string;
  candidate: string;
  position: string;
  time: string;
  type: string;
  interviewer: string;
}

interface CallbackItem {
  id: string;
  candidateName: string;
  candidatePosition: string;
  callBackDate: string;
  daysRemaining: number;
  priority: 'urgent' | 'high' | 'medium';
}

interface SummaryData {
  upcomingInterviews: InterviewItem[];
  callbacks: CallbackItem[];
  totalCandidates: number;
  openPositions: number;
}

const PRIORITY_META: Record<string, { badge: string; dot: string; bg: string }> = {
  urgent: { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', bg: 'bg-red-50/60' },
  high:   { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', bg: 'bg-amber-50/60' },
  medium: { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', bg: 'bg-sky-50/60' },
};

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Technical:  { icon: Star,        color: 'text-violet-600', bg: 'bg-violet-100' },
  Behavioral: { icon: User,        color: 'text-sky-600',    bg: 'bg-sky-100' },
  'HR Screen':{ icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } };

export default function InterviewerDashboard() {
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

  const interviews = data?.upcomingInterviews ?? [];
  const callbacks = data?.callbacks ?? [];

  const statCards = [
    { label: 'Upcoming Interviews', value: interviews.length, icon: Calendar, accent: 'sky', sub: 'Next 7 days', trend: '' },
    { label: 'Pending Follow-ups', value: callbacks.length, icon: Clock, accent: 'amber', sub: 'Need action', trend: '' },
    { label: 'Open Positions', value: data?.openPositions ?? 0, icon: Briefcase, accent: 'brand', sub: 'Active jobs', trend: '' },
    { label: 'In Pipeline', value: data?.totalCandidates ?? 0, icon: User, accent: 'violet', sub: 'Total candidates', trend: '' },
  ];

  const accentGrad: Record<string, string> = {
    sky: 'from-sky-500 to-blue-600',
    amber: 'from-amber-500 to-orange-600',
    brand: 'from-brand-500 to-teal-600',
    violet: 'from-violet-500 to-purple-600',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">
      {/* ── Hero Header ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-brand-50/30 border border-stone-200/80 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/30 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Interviewer Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">My Interview Queue</h1>
            <p className="text-sm text-stone-500 mt-1.5">Your assigned interviews · <span className="text-stone-700 font-medium">{lastRefreshed.toLocaleTimeString()}</span></p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/calendar" className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-all shadow-lg shadow-sky-500/20">
              <Calendar className="w-4 h-4" />Calendar
            </Link>
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
        {/* ── Upcoming Interviews ── */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Upcoming Interviews</h2>
                <p className="text-xs text-stone-500">{interviews.length} scheduled</p>
              </div>
            </div>
            <Link href="/dashboard/calendar" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              View calendar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 font-medium">No upcoming interviews</p>
              <p className="text-xs text-stone-400 mt-1">You have no assigned interviews in the next 7 days.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {interviews.map((iv) => {
                const typeMeta = TYPE_META[iv.type] ?? { icon: Video, color: 'text-stone-600', bg: 'bg-stone-100' };
                const TypeIcon = typeMeta.icon;
                return (
                  <div key={iv.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer border border-transparent hover:border-stone-200">
                    <div className={`w-9 h-9 rounded-xl ${typeMeta.bg} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-4 h-4 ${typeMeta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{iv.candidate}</p>
                      <p className="text-xs text-stone-500 truncate">{iv.position}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <Clock className="w-3 h-3" />{iv.time}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeMeta.bg.replace('bg-', 'border-').replace('100', '200')} ${typeMeta.color}`}>{iv.type}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-2" />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Pending Follow-ups ── */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Pending Follow-ups</h2>
              <p className="text-xs text-stone-500">{callbacks.length} reminders</p>
            </div>
          </div>

          {callbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 font-medium">All caught up!</p>
              <p className="text-xs text-stone-400 mt-1">No pending follow-ups right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {callbacks.map((cb) => {
                const meta = PRIORITY_META[cb.priority];
                return (
                  <div key={cb.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${meta.bg} ${meta.badge.split(' ')[2]}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${meta.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{cb.candidateName}</p>
                      <p className="text-xs text-stone-500 truncate">{cb.candidatePosition}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="w-3 h-3" />{cb.callBackDate}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                          {cb.daysRemaining <= 0 ? 'Overdue' : `${cb.daysRemaining}d left`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick Access ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-white to-brand-50/30 border border-stone-200/80 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/20 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <p className="text-sm font-bold text-stone-800">Quick Access</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/candidates" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm hover:shadow-md">
              <User className="w-4 h-4 text-sky-500" />Candidates
            </Link>
            <Link href="/dashboard/calendar" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm hover:shadow-md">
              <Calendar className="w-4 h-4 text-sky-500" />Full Calendar
            </Link>
            <Link href="/dashboard/premium/scoring" className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors border border-stone-200 shadow-sm hover:shadow-md">
              <Star className="w-4 h-4 text-amber-500" />Score Cards
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
