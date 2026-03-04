'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';

const features = [
  {
    key: 'drivers',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 10l1.5 1.5L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'ontime',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'insured',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7v5c0 4.42 3.43 8.56 8 9.56C16.57 20.56 20 16.42 20 12V7L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'tracking',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l4-8 5 5 4-6 5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function WhySection() {
  const { t, dir } = useLanguage();

  return (
    <section className="bg-surface py-12 px-4" dir={dir}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-navy text-center mb-8">
          {t('why.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-surface rounded-2xl p-5 border border-border"
              style={{ boxShadow: '0 1px 4px rgba(22,30,60,0.06), 0 4px 16px rgba(22,30,60,0.04)' }}
            >
              <div className="w-11 h-11 rounded-xl bg-orange-light text-orange flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-navy mb-1">{t(`why.${feature.key}`)}</h3>
              <p className="text-sm text-muted leading-relaxed">{t(`why.${feature.key}_desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
