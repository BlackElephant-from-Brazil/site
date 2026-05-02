import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPortfolioBySlug, portfolioItems, getCategoryLabel } from '@/data/portfolio';
import { ImageGallery } from '@/components/features';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return portfolioItems.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioBySlug(slug);
  
  if (!project) {
    return { title: 'Projeto não encontrado' };
  }
  
  return {
    title: `${project.title} | Portfólio BlackElephant`,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      type: 'article',
      images: [{ url: project.thumbnail }],
    },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('portfolio');
  
  const project = getPortfolioBySlug(slug);
  
  if (!project) {
    notFound();
  }

  // Get related projects (same category, excluding current)
  const relatedProjects = portfolioItems
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-1/4 w-1/2 h-1/2 bg-[var(--color-lime)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="site-container relative z-10">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="flex items-center gap-2 text-sm text-[var(--color-gray-400)] mb-8">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href={`/${locale}/portfolio`} className="hover:text-white transition-colors">
              {t('breadcrumb')}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-lime)]">{project.title}</span>
          </nav>
        </ScrollReveal>

        {/* Header */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="px-3 py-1 text-sm font-medium bg-[var(--color-lime)]/10 text-[var(--color-lime)] rounded-full border border-[var(--color-lime)]/30">
                {getCategoryLabel(project.category)}
              </span>
              <span className="text-[var(--color-gray-500)] font-mono">
                {project.year}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-gray-400)] max-w-3xl">
              {project.shortDescription}
            </p>
          </div>
        </ScrollReveal>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Gallery - 2 columns */}
          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <ImageGallery images={project.images} title={project.title} />
          </ScrollReveal>

          {/* Sidebar */}
          <ScrollReveal delay={0.3}>
            <div className="space-y-6">
              {/* Client Info */}
              <div className="p-6 rounded-2xl bg-[var(--color-gray-900)] border border-[var(--color-gray-800)]">
                <h3 className="text-lg font-semibold text-white mb-4">{t('detail.client')}</h3>
                <p className="text-[var(--color-gray-400)]">{project.client}</p>
              </div>

              {/* Technologies */}
              <div className="p-6 rounded-2xl bg-[var(--color-gray-900)] border border-[var(--color-gray-800)]">
                <h3 className="text-lg font-semibold text-white mb-4">{t('detail.technologies')}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-sm font-mono text-[var(--color-lime)] bg-[var(--color-lime)]/10 rounded-lg border border-[var(--color-lime)]/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--color-lime)]/10 to-transparent border border-[var(--color-lime)]/20">
                <h3 className="text-lg font-semibold text-white mb-2">{t('detail.cta.title')}</h3>
                <p className="text-sm text-[var(--color-gray-400)] mb-4">{t('detail.cta.description')}</p>
                <Link
                  href={`/${locale}/contact`}
                  className="inline-block w-full py-3 px-6 text-center font-semibold bg-[var(--color-lime)] text-[var(--color-black)] rounded-xl hover:bg-[var(--color-lime-light)] transition-colors"
                >
                  {t('detail.cta.button')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Full Description */}
        <ScrollReveal className="mb-20">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-6">{t('detail.about')}</h2>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-[var(--color-gray-300)] leading-relaxed whitespace-pre-line">
                {project.fullDescription}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <ScrollReveal>
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">{t('detail.related')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((related) => (
                  <Link
                    key={related.id}
                    href={`/${locale}/portfolio/${related.slug}`}
                    className="group block p-6 rounded-2xl bg-[var(--color-gray-900)] border border-[var(--color-gray-800)] hover:border-[var(--color-lime)]/50 transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold text-white group-hover:text-[var(--color-lime)] transition-colors mb-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-[var(--color-gray-400)] line-clamp-2">
                      {related.shortDescription}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Back to Portfolio */}
        <ScrollReveal className="mt-12">
          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 text-[var(--color-gray-400)] hover:text-[var(--color-lime)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('detail.backToPortfolio')}
          </Link>
        </ScrollReveal>
      </div>
    </main>
  );
}
