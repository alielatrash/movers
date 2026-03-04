'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function HeroSection() {
  const { t, locale, dir } = useLanguage();

  const scrollToForm = () => {
    document.getElementById('move-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: t('hero.stats_moves'), label: t('hero.stats_moves_label') },
    { value: t('hero.stats_rating'), label: t('hero.stats_rating_label') },
    { value: t('hero.stats_time'), label: t('hero.stats_time_label') },
  ];

  // Split EN title into first/second line to colour "Anywhere" orange
  const rawTitle = t('hero.title');
  const titleLines = rawTitle.split('\n');

  return (
    <section className="relative bg-navy overflow-hidden" dir={dir}>
      {/* Animated glow blobs */}
      <motion.div
        className="absolute -bottom-24 -right-16 w-[500px] h-[500px] rounded-full bg-orange/[0.18] blur-[100px] pointer-events-none"
        animate={{ x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-24 -left-16 w-[380px] h-[380px] rounded-full bg-white/[0.03] blur-[80px] pointer-events-none"
        animate={{ x: [0, -18, 0], y: [0, 14, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Tech grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Decorative truck silhouette — desktop only */}
      <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.06] pointer-events-none select-none" style={{ width: 340 }}>
        <svg viewBox="0 0 340 180" fill="white" xmlns="http://www.w3.org/2000/svg">
          {/* Trailer */}
          <rect x="0" y="40" width="220" height="110" rx="6" />
          {/* Cab */}
          <path d="M220 60 L220 150 L310 150 L310 90 Q310 60 290 60 Z" />
          {/* Windshield */}
          <path d="M228 68 L228 98 L300 98 L300 90 Q300 68 285 68 Z" fill="#161E3C" opacity="0.4" />
          {/* Wheels */}
          <circle cx="55" cy="152" r="22" />
          <circle cx="55" cy="152" r="10" fill="#161E3C" opacity="0.3" />
          <circle cx="155" cy="152" r="22" />
          <circle cx="155" cy="152" r="10" fill="#161E3C" opacity="0.3" />
          <circle cx="275" cy="152" r="22" />
          <circle cx="275" cy="152" r="10" fill="#161E3C" opacity="0.3" />
          {/* Road line */}
          <rect x="0" y="174" width="340" height="3" rx="1.5" opacity="0.4" />
          <rect x="30" y="168" width="40" height="2" rx="1" opacity="0.25" />
          <rect x="140" y="168" width="40" height="2" rx="1" opacity="0.25" />
          <rect x="250" y="168" width="40" height="2" rx="1" opacity="0.25" />
        </svg>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 pt-14 pb-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-5"
        >
          <span className="inline-flex items-center gap-2 bg-orange/15 border border-orange/30 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            <span className="text-orange text-xs font-bold uppercase tracking-wide">Powered by Trella</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-center"
        >
          {locale === 'en' && titleLines.length === 2 ? (
            <>
              <span className="text-white">{titleLines[0]}</span>
              <br />
              <span className="text-orange">{titleLines[1]}</span>
            </>
          ) : (
            <span className="text-white whitespace-pre-line">{rawTitle}</span>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' }}
          className="mt-5 text-base text-white/55 max-w-sm mx-auto text-center leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28, ease: 'easeOut' }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <Button onClick={scrollToForm} className="text-base px-10 py-4 shadow-lg shadow-orange/25">
            {t('hero.cta')} →
          </Button>
          <button
            onClick={scrollToForm}
            className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer"
          >
            {locale === 'ar' ? 'كيف يعمل؟' : 'See how it works →'}
          </button>
        </motion.div>

        {/* Stats — glass pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-10 flex justify-center gap-3 flex-wrap"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm"
            >
              <span className="text-xl font-bold text-white leading-tight">{stat.value}</span>
              <span className="text-[10px] text-white/45 mt-0.5 whitespace-nowrap">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-navy to-transparent pointer-events-none" />
    </section>
  );
}
