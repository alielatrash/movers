'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { Input } from '@/components/ui/Input';
import { TRUCK_TYPES } from '@/lib/constants';
import { calculateTotalPrice } from '@/lib/pricing';
import { FormData, TruckType } from '@/types/form';

interface StepContactProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

export function StepContact({ formData, onChange }: StepContactProps) {
  const { t } = useLanguage();

  const pricing = formData.truckType
    ? calculateTotalPrice({
        truckType: formData.truckType as TruckType,
        distanceKm: formData.distanceKm,
        manpowerCount: formData.manpower.enabled ? formData.manpower.count : 0,
        packaging: formData.packaging,
        liftCrane: formData.liftCrane,
      })
    : null;

  const truck = TRUCK_TYPES.find(t => t.id === formData.truckType);
  const datetimeDisplay = formData.moveDate
    ? `${formData.moveDate}${formData.moveTime ? ` at ${formData.moveTime}` : ''}`
    : '—';

  return (
    <div className="p-5 space-y-4">
      {/* Contact fields */}
      <div className="bg-white rounded-2xl p-4 space-y-4"
        style={{ boxShadow: '0 1px 4px rgba(22,30,60,0.06), 0 4px 16px rgba(22,30,60,0.04)' }}>
        <Input
          label={t('steps.contact.name')}
          value={formData.contactName}
          onChange={e => onChange({ contactName: e.target.value })}
          placeholder={t('steps.contact.namePlaceholder')}
        />
        <Input
          label={t('steps.contact.phone')}
          type="tel"
          value={formData.contactPhone}
          onChange={e => onChange({ contactPhone: e.target.value })}
          placeholder={t('steps.contact.phonePlaceholder')}
        />
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-mid mb-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-orange">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 6l6.5 4L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {t('steps.contact.notes')}
          </label>
          <textarea
            value={formData.notes}
            onChange={e => onChange({ notes: e.target.value })}
            placeholder={t('steps.contact.notesPlaceholder')}
            rows={3}
            className="w-full rounded-xl bg-input-bg border-2 border-transparent px-4 py-3 text-sm text-navy placeholder:text-muted transition-all duration-200 focus:border-orange focus:bg-white focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-white rounded-2xl p-4"
        style={{ boxShadow: '0 1px 4px rgba(22,30,60,0.06), 0 4px 16px rgba(22,30,60,0.04)' }}>
        <div className="flex items-center gap-2 mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-orange">
            <rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 9h8M5 6h8M5 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h3 className="font-bold text-navy">{t('steps.contact.summary')}</h3>
        </div>
        <div className="space-y-2.5">
          <SummaryRow label={t('steps.contact.from')} value={formData.pickupAddress || '—'} />
          <SummaryRow label={t('steps.contact.to')} value={formData.dropoffAddress || '—'} />
          <SummaryRow label={t('steps.contact.datetime')} value={datetimeDisplay} />
          <SummaryRow
            label={t('steps.contact.truck')}
            value={truck ? t(`trucks.${truck.labelKey}`) : '—'}
          />
          <div className="border-t border-border pt-2.5 mt-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-navy">{t('steps.contact.estimatedPrice')}</span>
            <div className="text-right">
              <span className="text-lg font-bold text-orange">
                {pricing ? `${pricing.total} ${t('currency')}` : '—'}
              </span>
              <p className="text-[10px] text-muted mt-0.5">{t('steps.contact.dynamicNote')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-muted shrink-0">{label}:</span>
      <span className="text-sm font-medium text-navy text-right">{value}</span>
    </div>
  );
}
