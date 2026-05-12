'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { useLocale } from '@/components/providers/LocaleProvider';

// ─── Data ────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "We've cut time-to-hire from 47 days to 18. The AI screening consistently surfaces candidates we'd have missed with manual review. It's genuinely transformative.",
    author: 'Sarah Chen',
    role: 'HR Director',
    company: 'TechFlow',
    avatar: 'SC',
    gradient: 'from-brand-500 to-teal-600',
    rating: 5,
    featured: true,
  },
  {
    quote: "The kanban pipeline changed how our whole team collaborates. Interview scheduling that took 3 back-and-forth emails now happens in a single click.",
    author: 'Marcus Johnson',
    role: 'Head of Talent',
    company: 'Nexora',
    avatar: 'MJ',
    gradient: 'from-violet-500 to-purple-600',
    rating: 5,
    featured: false,
  },
  {
    quote: "We scaled from 40 to 180 employees in 14 months. Without Devlumiq ATS handling the pipeline, that growth would have required two additional full-time recruiters.",
    author: 'Priya Patel',
    role: 'VP of People',
    company: 'DataFirst',
    avatar: 'PP',
    gradient: 'from-rose-500 to-pink-600',
    rating: 5,
    featured: false,
  },
  {
    quote: "The analytics dashboard gives our leadership team the hiring visibility they always wanted. Our offer acceptance rate jumped from 71% to 89% in one quarter.",
    author: 'Jake Martinez',
    role: 'Recruiting Lead',
    company: 'CloudScale',
    avatar: 'JM',
    gradient: 'from-amber-500 to-orange-600',
    rating: 5,
    featured: false,
  },
  {
    quote: "Migration from our old ATS took one afternoon. The career page builder made our job posts look genuinely premium — candidates actually comment on it during interviews.",
    author: 'Emily Park',
    role: 'Talent Operations',
    company: 'InnovateLab',
    avatar: 'EP',
    gradient: 'from-cyan-500 to-blue-600',
    rating: 5,
    featured: false,
  },
  {
    quote: "Every recruiter on my team calls it the best tool they've ever used. The ROI justified the full annual cost within the first month. It's not close.",
    author: 'David Kim',
    role: 'Chief People Officer',
    company: 'GrowthHQ',
    avatar: 'DK',
    gradient: 'from-emerald-500 to-teal-600',
    rating: 5,
  },
  {
    quote: "The smart match score alone has saved us dozens of hours per hire. We stopped guessing and started hiring with confidence. An incredible product.",
    author: 'Aisha Greene',
    role: 'Talent Acquisition Lead',
    company: 'AlphaTech',
    avatar: 'AG',
    gradient: 'from-fuchsia-500 to-pink-600',
    rating: 5,
  },
  {
    quote: "Setup was effortless and the onboarding wizard actually works. We went from spreadsheets to a professional ATS in an afternoon. Our team is 3× more productive.",
    author: 'Tom Rivera',
    role: 'Recruiting Manager',
    company: 'NextGen',
    avatar: 'TR',
    gradient: 'from-sky-500 to-blue-600',
    rating: 5,
  },
];

// Split into two rows for the dual marquee
const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4);

// ─── Single card ─────────────────────────────────────────────────────────────
function TestimonialCard({ t: card }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="relative flex-shrink-0 w-[272px] sm:w-[316px] bg-white rounded-2xl border border-stone-200/70 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.07)] p-5 mx-2.5 hover:border-brand-200/70 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] transition-all duration-300 group">
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400/5 via-transparent to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(card.rating)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      {/* Quote */}
      <div className="relative mb-4">
        <Quote className="absolute -top-1 -left-0.5 w-5 h-5 text-brand-100 stroke-[1.5]" />
        <p className="text-[13px] text-stone-600 leading-relaxed pl-5 line-clamp-3">
          {card.quote}
        </p>
      </div>
      {/* Author */}
      <div className="flex items-center gap-2.5 pt-3 border-t border-stone-100">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0 shadow-sm`}>
          {card.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-stone-900 text-xs leading-tight">{card.author}</p>
          <p className="text-stone-400 text-[10px] truncate">{card.role}</p>
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-semibold">
          {card.company}
        </span>
      </div>
    </div>
  );
}

// ─── Marquee row ──────────────────────────────────────────────────────────────
// Uses CSS animation for guaranteed smoothness & GPU compositing on all devices.
// Two identical sets side-by-side: animate translates exactly one set width so
// the loop is perfectly seamless — no jump, no fade, no pause.
function MarqueeRow({ items, reverse = false }: { items: typeof testimonials; reverse?: boolean }) {
  const animName = reverse ? 'marquee-rtl' : 'marquee-ltr';
  const duration = `${items.length * 9}s`;
  // Double the items — when the first set scrolls fully off screen, the second
  // set is in exactly the starting position, creating a seamless infinite loop.
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
          <TestimonialCard key={`${card.author}-${i}`} t={card} />
        ))}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function TestimonialsSection() {
  const { t } = useLocale();
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-stone-50 via-white to-stone-50 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(13 148 136) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
        <SectionHeading
          icon={Star}
          title={t('home.testimonialsTitle')}
          subtitle={t('home.testimonialsDesc')}
        />
      </div>

      {/* Trust bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-10 sm:mb-14"
      >
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
          </div>
          <span className="font-bold text-stone-900 text-sm">4.9/5</span>
          <span className="text-stone-500 text-xs">avg rating</span>
        </div>
        <div className="w-px h-4 bg-stone-200 hidden sm:block" />
        <span className="text-sm text-stone-500"><span className="font-bold text-stone-800">500+</span> companies</span>
        <div className="w-px h-4 bg-stone-200 hidden sm:block" />
        <span className="text-sm text-stone-500"><span className="font-bold text-stone-800">50K+</span> hires made</span>
        <div className="w-px h-4 bg-stone-200 hidden sm:block" />
        <span className="text-sm text-stone-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-stone-800">98%</span> satisfaction
        </span>
      </motion.div>

      {/* Marquee — Row 1 scrolls left */}
      <div className="relative mb-3.5 overflow-hidden">
        <MarqueeRow items={row1} />
      </div>

      {/* Marquee — Row 2 scrolls right */}
      <div className="relative overflow-hidden">
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  );
}
