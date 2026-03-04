'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { FormData } from '@/types/form';
import { motion, AnimatePresence } from 'framer-motion';

interface StepServicesProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

/* ── Icons ── */
const ManpowerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const PackagingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const LiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 11 12 6 7 11"/>
    <line x1="12" y1="6" x2="12" y2="18"/>
    <path d="M5 20h14"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Manpower card ── */
function ManpowerCard({ formData, onChange, t }: { formData: FormData; onChange: (u: Partial<FormData>) => void; t: (k: string) => string }) {
  const enabled = formData.manpower.enabled;
  const count = formData.manpower.count;

  const setCount = (n: number) => {
    if (n <= 0) onChange({ manpower: { count: 1, enabled: false } });
    else onChange({ manpower: { count: n, enabled: true } });
  };

  return (
    <div className={`rounded-2xl bg-white transition-all duration-200 overflow-hidden ${enabled ? 'ring-1 ring-orange shadow-sm shadow-orange/10' : 'ring-1 ring-border'}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className={`shrink-0 transition-colors duration-200 ${enabled ? 'text-orange' : 'text-muted/40'}`}>
          <ManpowerIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm transition-colors ${enabled ? 'text-navy' : 'text-navy/60'}`}>{t('steps.services.manpower')}</div>
          <div className="text-[11px] text-muted mt-0.5 leading-tight">{t('steps.services.manpowerDesc')}</div>
        </div>
        {/* Integrated stepper */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCount(enabled ? count - 1 : 0)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all cursor-pointer ${enabled ? 'bg-navy/8 text-navy hover:bg-navy/15' : 'bg-surface text-muted/40'}`}
          >−</button>
          <span className={`w-5 text-center text-sm font-bold tabular-nums transition-colors ${enabled ? 'text-navy' : 'text-muted/40'}`}>
            {enabled ? count : 0}
          </span>
          <button
            type="button"
            onClick={() => setCount(enabled ? Math.min(count + 1, 10) : 1)}
            className="w-8 h-8 rounded-full bg-orange text-white flex items-center justify-center text-base font-bold cursor-pointer hover:bg-orange/90 transition-all"
          >+</button>
        </div>
      </div>

      {/* Person cost row — shown when enabled */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange/[0.06] border border-orange/15">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-orange/70 shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span className="text-[11px] text-navy/70 font-medium">
                {count} {count === 1 ? t('steps.services.people').replace(/s$/, '') : t('steps.services.people')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Simple toggle card (packaging / lift) ── */
function ServiceCard({
  enabled, onToggle, icon, title, description,
}: {
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-2xl bg-white flex items-center gap-3 px-4 py-3.5 transition-all duration-200 cursor-pointer ${enabled ? 'ring-1 ring-orange shadow-sm shadow-orange/10' : 'ring-1 ring-border hover:ring-navy/20'}`}
    >
      <div className={`shrink-0 transition-colors duration-200 ${enabled ? 'text-orange' : 'text-muted/40'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm transition-colors ${enabled ? 'text-navy' : 'text-navy/60'}`}>{title}</div>
        <div className="text-[11px] text-muted mt-0.5 leading-tight">{description}</div>
      </div>
      {/* Checkmark circle */}
      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${enabled ? 'bg-orange' : 'border-2 border-border'}`}>
        {enabled && <CheckIcon />}
      </div>
    </button>
  );
}

export function StepServices({ formData, onChange }: StepServicesProps) {
  const { t } = useLanguage();

  return (
    <div className="p-5 space-y-3">
      <ManpowerCard formData={formData} onChange={onChange} t={t} />

      <ServiceCard
        enabled={formData.packaging}
        onToggle={() => onChange({ packaging: !formData.packaging })}
        icon={<PackagingIcon />}
        title={t('steps.services.packaging')}
        description={t('steps.services.packagingDesc')}
      />

      <ServiceCard
        enabled={formData.liftCrane}
        onToggle={() => onChange({ liftCrane: !formData.liftCrane })}
        icon={<LiftIcon />}
        title={t('steps.services.lift')}
        description={t('steps.services.liftDesc')}
      />
    </div>
  );
}
