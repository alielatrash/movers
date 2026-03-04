'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface StepConfirmationProps {
  onReset: () => void;
}

export function StepConfirmation({ onReset }: StepConfirmationProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-5 text-center">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#E6F5ED' }}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <motion.circle
            cx="22" cy="22" r="18"
            stroke="#0D944E" strokeWidth="2.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <motion.path
            d="M13 22L19.5 28.5L31 16"
            stroke="#0D944E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-2xl font-bold text-navy">{t('steps.confirmation.title')}</h2>
        <p className="mt-3 text-muted max-w-xs mx-auto leading-relaxed">
          {t('steps.confirmation.subtitle')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-xs"
      >
        <Button variant="secondary" fullWidth onClick={onReset}>
          {t('steps.confirmation.another')}
        </Button>
      </motion.div>
    </div>
  );
}
