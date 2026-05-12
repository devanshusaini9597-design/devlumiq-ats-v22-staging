'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Check, X, Zap, Building2, Crown, Shield, RefreshCw, CheckCircle2,
  ArrowUpRight, Star, Users, TrendingUp, Sparkles, ChevronDown,
  HeadphonesIcon, Globe, Lock, BarChart3, Rocket,
} from 'lucide-react';
import CTASection from '@/components/sections/CTASection';
import { useLocale } from '@/components/providers/LocaleProvider';

/* ─── Data ─────────────────────────────────────────────────────────────── */

const plansMeta = [
  { id: 'starter',    icon: Zap,       monthly: 29,  annual: 23,  iconBg: 'bg-slate-100', iconColor: 'text-slate-600', highlighted: false,
    nameKey: 'pricing.plan1Name', descKey: 'pricing.plan1Desc', ctaKey: 'pricing.plan1Cta', badgeKey: null as string | null,
    featureKeys: ['pricing.plan1F1','pricing.plan1F2','pricing.plan1F3','pricing.plan1F4','pricing.plan1F5','pricing.plan1F6','pricing.plan1F7','pricing.plan1F8'],
    missingKeys: ['pricing.plan1M1','pricing.plan1M2','pricing.plan1M3','pricing.plan1M4','pricing.plan1M5'] },
  { id: 'pro',        icon: Crown,     monthly: 79,  annual: 63,  iconBg: 'bg-brand-50',  iconColor: 'text-brand-600', highlighted: true,
    nameKey: 'pricing.plan2Name', descKey: 'pricing.plan2Desc', ctaKey: 'pricing.plan2Cta', badgeKey: 'pricing.plan2Badge' as string | null,
    featureKeys: ['pricing.plan2F1','pricing.plan2F2','pricing.plan2F3','pricing.plan2F4','pricing.plan2F5','pricing.plan2F6','pricing.plan2F7','pricing.plan2F8'],
    missingKeys: ['pricing.plan2M1','pricing.plan2M2'] },
  { id: 'enterprise', icon: Building2, monthly: 199, annual: 159, iconBg: 'bg-violet-50', iconColor: 'text-violet-600', highlighted: false,
    nameKey: 'pricing.plan3Name', descKey: 'pricing.plan3Desc', ctaKey: 'pricing.plan3Cta', badgeKey: 'pricing.plan3Badge' as string | null,
    featureKeys: ['pricing.plan3F1','pricing.plan3F2','pricing.plan3F3','pricing.plan3F4','pricing.plan3F5','pricing.plan3F6','pricing.plan3F7','pricing.plan3F8','pricing.plan3F9','pricing.plan3F10'],
    missingKeys: [] as string[] },
];

type ComparisonRow = { feature: string; icon: React.ElementType; values: (string | boolean)[] };

const comparisonRows: ComparisonRow[] = [
  { feature: 'Team Members', icon: Users, values: ['3', '15', 'Unlimited'] },
  { feature: 'Active Jobs', icon: Rocket, values: ['5', '50', 'Unlimited'] },
  { feature: 'Candidates / month', icon: TrendingUp, values: ['100', '1,000', 'Unlimited'] },
  { feature: 'AI Resume Screening', icon: Sparkles, values: [true, true, true] },
  { feature: 'Custom Pipeline Stages', icon: BarChart3, values: [false, true, true] },
  { feature: 'Analytics & Reports', icon: BarChart3, values: ['Basic', 'Advanced', 'Enterprise'] },
  { feature: 'API Access', icon: Globe, values: [false, true, true] },
  { feature: 'Priority Support', icon: HeadphonesIcon, values: [false, true, true] },
  { feature: 'SSO / SAML 2.0', icon: Lock, values: [false, false, true] },
  { feature: 'Dedicated CSM', icon: Star, values: [false, false, true] },
];

const pricingFaqs = [
  { q: 'Is there a free trial?', a: 'Every plan includes a full 14-day free trial with no credit card required. You get access to all features with no watermarks or limits so you can make a real evaluation.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
  { q: 'How does annual billing work?', a: "Annual plans are billed once per year and save you 20% compared to monthly. You'll see the per-month equivalent displayed on each card." },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for Enterprise plans.' },
  { q: 'Is my data secure?', a: 'Yes — TLS in transit, AES-256 at rest, SOC 2 Type II, GDPR-compliant, role-based access controls, and full audit logs. Enterprise adds SSO + SCIM.' },
];

const trustLogos = ['TechFlow', 'Nexora', 'CloudScale', 'DataFirst', 'GrowthHQ', 'InnovateLab'];

/* ─── Component ────────────────────────────────────────────────────────── */

export default function PricingPage() {
  const { t } = useLocale();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isAnnual = billing === 'annual';
  const plans = plansMeta.map(p => ({
    ...p,
    name: t(p.nameKey),
    desc: t(p.descKey),
    cta: t(p.ctaKey),
    badge: p.badgeKey ? t(p.badgeKey) : null,
    features: p.featureKeys.map(k => t(k)),
    missing: p.missingKeys.map(k => t(k)),
  }));

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 pt-20 pb-28 sm:pt-28 sm:pb-36 px-4">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full bg-teal-500/15 blur-[80px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-brand-400 text-[11px] font-bold uppercase tracking-widest">Simple, transparent pricing</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-5"
          >
            Pricing that scales{' '}
            <span className="bg-gradient-to-r from-brand-400 via-teal-400 to-brand-300 bg-clip-text text-transparent">with you</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-stone-400 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Start free. No credit card. Upgrade when your team grows. Every plan includes a full 14-day trial.
          </motion.p>
          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]"
          >
            <button onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${!isAnnual ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
            >Monthly</button>
            <button onClick={() => setBilling('annual')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${isAnnual ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-200'}`}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">-20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Plan Cards ───────────────────────────────────────────────────── */}
      <section className="relative bg-stone-50 px-4 sm:px-6 lg:px-8 -mt-16 pb-20 sm:pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const price = isAnnual ? plan.annual : plan.monthly;
              const saving = (plan.monthly - plan.annual) * 12;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.15, type: 'spring', stiffness: 260, damping: 22 }}
                  className={`relative flex flex-col rounded-2xl ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-[#0f0f0f] to-[#0d1a1a] border-2 border-brand-500/60 shadow-[0_0_60px_-8px_rgba(13,148,136,0.35),0_32px_64px_-16px_rgba(0,0,0,0.4)] md:-translate-y-3'
                      : 'bg-white border border-stone-200 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)] hover:border-stone-300 transition-all duration-300'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide text-white shadow-lg ${plan.highlighted ? 'bg-gradient-to-r from-brand-500 to-teal-500 shadow-brand-500/40' : 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/30'}`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col">
                    <div className="flex items-start gap-3.5 mb-5">
                      <div className={`w-11 h-11 rounded-xl ${plan.highlighted ? 'bg-brand-500/15' : plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${plan.highlighted ? 'text-brand-400' : plan.iconColor}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-black ${plan.highlighted ? 'text-white' : 'text-stone-900'}`}>{plan.name}</h3>
                        <p className={`text-xs leading-snug mt-0.5 ${plan.highlighted ? 'text-stone-400' : 'text-stone-500'}`}>{plan.desc}</p>
                      </div>
                    </div>
                    <div className="mb-1">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-[2.75rem] font-black leading-none tracking-tight ${plan.highlighted ? 'text-white' : 'text-stone-900'}`}>${price}</span>
                        <span className={`text-sm font-medium ${plan.highlighted ? 'text-stone-500' : 'text-stone-400'}`}>/mo</span>
                      </div>
                    </div>
                    <div className="h-6 mb-6">
                      <AnimatePresence mode="wait">
                        {isAnnual ? (
                          <motion.p key="a" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="text-xs text-emerald-500 font-bold">
                            Save ${saving}/year &middot; billed annually
                          </motion.p>
                        ) : (
                          <motion.p key="m" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className={`text-xs ${plan.highlighted ? 'text-stone-500' : 'text-stone-400'}`}>
                            Switch to annual to save {Math.round((1 - plan.annual / plan.monthly) * 100)}%
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <Link href={plan.id === 'enterprise' ? '/contact' : '/signup'} className="block mb-7">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          plan.highlighted
                            ? 'bg-gradient-to-r from-brand-500 to-teal-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50'
                            : plan.id === 'enterprise'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                            : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm'
                        }`}
                      >{plan.cta}<ArrowUpRight className="w-4 h-4" /></motion.button>
                    </Link>
                    <div className={`h-px mb-5 ${plan.highlighted ? 'bg-white/10' : 'bg-stone-100'}`} />
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlighted ? 'bg-brand-500/20' : 'bg-emerald-50'}`}>
                            <Check className={`w-2.5 h-2.5 ${plan.highlighted ? 'text-brand-400' : 'text-emerald-600'}`} />
                          </div>
                          <span className={plan.highlighted ? 'text-stone-300' : 'text-stone-700'}>{f}</span>
                        </li>
                      ))}
                      {plan.missing.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-stone-100">
                            <X className="w-2.5 h-2.5 text-stone-300" />
                          </div>
                          <span className="text-stone-400">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {[
              { icon: Shield, text: 'No credit card required' },
              { icon: RefreshCw, text: 'Cancel anytime' },
              { icon: CheckCircle2, text: '14-day free trial' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-stone-500">
                <Icon className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Social proof logos ───────────────────────────────────────────── */}
      <section className="py-12 px-4 border-y border-stone-100 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Trusted by 500+ forward-thinking companies</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustLogos.map((logo) => (
              <span key={logo} className="text-sm font-black text-stone-300 tracking-wide">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-3">Compare all features</h2>
            <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto">Every detail, side by side — so you can pick the right plan with confidence.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl border border-stone-200 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]"
          >
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="p-5 text-left w-[40%]">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Feature</span>
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} className={`p-5 text-center ${p.highlighted ? 'bg-gradient-to-b from-brand-50 to-teal-50/30' : ''}`}>
                      <span className={`text-sm font-black ${p.highlighted ? 'text-brand-700' : 'text-stone-700'}`}>{p.name}</span>
                      {p.highlighted && <div className="mt-1 w-6 h-0.5 bg-gradient-to-r from-brand-500 to-teal-500 rounded-full mx-auto" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => {
                  const RowIcon = row.icon;
                  return (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="p-4 font-medium text-stone-700 border-b border-stone-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                            <RowIcon className="w-3.5 h-3.5 text-stone-400" />
                          </div>
                          {row.feature}
                        </div>
                      </td>
                      {row.values.map((val, j) => (
                        <td key={j} className={`p-4 text-center border-b border-stone-100 ${j === 1 ? 'bg-brand-50/20' : ''}`}>
                          {typeof val === 'boolean' ? (
                            val ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
                                <X className="w-3 h-3 text-stone-300" />
                              </div>
                            )
                          ) : (
                            <span className={`font-bold ${j === 1 ? 'text-brand-700' : 'text-stone-700'}`}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-stone-50 border-t border-stone-100">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-3">Frequently asked questions</h2>
            <p className="text-stone-500 text-sm sm:text-base">
              Can&apos;t find what you&apos;re looking for?{' '}
              <Link href="/contact" className="text-brand-600 font-semibold hover:underline">Talk to us</Link>.
            </p>
          </motion.div>
          <div className="space-y-2">
            {pricingFaqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]"
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="font-bold text-stone-900 text-sm sm:text-base pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center"
                  >
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}>
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <CTASection title={t('pricing.ctaTitle')} subtitle={t('pricing.ctaSubtitle')} />
    </>
  );
}


