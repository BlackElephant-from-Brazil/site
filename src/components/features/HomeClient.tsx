'use client';

import { ScrollytellingSection } from '@/components/home/ScrollytellingSection';
import { MobileCasesSection, MobileHeroSection } from '@/components/home/MobileHeroSection';
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
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Hero — cada um dos dois se auto-controla via media query:
          - ScrollytellingSection: renderiza apenas ≥1024px (Lottie + snap).
          - MobileHeroSection: renderiza apenas <1024px (layout vertical natural). */}
      <ScrollytellingSection />
      <MobileHeroSection />
      <StatsSection />
      <MobileCasesSection />
      <ReviewsCarousel />
      <SectorsMarquee />
      <ServicesSection />
    </main>
  );
}
