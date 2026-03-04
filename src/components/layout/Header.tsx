'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';

export function Header() {
  const { locale, setLocale, dir } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-navy" dir={dir}>
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              locale === 'ar'
                ? '/Logo Assets/Arabic/SVG/Trella_Logotype_Arabic_White.svg'
                : '/Logo Assets/Latin/SVG/Trella_Logotype_Latin_White.svg'
            }
            alt="Trella"
            className="h-5 w-auto"
          />
          <span className="text-white/30 font-light mx-1">|</span>
          <span className="text-white text-base font-bold tracking-[0.18em] uppercase">MOVE</span>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center bg-navy-mid rounded-full p-0.5">
          <button
            onClick={() => setLocale('en')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              locale === 'en' ? 'text-navy' : 'text-white/60 hover:text-white'
            }`}
          >
            {locale === 'en' && (
              <motion.div
                layoutId="lang-toggle"
                className="absolute inset-0 bg-white rounded-full"
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative z-10">EN</span>
          </button>
          <button
            onClick={() => setLocale('ar')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
              locale === 'ar' ? 'text-navy' : 'text-white/60 hover:text-white'
            }`}
          >
            {locale === 'ar' && (
              <motion.div
                layoutId="lang-toggle"
                className="absolute inset-0 bg-white rounded-full"
                transition={{ duration: 0.2 }}
              />
            )}
            <span className="relative z-10">ع</span>
          </button>
        </div>
      </div>
    </header>
  );
}
