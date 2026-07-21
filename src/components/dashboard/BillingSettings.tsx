'use client';

import { useEffect, useState } from 'react';
import { Loader2, CreditCard, ArrowUpRight, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';

interface SubscriptionData {
  subscription: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    seats: number;
    stripeCustomerId: boolean;
  };
  limits: {
    seats: number;
    candidates: number;
    jobs: number;
    ai: boolean;
    api: boolean;
    customPipeline: boolean;
    advancedAnalytics: boolean;
    sso: boolean;
    whiteLabel: boolean;
    byok: boolean;
  };
  display: {
    name: string;
    priceMonthly: number;
    priceAnnual: number;
  };
}

const planColors: Record<string, string> = {
  FREE: 'bg-stone-100 text-stone-700 border-stone-200',
  STARTER: 'bg-teal-50 text-teal-700 border-teal-200',
  PRO: 'bg-brand-50 text-brand-700 border-brand-200',
  ENTERPRISE: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function BillingSettings() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSub = async () => {
    const res = await fetch('/api/billing/subscription', { credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSub();
  }, []);

  const handleUpgrade = async (priceId: string) => {
    setActionLoading('upgrade');
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ priceId }),
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else setActionLoading(null);
  };

  const handlePortal = async () => {
    setActionLoading('portal');
    const res = await fetch('/api/billing/portal', {
      method: 'POST',
      credentials: 'include',
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!data) return null;

  const sub = data.subscription;
  const limits = data.limits;

  const isFree = sub.plan === 'FREE';
  const isTrialing = sub.status === 'TRIALING';

  const featureList = [
    { label: 'Users / seats', value: limits.seats === -1 ? 'Unlimited' : `${limits.seats}` },
    { label: 'Candidates / month', value: limits.candidates === -1 ? 'Unlimited' : `${limits.candidates}` },
    { label: 'Active jobs', value: limits.jobs === -1 ? 'Unlimited' : `${limits.jobs}` },
    { label: 'AI features', value: limits.ai },
    { label: 'API access', value: limits.api },
    { label: 'Custom pipeline', value: limits.customPipeline },
    { label: 'Advanced analytics', value: limits.advancedAnalytics },
    { label: 'SSO / SAML', value: limits.sso },
    { label: 'White-label', value: limits.whiteLabel },
    { label: 'BYOK key vault', value: limits.byok },
  ];

  const priceIds: Record<string, string | undefined> = {
    STARTER: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE,
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">Current Plan</h2>
            <p className="text-xs text-stone-500 mt-0.5">Your subscription and usage limits</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${planColors[sub.plan] ?? ''}`}>
            {data.display.name}
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            {sub.status === 'ACTIVE' || isTrialing ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span className="capitalize">{sub.status.toLowerCase()}</span>
            {sub.cancelAtPeriodEnd && (
              <span className="text-amber-600 text-xs">(cancels at period end)</span>
            )}
            {sub.currentPeriodEnd && (
              <span className="text-stone-500 ml-auto flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {featureList.map((f) => (
              <div key={f.label} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-sm">
                <span className="text-stone-600">{f.label}</span>
                <span className="font-medium text-stone-900">
                  {typeof f.value === 'boolean' ? (
                    f.value ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-stone-300">—</span>
                  ) : (
                    f.value
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-bold text-stone-900 mb-4">Billing Actions</h2>
        <div className="flex flex-wrap gap-3">
          {isFree ? (
            <>
              {priceIds.STARTER && (
                <button
                  onClick={() => handleUpgrade(priceIds.STARTER!)}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-teal-600 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all disabled:opacity-70"
                >
                  <CreditCard className="w-4 h-4" />
                  Upgrade to Starter
                </button>
              )}
              {priceIds.PRO && (
                <button
                  onClick={() => handleUpgrade(priceIds.PRO!)}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-all disabled:opacity-70"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handlePortal}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-teal-600 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all disabled:opacity-70"
            >
              <CreditCard className="w-4 h-4" />
              {actionLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage billing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
