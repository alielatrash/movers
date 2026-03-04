'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/hero/HeroSection';
import { WhySection } from '@/components/sections/WhySection';
import { MoveForm } from '@/components/form/MoveForm';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  const { dir } = useLanguage();

  return (
    <main className="min-h-screen bg-page" dir={dir}>
      <Header />
      <HeroSection />
      <WhySection />

      <section id="move-form" className="py-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-navy">Book a Truck</h2>
            <p className="text-sm text-muted mt-1">Fill in the details below to get started</p>
          </div>
          <MoveForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
