import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { SiteShell } from '@/components/layout/SiteShell'
import { GoogleAnalytics } from '@next/third-parties/google'
import '@/styles/design-tokens.css'
import '../globals.css'

type Params = Promise<{ locale: string }>

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  'pt-br': 'pt_BR',
  'pt-pt': 'pt_PT',
  es: 'es_ES',
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params

  const siteUrl = 'https://blackelephant.com.br'

  const titles: Record<string, string> = {
    en: 'BlackElephant | Software Development & Automation',
    'pt-br': 'BlackElephant | Desenvolvimento de Software & Automações',
    'pt-pt': 'BlackElephant | Desenvolvimento de Software & Automações',
    es: 'BlackElephant | Desarrollo de Software y Automatización',
  }

  const descriptions: Record<string, string> = {
    en: 'We transform ideas into digital solutions. Websites, apps, web systems and smart automation to boost your business.',
    'pt-br': 'Transformamos ideias em soluções digitais. Sites, aplicativos, sistemas web e automações inteligentes para impulsionar seu negócio.',
    'pt-pt': 'Transformamos ideias em soluções digitais. Sites, aplicações, sistemas web e automações inteligentes para impulsionar o seu negócio.',
    es: 'Transformamos ideas en soluciones digitales. Sitios web, aplicaciones, sistemas web y automatización inteligente para impulsar tu negocio.',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: ['desenvolvimento de software', 'automação', 'sites', 'aplicativos', 'sistemas web', 'BlackElephant', 'tecnologia', 'inovação'],
    authors: [{ name: 'BlackElephant' }],
    creator: 'BlackElephant',
    publisher: 'BlackElephant',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'en': '/en',
        'pt-BR': '/pt-br',
        'pt-PT': '/pt-pt',
        'es': '/es',
      },
    },
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      siteName: 'BlackElephant',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${siteUrl}/${locale}`,
      locale: OG_LOCALE[locale] || 'en_US',
      alternateLocale: routing.locales.filter(l => l !== locale).map(l => OG_LOCALE[l]).filter(Boolean),
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
          alt: 'BlackElephant Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [`${siteUrl}/logo.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  const { locale } = await params
  
  // Validar locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Habilitar renderização estática
  setRequestLocale(locale)

  // Carregar mensagens do locale
  const messages = await getMessages()

  const htmlLang =
    locale === 'pt-br' ? 'pt-BR' :
    locale === 'pt-pt' ? 'pt-PT' :
    locale

  return (
    <html lang={htmlLang}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <LoadingProvider>
            <SiteShell>
              {children}
            </SiteShell>
          </LoadingProvider>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="AW-18077342694" />
    </html>
  )
}
