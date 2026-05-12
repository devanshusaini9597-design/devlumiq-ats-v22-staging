'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Phone, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

export type CalendarEventData = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type?: string;
  candidate?: string;
};

const typeConfig: Record<string, { icon: typeof Video; label: string; iconBg: string; accent: string }> = {
  interview: { icon: Video, label: 'Interview', iconBg: 'bg-brand-500/10', accent: 'text-brand-700' },
  callback: { icon: Phone, label: 'Callback', iconBg: 'bg-warm-500/10', accent: 'text-warm-700' },
  offer: { icon: FileCheck, label: 'Offer Review', iconBg: 'bg-emerald-500/10', accent: 'text-emerald-700' },
};

export default function CalendarEventModal({
  event,
  onClose,
}: {
  event: CalendarEventData | null;
  onClose: () => void;
}) {
  const config = event ? typeConfig[event.type ?? 'interview'] ?? typeConfig.interview : null;
  const Icon = config?.icon ?? Video;

  useEffect(() => {
    if (event) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [event]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[400px] max-h-[85vh] pointer-events-auto"
            >
            <div className="bg-white rounded-2xl shadow-[var(--shadow-elevated)] border border-stone-200/80 overflow-hidden max-h-[85vh] flex flex-col">
              {/* Header - theme-aligned */}
              <div className="flex items-start justify-between gap-4 px-5 py-5 border-b border-stone-200/80 bg-white">
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-11 h-11 rounded-xl ${config?.iconBg ?? 'bg-brand-500/10'} border border-stone-200/80 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${config?.accent}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium tracking-wide ${config?.accent}`}>
                      {config?.label}
                    </p>
                    <h2 className="text-[17px] font-semibold text-stone-900 mt-0.5 truncate tracking-tight leading-tight">{event.title}</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -m-2 rounded-lg hover:bg-stone-200/50 text-stone-500 hover:text-stone-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content — spacing & typography */}
              <div className="flex-1 overflow-y-auto px-5 py-5 bg-stone-50/50">
                <dl className="space-y-4">
                  {event.candidate && (
                    <div className="px-4 py-3.5 rounded-xl bg-white/80 border border-stone-200/60 shadow-[var(--shadow-soft)]">
                      <dt className="text-xs font-medium text-stone-500 tracking-wide mb-1">Candidate</dt>
                      <dd className="text-[15px] font-semibold text-stone-900 tracking-tight">{event.candidate}</dd>
                    </div>
                  )}
                  <div className="px-4 py-3.5 rounded-xl bg-white/80 border border-stone-200/60 shadow-[var(--shadow-soft)]">
                    <dt className="text-xs font-medium text-stone-500 tracking-wide mb-1">Date</dt>
                    <dd className="text-[15px] font-semibold text-stone-900 tracking-tight">{format(event.start, 'EEEE, MMM d, yyyy')}</dd>
                  </div>
                  <div className="px-4 py-3.5 rounded-xl bg-white/80 border border-stone-200/60 shadow-[var(--shadow-soft)]">
                    <dt className="text-xs font-medium text-stone-500 tracking-wide mb-1">Time</dt>
                    <dd className="text-[15px] font-semibold text-stone-900 tracking-tight">
                      {format(event.start, 'h:mm a')} – {format(event.end, 'h:mm a')}
                    </dd>
                  </div>
                </dl>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-600/30 transition-all duration-200">
                    Join Meeting
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
