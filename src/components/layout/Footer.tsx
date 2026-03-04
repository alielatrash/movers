'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export function Footer() {
  const { t, dir } = useLanguage();

  return (
    <footer className="bg-surface border-t border-navy-light" dir={dir}>
      <div className="max-w-5xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-navy-mid">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
