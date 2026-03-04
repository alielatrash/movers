'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Button } from '@/components/ui/Button';
import { StepTrip } from './StepTrip';
import { StepTruckType } from './StepTruckType';
import { StepServices } from './StepServices';
import { StepContact } from './StepContact';
import { StepConfirmation } from './StepConfirmation';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateTotalPrice } from '@/lib/pricing';
import { TruckType } from '@/types/form';
import { isValidEgyptPhone, isValidEmail } from './StepContact';

const STEP_TITLES_KEY = [
  'steps.trip.title',
  'steps.truck.title',
  'steps.services.title',
  'steps.contact.title',
];

export function MoveForm() {
  const { t, dir } = useLanguage();
  const { currentStep, totalSteps, formData, updateFormData, nextStep, prevStep, direction, reset } =
    useMultiStepForm();

  const FORM_STEPS = totalSteps - 1; // excluding confirmation
  const isConfirmation = currentStep === FORM_STEPS;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FORM_STEPS - 1;

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return (
          formData.pickupAddress.trim().length > 0 &&
          formData.dropoffAddress.trim().length > 0
        );
      case 1:
        return formData.truckType !== '';
      case 2:
        return true;
      case 3:
        return (
          formData.contactName.trim().length > 0 &&
          isValidEgyptPhone(formData.contactPhone) &&
          (formData.contactEmail === '' || isValidEmail(formData.contactEmail))
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    const pricing = formData.truckType
      ? calculateTotalPrice({
          truckType: formData.truckType as TruckType,
          distanceKm: formData.distanceKm,
          manpowerCount: formData.manpower.enabled ? formData.manpower.count : 0,
          packaging: formData.packaging,
          liftCrane: formData.liftCrane,
        })
      : null;

    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, estimatedPrice: pricing?.total ?? null }),
      });
    } catch {
      // non-blocking — proceed to confirmation regardless
    }
    nextStep();
  };

  const slideDir = dir === 'rtl' ? -direction : direction;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0 }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepTrip formData={formData} onChange={updateFormData} />;
      case 1: return <StepTruckType formData={formData} onChange={updateFormData} />;
      case 2: return <StepServices formData={formData} onChange={updateFormData} />;
      case 3: return <StepContact formData={formData} onChange={updateFormData} />;
      case 4: return <StepConfirmation onReset={reset} />;
      default: return null;
    }
  };

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-surface"
      style={{ boxShadow: '0 4px 24px rgba(22,30,60,0.10), 0 1px 4px rgba(22,30,60,0.06)' }}
      dir={dir}
    >
      {/* Step header — navy bar */}
      {!isConfirmation && (
        <div className="bg-navy px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="text-white/70 hover:text-white transition-colors cursor-pointer -ml-1"
                aria-label={t('nav.back')}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M14 17L8 11L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                {t(STEP_TITLES_KEY[currentStep] || '')}
              </h2>
              <p className="text-white/50 text-xs mt-0.5">
                Step {currentStep + 1} of {FORM_STEPS}
              </p>
            </div>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={FORM_STEPS} />
        </div>
      )}

      {/* Step content */}
      <div className="overflow-hidden bg-page min-h-[380px]">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={currentStep}
            custom={slideDir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA bar — pinned at bottom */}
      {!isConfirmation && (
        <div className="bg-surface px-5 py-4 border-t border-border">
          <Button
            variant="primary"
            fullWidth
            onClick={isLastStep ? handleSubmit : nextStep}
            disabled={!canProceed()}
            className="py-4 text-base shadow-sm shadow-orange/20"
          >
            {isLastStep ? t('steps.contact.submit') : t('nav.next')} →
          </Button>
        </div>
      )}
    </div>
  );
}
