'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Input } from '@/components/ui/Input';
import { TRUCK_TYPES } from '@/lib/constants';
import { FormData, TruckType } from '@/types/form';

interface StepContactProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

// Egyptian mobile: 01X XXXX XXXX (11 digits, 010/011/012/015 prefixes)
// Accepts with or without +20 / 0020 prefix, with optional spaces/dashes
export function isValidEgyptPhone(raw: string): boolean {
  const clean = raw.replace(/[\s\-\(\)\.]/g, '');
  return /^(\+20|0020)?01[0125][0-9]{8}$/.test(clean);
}

export function StepContact({ formData, onChange }: StepContactProps) {
  const { t } = useLanguage();
  const [phoneTouched, setPhoneTouched] = useState(false);

  const truck = TRUCK_TYPES.find(tr => tr.id === formData.truckType);
  const datetimeDisplay = formData.moveDate
    ? `${formData.moveDate}${formData.moveTime ? ` at ${formData.moveTime}` : ''}`
    : '—';

  const phoneError = phoneTouched && !isValidEgyptPhone(formData.contactPhone);

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
          autoComplete="name"
          name="contact-name"
        />
        <Input
          label={t('steps.contact.phone')}
          type="tel"
          value={formData.contactPhone}
          onChange={e => onChange({ contactPhone: e.target.value })}
          onBlur={() => setPhoneTouched(true)}
          placeholder={t('steps.contact.phonePlaceholder')}
          autoComplete="tel"
          name="contact-phone"
          error={phoneError ? t('steps.contact.phoneError') : undefined}
        />
        <Input
          label={t('steps.contact.email')}
          type="email"
          value={formData.contactEmail}
          onChange={e => onChange({ contactEmail: e.target.value })}
          placeholder={t('steps.contact.emailPlaceholder')}
          autoComplete="email"
          name="contact-email"
        />
        <div>
          <label className="block text-sm font-medium text-navy-mid mb-1.5">
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
        </div>

        {/* Call-to-confirm notice */}
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-navy/[0.04] border border-navy/10 px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-orange shrink-0 mt-0.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
          </svg>
          <p className="text-xs text-navy/70 leading-relaxed">{t('steps.contact.callNote')}</p>
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
