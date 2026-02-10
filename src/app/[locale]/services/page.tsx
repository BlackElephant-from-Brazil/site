import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

type Params = Promise<{ locale: string }>

export default async function ServicesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  
  return (
    <main className="min-h-screen pt-16 lg:pt-20" style={{ backgroundColor: 'var(--background)' }}>
      <HeroSection />
      <ServicesGrid />
      <CTASection />
    </main>
  )
}

function HeroSection() {
  const t = useTranslations('services')

  return (
    <section className="py-20 lg:py-32">
      <div className="site-container">
        <div className="max-w-3xl">
          <h1 
            className="text-4xl lg:text-6xl font-bold mb-6"
            style={{ 
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            {t('title')}
          </h1>
          <p 
            className="text-xl leading-relaxed"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {t('description')}
          </p>
        </div>
      </div>
    </section>
  )
}

function ServicesGrid() {
  const t = useTranslations('services')

  const services = [
    {
      key: 'web',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'mobile',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'ai',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      key: 'consulting',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: 'cloud',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
    },
    {
      key: 'design',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ]

  return (
    <section 
      className="py-20 lg:py-32 border-y"
      style={{ 
        backgroundColor: 'var(--background-secondary)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <div
              key={service.key}
              className="group relative p-8 rounded-2xl border overflow-hidden transition-all duration-300 hover:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
              }}
            >
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(circle at top right, var(--primary-soft), transparent 70%)',
                }}
              />
              
              <div className="relative z-10">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[var(--primary)] group-hover:text-[var(--color-black)]"
                  style={{ 
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)',
                  }}
                >
                  {service.icon}
                </div>
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ 
                    fontFamily: 'var(--font-title)',
                    color: 'var(--foreground)',
                  }}
                >
                  {t(`${service.key}.title`)}
                </h3>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  {t(`${service.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const t = useTranslations('home')

  return (
    <section className="py-20 lg:py-32">
      <div className="site-container">
        <div className="text-center">
          <h2 
            className="text-3xl lg:text-4xl font-bold mb-6"
            style={{ 
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            {t('ctaTitle')}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto mb-10"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {t('ctaDescription')}
          </p>
          <Link
            href="/contact?tab=consultation"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-glow"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--color-black)',
            }}
          >
            {t('ctaPrimary')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
