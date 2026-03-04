'use client';

import { useState, useCallback } from 'react';
import { FormData } from '@/types/form';
import { TOTAL_STEPS } from '@/lib/constants';

const initialFormData: FormData = {
  pickupAddress: '',
  dropoffAddress: '',
  moveDate: '',
  moveTime: '',
  moveItems: '',
  moveItemsOther: '',
  distanceKm: 0,
  truckType: '',
  manpower: { enabled: false, count: 1 },
  packaging: false,
  liftCrane: false,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
};

export function useMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [direction, setDirection] = useState<1 | -1>(1);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setDirection(1);
  }, []);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    direction,
    reset,
  };
}
