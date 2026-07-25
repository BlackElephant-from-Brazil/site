import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPlanBySlug, plans, formatPrice } from '@/data/plans';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return plans.map((plan) => ({
    slug: plan.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plan = getPlanBySlug(slug);
  
  if (!plan) {
    return { title: 'Plano não encontrado' };
  }
  
  return {
    title: `${plan.name} | Planos BlackElephant`,
    description: plan.description,
    openGraph: {
      title: plan.name,
      description: plan.description,
      type: 'website',
    },
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('plans');
  
  const plan = getPlanBySlug(slug);
  
  if (!plan) {
    notFound();
  }

  const getColorClasses = () => {
    switch (plan.color) {
      case 'lime':
        return {
          accent: 'bg-[var(--color-brand)]',
          accentText: 'text-[var(--color-brand)]',
          accentBg: 'bg-[var(--color-brand)]/10',
          border: 'border-[var(--color-brand)]/30',
          glow: 'shadow-[var(--shadow-soft-lg)]',
        };
      case 'blue':
        return {
          accent: 'bg-blue-500',
          accentText: 'text-blue-400',
          accentBg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          glow: 'shadow-[0_0_60px_rgba(59,130,246,0.2)]',
        };
      case 'purple':
        return {
          accent: 'bg-purple-500',
          accentText: 'text-purple-400',
          accentBg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          glow: 'shadow-[0_0_60px_rgba(168,85,247,0.2)]',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 ${plan.color === 'lime' ? 'bg-[var(--color-brand)]' : plan.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}/5 rounded-full blur-[150px]`} />
      </div>

      <div className="site-container relative z-10">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-8">
            <Link href={`/${locale}`} className="hover:text-[var(--color-brand)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${locale}/plans`} className="hover:text-[var(--color-brand)] transition-colors">
              {t('breadcrumb')}
            </Link>
            <span>/</span>
            <span className={colors.accentText}>{plan.name}</span>
          </nav>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal delay={0.1}>
          <div className={`mb-12 p-8 md:p-12 rounded-3xl ${colors.accentBg} border ${colors.border} ${colors.glow}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                {plan.recommended && (
                  <span className={`inline-block px-4 py-2 mb-4 text-sm font-bold ${colors.accent} text-white rounded-full`}>
                    ⭐ Recomendado
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-2">
                  {plan.name}
                </h1>
                <p className={`text-xl ${colors.accentText}`}>{plan.tagline}</p>
              </div>
              
              <div className="text-right">
                {plan.pricing.initial > 0 ? (
                  <>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl text-[var(--foreground-muted)]">R$</span>
                      <span className="text-6xl md:text-7xl font-bold text-[var(--foreground)]">{plan.pricing.initial}</span>
                    </div>
                    <p className="text-[var(--foreground-muted)] mt-2">
                      + <span className="text-[var(--foreground)] font-semibold text-xl">{formatPrice(plan.pricing.monthly)}</span>/mês
                    </p>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-[var(--foreground)]">Sob Consulta</div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <ScrollReveal delay={0.2}>
              <div className="prose prose-invert prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">{t('detail.about')}</h2>
                <p className="text-[var(--foreground-muted)] leading-relaxed whitespace-pre-line">
                  {plan.fullDescription}
                </p>
              </div>
            </ScrollReveal>

            {/* Features */}
            <ScrollReveal delay={0.3}>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">{t('detail.features')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.features.filter(f => f.included).map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-4 rounded-xl ${feature.highlight ? colors.accentBg + ' border ' + colors.border : 'bg-[var(--card-background)]'}`}
                  >
                    <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feature.highlight ? colors.accentText : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={feature.highlight ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground-muted)]'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Highlights */}
            <ScrollReveal delay={0.4}>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">{t('detail.highlights')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--card-background)] border border-[var(--card-border)]"
                  >
                    <span className={`w-8 h-8 rounded-full ${colors.accentBg} flex items-center justify-center ${colors.accentText} font-bold`}>
                      {idx + 1}
                    </span>
                    <span className="text-[var(--foreground-muted)]">{highlight}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <ScrollReveal delay={0.3}>
              <div className={`sticky top-24 p-6 rounded-2xl ${colors.accentBg} border ${colors.border}`}>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">{t('detail.cta.title')}</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('detail.cta.initial')}</span>
                    <span className="text-[var(--foreground)] font-semibold">{formatPrice(plan.pricing.initial)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('detail.cta.monthly')}</span>
                    <span className="text-[var(--foreground)] font-semibold">{formatPrice(plan.pricing.monthly)}</span>
                  </div>
                  <div className="border-t border-[var(--card-border)] pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--foreground-subtle)]">{t('detail.cta.additionalUser')}</span>
                      <span className="text-[var(--foreground-muted)]">+{formatPrice(plan.pricing.additionalUserCost)}/mês</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/${locale}/contact?plan=${plan.slug}`}
                  className={`block w-full py-4 px-6 text-center font-semibold ${colors.accent} text-${plan.color === 'lime' ? '[var(--color-black)]' : 'white'} rounded-xl hover:opacity-90 transition-opacity mb-4`}
                >
                  {plan.ctaText}
                </Link>

                <a
                  href="https://wa.me/5519978055531"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-6 text-center font-medium text-[var(--foreground)] border border-[var(--card-border)] rounded-xl hover:border-[var(--color-gray-500)] transition-colors"
                >
                  💬 WhatsApp
                </a>
              </div>
            </ScrollReveal>

            {/* Other Plans */}
            <ScrollReveal delay={0.4}>
              <div className="p-6 rounded-2xl bg-[var(--card-background)] border border-[var(--card-border)]">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{t('detail.otherPlans')}</h3>
                <div className="space-y-3">
                  {plans.filter(p => p.id !== plan.id).map((otherPlan) => (
                    <Link
                      key={otherPlan.id}
                      href={`/${locale}/plans/${otherPlan.slug}`}
                      className="block p-4 rounded-xl bg-[var(--background-tertiary)] hover:bg-[var(--background-tertiary)] transition-colors"
                    >
                      <div className="font-medium text-[var(--foreground)]">{otherPlan.name}</div>
                      <div className="text-sm text-[var(--foreground-muted)]">
                        {otherPlan.pricing.initial > 0 ? `R$ ${otherPlan.pricing.initial} + ${formatPrice(otherPlan.pricing.monthly)}/mês` : 'Sob Consulta'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Back Link */}
        <ScrollReveal>
          <Link
            href={`/${locale}/plans`}
            className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--color-brand)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('detail.backToPlans')}
          </Link>
        </ScrollReveal>
      </div>
    </main>
  );
}
