import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getPublishedBlogPostBySlug } from '@/lib/supabase/queries/blog'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

const COPY: Record<string, { back: string }> = {
  pt: { back: 'Voltar ao blog' },
  en: { back: 'Back to blog' },
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
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) return { title: 'Artigo não encontrado | BlackElephant' }
  return {
    title: `${post.title} | BlackElephant`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.published_at,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale(locale), {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const c = copyFor(locale)
  const post = await getPublishedBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="relative min-h-screen pt-28 pb-24">
      <article className="site-container relative z-10 mx-auto max-w-3xl">
        {/* Voltar */}
        <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: 'var(--color-brand)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {c.back}
        </Link>

        {/* Cabeçalho */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
            <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
            {post.author?.name && (
              <>
                <span aria-hidden>·</span>
                <span>{post.author.name}</span>
              </>
            )}
          </div>
          <h1
            className="text-3xl font-bold leading-[1.1] tracking-[-0.02em] md:text-4xl lg:text-[2.75rem]"
            style={{ fontFamily: 'var(--font-title)', color: 'var(--color-deep)' }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              {post.excerpt}
            </p>
          )}
          {post.keywords.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {post.keywords.map(kw => (
                <span
                  key={kw}
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ color: 'var(--color-brand)', background: 'rgba(31,111,107,0.08)', border: '1px solid rgba(31,111,107,0.18)' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Capa */}
        {post.cover_image_url && (
          <div className="mb-10 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-soft)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image_url} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Corpo do artigo (HTML rico) */}
        <div
          className="rich-text-content text-[1.05rem] leading-[1.75]"
          style={{ color: 'var(--foreground)' }}
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
      </article>
    </main>
  )
}
