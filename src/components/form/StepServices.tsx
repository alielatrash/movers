'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { ToggleCard } from '@/components/ui/ToggleCard';
import { QuantityPicker } from '@/components/ui/QuantityPicker';
import { FormData } from '@/types/form';

interface StepServicesProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const ManpowerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const PackagingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const LiftIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
);

export function StepServices({ formData, onChange }: StepServicesProps) {
  const { t } = useLanguage();

  return (
    <div className="p-5 space-y-4">
      <div className="space-y-3">
        <ToggleCard
          enabled={formData.manpower.enabled}
          onToggle={() => onChange({ manpower: { ...formData.manpower, enabled: !formData.manpower.enabled } })}
          icon={<ManpowerIcon />}
          title={t('steps.services.manpower')}
          description={t('steps.services.manpowerDesc')}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-navy font-medium">{t('steps.services.people')}</span>
            <QuantityPicker
              value={formData.manpower.count}
              onChange={count => onChange({ manpower: { ...formData.manpower, count } })}
              min={1}
              max={10}
            />
          </div>
        </ToggleCard>

        <ToggleCard
          enabled={formData.packaging}
          onToggle={() => onChange({ packaging: !formData.packaging })}
          icon={<PackagingIcon />}
          title={t('steps.services.packaging')}
          description={t('steps.services.packagingDesc')}
        />

        <ToggleCard
          enabled={formData.liftCrane}
          onToggle={() => onChange({ liftCrane: !formData.liftCrane })}
          icon={<LiftIcon />}
          title={t('steps.services.lift')}
          description={t('steps.services.liftDesc')}
        />
      </div>
    </div>
  );
}
