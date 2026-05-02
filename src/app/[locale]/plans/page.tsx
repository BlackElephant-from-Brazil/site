import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { PricingGrid, PricingComparison } from '@/components/features';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'plans' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
    },
  };
}

export default async function PlansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('plans');

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[var(--color-lime)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-[var(--color-lime)] bg-[var(--color-lime)]/10 rounded-full border border-[var(--color-lime)]/20">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('title.part1')}{' '}
            <span className="text-[var(--color-lime)]">{t('title.part2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-gray-400)] max-w-3xl mx-auto">
            {t('description')}
          </p>
        </ScrollReveal>

        {/* Pricing Grid */}
        <div className="mb-24">
          <PricingGrid locale={locale} />
        </div>

        {/* Additional User Info */}
        <ScrollReveal className="mb-24">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-[var(--color-gray-900)]/50 border border-[var(--color-gray-800)]">
            <h3 className="text-xl font-semibold text-white mb-4">{t('additionalUsers.title')}</h3>
            <p className="text-[var(--color-gray-400)]">
              {t('additionalUsers.description')}
            </p>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {t('comparison.title')}
          </h2>
          <div className="rounded-2xl bg-[var(--color-gray-900)]/50 border border-[var(--color-gray-800)] p-6 overflow-hidden">
            <PricingComparison locale={locale} />
          </div>
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal className="mb-24">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {t('faq.title')}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <details
                key={i}
                className="group p-6 rounded-2xl bg-[var(--color-gray-900)] border border-[var(--color-gray-800)] hover:border-[var(--color-gray-700)] transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-medium text-white pr-4">
                    {t(`faq.q${i}.question`)}
                  </span>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-gray-800)] flex items-center justify-center group-open:rotate-45 transition-transform">
                    <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-[var(--color-gray-400)] leading-relaxed">
                  {t(`faq.q${i}.answer`)}
                </p>
              </details>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-[var(--color-lime)]/10 via-[var(--color-gray-900)] to-purple-500/10 border border-[var(--color-gray-800)]">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-[var(--color-gray-400)] mb-8 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/contact`}
                className="px-8 py-4 bg-[var(--color-lime)] text-[var(--color-black)] font-semibold rounded-xl hover:bg-[var(--color-lime-light)] transition-colors"
              >
                {t('cta.button')}
              </Link>
              <a
                href="https://wa.me/5519978055531"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-[var(--color-gray-700)] text-white font-semibold rounded-xl hover:border-[var(--color-lime)] hover:text-[var(--color-lime)] transition-colors"
              >
                {t('cta.whatsapp')}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
