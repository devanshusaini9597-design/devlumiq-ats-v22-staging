'use client';

import { motion } from 'framer-motion';
import {
  Users, LayoutDashboard, Briefcase, Calendar, BarChart3, Globe,
  FileText, MessageSquare, Shield, Sparkles, CheckCircle2,
} from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { useLocale } from '@/components/providers/LocaleProvider';

const modules = [
  {
    title: 'Candidates & jobs',
    desc: 'CRUD, filters, CSV import, PDF/Excel export, and job posting management.',
    icon: Users,
    gradient: 'from-brand-500 to-teal-600',
  },
  {
    title: 'Kanban pipeline',
    desc: 'Drag-and-drop stages that persist to PostgreSQL for the whole team.',
    icon: LayoutDashboard,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Careers portal',
    desc: 'Public job listings and apply flow so candidates can submit applications.',
    icon: Briefcase,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Interview calendar',
    desc: 'FullCalendar events in your database; optional Google Calendar OAuth sync.',
    icon: Calendar,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    title: 'Analytics & reports',
    desc: 'Dashboard charts plus PDF export; advanced metrics follow your license.',
    icon: BarChart3,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    title: '10 locales + RTL',
    desc: 'English, Arabic (RTL), Spanish, French, German, and more built in.',
    icon: Globe,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Resume & AI tools',
    desc: 'Parse, rank, screen, JD gen, and email draft — rules by default, OpenAI optional.',
    icon: Sparkles,
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  {
    title: 'Team collaboration',
    desc: 'Inbox, messages, comments with @mentions, notifications, and RBAC.',
    icon: MessageSquare,
    gradient: 'from-sky-500 to-blue-600',
  },
];

function ModuleCard({
  title,
  desc,
  icon: Icon,
  gradient,
}: (typeof modules)[0]) {
  return (
    <div className="relative flex-shrink-0 w-[272px] sm:w-[316px] bg-white rounded-2xl border border-stone-200/70 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] p-5 mx-2.5 hover:border-brand-200/70 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] transition-all duration-300 group">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400/5 via-transparent to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="font-bold text-stone-900 text-sm mb-1.5">{title}</h3>
      <p className="text-[13px] text-stone-600 leading-relaxed line-clamp-3">{desc}</p>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100 text-[11px] font-semibold text-brand-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Included in product
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: typeof modules; reverse?: boolean }) {
  const animName = reverse ? 'marquee-rtl' : 'marquee-ltr';
  const duration = `${items.length * 9}s`;
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden" style={{ willChange: 'transform' }}>
      <div
        className="flex flex-shrink-0"
        style={{
          animation: `${animName} ${duration} linear infinite`,
        }}
      >
        {doubled.map((card, i) => (
          <ModuleCard key={`${card.title}-${i}`} {...card} />
        ))}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const { t } = useLocale();
  const row1 = modules.slice(0, 4);
  const row2 = modules.slice(4);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-stone-50 via-white to-stone-50 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(13 148 136) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
        <SectionHeading
          icon={FileText}
          title={t('home.testimonialsTitle')}
          subtitle={t('home.testimonialsDesc')}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-10 sm:mb-14"
      >
        <span className="text-sm text-stone-500 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-500" />
          Self-hosted source code
        </span>
        <div className="w-px h-4 bg-stone-200 hidden sm:block" />
        <span className="text-sm text-stone-500">PostgreSQL-backed</span>
        <div className="w-px h-4 bg-stone-200 hidden sm:block" />
        <span className="text-sm text-stone-500">Optional OpenAI</span>
      </motion.div>

      <div className="relative mb-3.5 overflow-hidden">
        <MarqueeRow items={row1} />
      </div>
      <div className="relative overflow-hidden">
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  );
}
