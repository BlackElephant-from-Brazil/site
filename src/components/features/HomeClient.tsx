'use client';

import {
  CasesSection,
  HeroSection,
  MobileSystemBenefitsSection,
} from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { ReviewsCarousel } from '@/components/home/ReviewsCarousel';
import { SectorsMarquee } from '@/components/home/SectorsMarquee';
import { ServicesSection } from '@/components/home/ServicesSection';

interface HomeClientProps {
  locale: string;
}

export function HomeClient({ locale }: HomeClientProps) {
  return (
    <main
      key={locale}
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Hero e cases (portfólio) — layout editorial único para todas as telas. */}
      <HeroSection />
      <MobileSystemBenefitsSection />
      <CasesSection />
      <div className="contents lg:hidden">
        <ReviewsCarousel />
        <StatsSection />
        <ServicesSection />
      </div>
      <div className="hidden lg:contents">
        <StatsSection />
        <ReviewsCarousel />
        <SectorsMarquee />
        <ServicesSection />
      </div>
    </main>
  );
}
