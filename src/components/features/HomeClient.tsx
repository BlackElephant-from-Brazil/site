'use client';

import { ScrollytellingSection } from '@/components/home/ScrollytellingSection';
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
      <ScrollytellingSection />
      <StatsSection />
      <ReviewsCarousel />
      <SectorsMarquee />
      <ServicesSection />
    </main>
  );
}
