'use client';

import { ScrollytellingSection } from '@/components/home/ScrollytellingSection';
import {
  MobileCasesSection,
  MobileHeroSection,
  MobileSystemBenefitsSection,
} from '@/components/home/MobileHeroSection';
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
      {/* Hero — cada um dos dois se auto-controla via media query:
          - ScrollytellingSection: renderiza apenas ≥1024px (Lottie + snap).
          - MobileHeroSection: renderiza apenas <1024px (layout vertical natural). */}
      <ScrollytellingSection />
      <MobileHeroSection />
      <MobileSystemBenefitsSection />
      <MobileCasesSection />
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
