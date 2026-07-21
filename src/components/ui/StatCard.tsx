'use client';

import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Tailwind classes for icon wrapper, e.g. "text-brand-600 bg-brand-50" */
  iconClassName?: string;
  className?: string;
  /** Optional small helper under the label */
  sub?: React.ReactNode;
}

/**
 * Shared dashboard stat tile — same padding, type, border, and icon size everywhere.
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-brand-600 bg-brand-50',
  className = '',
  sub,
}: StatCardProps) {
  return (
    <div className={`card-ats-bordered p-4 flex items-center gap-3 min-w-0 ${className}`}>
      {Icon && (
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconClassName}`}>
          <Icon className="w-4 h-4" strokeWidth={2.25} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-stone-900 tracking-tight truncate">{value}</p>
        <p className="text-xs text-stone-500 truncate">{label}</p>
        {sub != null && sub !== '' && (
          <p className="text-[11px] text-stone-400 mt-0.5 truncate">{sub}</p>
        )}
      </div>
    </div>
  );
}
