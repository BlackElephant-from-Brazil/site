import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PortfolioGrid } from '@/components/features';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { portfolioItems } from '@/data/portfolio';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portfolio' });
  
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

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('portfolio');

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[var(--color-lime)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-[150px]" />
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

        {/* Stats */}
        <ScrollReveal delay={0.2} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-[var(--color-gray-900)]/50 border border-[var(--color-gray-800)]">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-lime)] mb-2">
                {portfolioItems.length}+
              </div>
              <div className="text-sm text-[var(--color-gray-400)]">{t('stats.projects')}</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-[var(--color-gray-900)]/50 border border-[var(--color-gray-800)]">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-lime)] mb-2">
                {portfolioItems.filter(p => p.category === 'sites').length}
              </div>
              <div className="text-sm text-[var(--color-gray-400)]">{t('stats.sites')}</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-[var(--color-gray-900)]/50 border border-[var(--color-gray-800)]">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-lime)] mb-2">
                {portfolioItems.filter(p => p.category === 'sistemas').length}
              </div>
              <div className="text-sm text-[var(--color-gray-400)]">{t('stats.systems')}</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-[var(--color-gray-900)]/50 border border-[var(--color-gray-800)]">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-lime)] mb-2">
                {portfolioItems.filter(p => p.category === 'apps').length}
              </div>
              <div className="text-sm text-[var(--color-gray-400)]">{t('stats.apps')}</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Portfolio Grid with Filters */}
        <PortfolioGrid locale={locale} showFilters={true} />
      </div>
    </main>
  );
}
