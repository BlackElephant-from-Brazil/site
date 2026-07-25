import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getPublishedBlogPosts } from '@/lib/supabase/queries/blog'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
}

const COPY: Record<string, { badge: string; title1: string; title2: string; desc: string; empty: string; readMore: string }> = {
  pt: {
    badge: 'Blog',
    title1: 'Ideias e insights de',
    title2: 'quem constrói',
    desc: 'Artigos sobre tecnologia, design e negócios digitais escritos pelo time da BlackElephant.',
    empty: 'Ainda não há artigos publicados. Volte em breve.',
    readMore: 'Ler artigo',
  },
  en: {
    badge: 'Blog',
    title1: 'Ideas and insights from',
    title2: 'the builders',
    desc: 'Articles on technology, design and digital business written by the BlackElephant team.',
    empty: 'No articles published yet. Check back soon.',
    readMore: 'Read article',
  },
}

function copyFor(locale: string) {
  return COPY[locale.startsWith('pt') ? 'pt' : 'en'] ?? COPY.en
}

function dateLocale(locale: string): string {
  if (locale === 'pt-pt') return 'pt-PT'
  if (locale.startsWith('pt')) return 'pt-BR'
  if (locale === 'es') return 'es-ES'
  return 'en-US'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const c = copyFor(locale)
  return {
    title: 'Blog | BlackElephant',
    description: c.desc,
    openGraph: { title: 'Blog | BlackElephant', description: c.desc, type: 'website' },
  }
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale(locale), {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const c = copyFor(locale)
  const posts = await getPublishedBlogPosts()

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      {/* Atmosfera */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-[420px] w-[420px] rounded-full opacity-[0.06] blur-[150px]" style={{ backgroundColor: 'var(--color-brand)' }} />
        <div className="absolute -right-32 top-1/2 h-[360px] w-[360px] rounded-full opacity-[0.05] blur-[150px]" style={{ backgroundColor: 'var(--color-accent)' }} />
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <ScrollReveal className="mx-auto mb-16 max-w-3xl text-center">
          <span
            className="mb-6 inline-block rounded-full px-4 py-2 text-sm font-medium"
            style={{ color: 'var(--color-brand)', background: 'rgba(31,111,107,0.10)', border: '1px solid rgba(31,111,107,0.20)' }}
          >
            {c.badge}
          </span>
          <h1
            className="text-4xl font-bold leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-title)', color: 'var(--color-deep)' }}
          >
            {c.title1}{' '}
            <span style={{ color: 'var(--color-brand)' }}>{c.title2}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: 'var(--foreground-muted)' }}>
            {c.desc}
          </p>
        </ScrollReveal>

        {posts.length === 0 ? (
          <p className="py-16 text-center text-base italic" style={{ color: 'var(--foreground-muted)' }}>
            {c.empty}
          </p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <ScrollReveal key={post.id} delay={Math.min(i, 5) * 0.06}>
                <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-soft)' }}
                >
                  {/* Capa */}
                  <div className="relative aspect-[16/10] overflow-hidden" style={{ background: 'var(--background-tertiary)' }}>
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #123B4F, #1F6F6B)' }}>
                        <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.9)' }}>
                          BlackElephant
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
                      {post.author?.name && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{post.author.name}</span>
                        </>
                      )}
                    </div>
                    <h2
                      className="mb-2 text-lg font-bold leading-snug transition-colors group-hover:text-[var(--color-brand)]"
                      style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
                    >
                      {post.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                      {post.excerpt}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-brand)' }}>
                      {c.readMore}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-0.5">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
