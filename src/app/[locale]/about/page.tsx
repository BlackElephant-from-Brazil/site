import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

type Params = Promise<{ locale: string }>

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  
  return (
    <main className="min-h-screen pt-16 lg:pt-20" style={{ backgroundColor: 'var(--background)' }}>
      <HeroSection />
      <MissionVisionSection />
      <ValuesSection />
    </main>
  )
}

function HeroSection() {
  const t = useTranslations('about')

  return (
    <section className="py-20 lg:py-32">
      <div className="site-container">
        <div className="max-w-3xl">
          <div 
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ 
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
            }}
          >
            {t('subtitle')}
          </div>
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
            {t('heroText')}
          </p>
        </div>
      </div>
    </section>
  )
}

function MissionVisionSection() {
  const t = useTranslations('about')

  const cards = [
    {
      title: t('missionTitle'),
      text: t('missionText'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: t('visionTitle'),
      text: t('visionText'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="p-8 lg:p-12 rounded-2xl border"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--color-black)',
                }}
              >
                {card.icon}
              </div>
              <h2 
                className="text-2xl lg:text-3xl font-bold mb-4"
                style={{ 
                  fontFamily: 'var(--font-title)',
                  color: 'var(--foreground)',
                }}
              >
                {card.title}
              </h2>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const t = useTranslations('about')

  const values = [
    {
      title: t('value1'),
      description: t('value1Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: t('value2'),
      description: t('value2Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: t('value3'),
      description: t('value3Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: t('value4'),
      description: t('value4Desc'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="site-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl lg:text-5xl font-bold mb-4"
            style={{ 
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            {t('valuesTitle')}
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border text-center transition-all duration-300 hover:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-[var(--primary)] group-hover:text-[var(--color-black)]"
                style={{ 
                  backgroundColor: 'var(--primary-soft)',
                  color: 'var(--primary)',
                }}
              >
                {value.icon}
              </div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ 
                  fontFamily: 'var(--font-title)',
                  color: 'var(--foreground)',
                }}
              >
                {value.title}
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
