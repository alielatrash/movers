'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number; // excludes confirmation step
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
          {i <= currentStep && (
            <motion.div
              className="h-full bg-orange rounded-full"
              initial={{ width: i < currentStep ? '100%' : '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
