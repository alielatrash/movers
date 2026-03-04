'use client';

import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { TRUCK_TYPES } from '@/lib/constants';
import { FormData, TruckType } from '@/types/form';
import { motion } from 'framer-motion';

interface StepTruckTypeProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const TRUCK_IMAGES: Record<string, string> = {
  'dababa': '/trucks/Dababa_Open_Main.avif',
  'closed-dababa': '/trucks/Dababa_Open_Main.avif',
  'jumbo': '/trucks/Jumbo_Open_Main.avif',
  'closed-jumbo': '/trucks/Jumbo_Open_Main.avif',
};

export function StepTruckType({ formData, onChange }: StepTruckTypeProps) {
  const { t } = useLanguage();

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {TRUCK_TYPES.map(truck => {
          const selected = formData.truckType === truck.id;
          return (
            <motion.button
              key={truck.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ truckType: truck.id as TruckType })}
              className={`relative text-left rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                selected
                  ? 'ring-2 ring-orange shadow-lg shadow-orange/10'
                  : 'ring-1 ring-border hover:ring-navy/20 shadow-sm'
              }`}
              style={{ backgroundColor: '#fff' }}
            >
              {/* Vehicle image */}
              <div className="relative h-28 flex items-center justify-center overflow-hidden">
                <Image
                  src={TRUCK_IMAGES[truck.id]}
                  alt={t(`trucks.${truck.labelKey}`)}
                  width={300}
                  height={180}
                  className="w-full h-full object-cover"
                  priority
                  unoptimized
                />

                {/* Capacity badge */}
                <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selected ? 'bg-orange text-white' : 'bg-white/80 text-navy backdrop-blur-sm'
                }`}>
                  {truck.capacity}
                </div>

                {/* Selected checkmark */}
                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-5 h-5 rounded-full bg-orange flex items-center justify-center shadow-md"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="px-3 py-2.5">
                <h3 className="font-bold text-navy text-xs leading-tight">{t(`trucks.${truck.labelKey}`)}</h3>
                <p className="text-[10px] text-muted mt-0.5 truncate">{t(`trucks.${truck.descriptionKey}`)}</p>
                <div className="mt-1.5">
                  <span className="text-sm font-bold text-orange">{truck.baseFee}</span>
                  <span className="text-[10px] font-semibold text-muted ml-0.5">{t('currency')}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic pricing notice */}
      <div className="rounded-xl bg-orange-light/60 border border-orange/20 px-4 py-3 flex gap-3 items-start">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-orange shrink-0 mt-0.5">
          <path d="M3 15l4-8 3 3 3-4.5L17 15H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-navy">{t('steps.truck.dynamicPricing')}</p>
          <p className="text-xs text-muted mt-0.5">{t('steps.truck.dynamicPricingDesc')}</p>
        </div>
      </div>
    </div>
  );
}
