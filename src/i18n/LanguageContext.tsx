'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Locale, defaultLocale, isRtl } from './config';
import en from './en.json';
import ar from './ar.json';

const messages: Record<Locale, typeof en> = { en, ar };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = useCallback(
    (key: string) => getNestedValue(messages[locale] as unknown as Record<string, unknown>, key),
    [locale]
  );

  const dir = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
