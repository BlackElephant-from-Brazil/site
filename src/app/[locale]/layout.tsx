import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/styles/design-tokens.css'
import '../globals.css'

type Params = Promise<{ locale: string }>

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  
  const siteUrl = 'https://blackelephant.com.br'
  
  const titles: Record<string, string> = {
    pt: 'Black Elephant | Desenvolvimento de Software & Automações',
    en: 'Black Elephant | Software Development & Automation',
    es: 'Black Elephant | Desarrollo de Software y Automatización',
    de: 'Black Elephant | Softwareentwicklung & Automatisierung',
    fr: 'Black Elephant | Développement de Logiciels & Automatisation',
    it: 'Black Elephant | Sviluppo Software e Automazione',
  }
  
  const descriptions: Record<string, string> = {
    pt: 'Transformamos ideias em soluções digitais. Sites, aplicativos, sistemas web e automações inteligentes para impulsionar seu negócio.',
    en: 'We transform ideas into digital solutions. Websites, apps, web systems and smart automation to boost your business.',
    es: 'Transformamos ideas en soluciones digitales. Sitios web, aplicaciones, sistemas web y automatización inteligente para impulsar tu negocio.',
    de: 'Wir verwandeln Ideen in digitale Lösungen. Websites, Apps, Websysteme und intelligente Automatisierung für Ihr Unternehmen.',
    fr: 'Nous transformons les idées en solutions numériques. Sites web, applications, systèmes web et automatisation intelligente pour votre entreprise.',
    it: 'Trasformiamo le idee in soluzioni digitali. Siti web, app, sistemi web e automazione intelligente per la tua azienda.',
  }
  
  return {
    title: titles[locale] || titles.pt,
    description: descriptions[locale] || descriptions.pt,
    keywords: ['desenvolvimento de software', 'automação', 'sites', 'aplicativos', 'sistemas web', 'Black Elephant', 'tecnologia', 'inovação'],
    authors: [{ name: 'Black Elephant' }],
    creator: 'Black Elephant',
    publisher: 'Black Elephant',
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'pt-BR': '/pt',
        'es': '/es',
        'en': '/en',
        'de': '/de',
        'fr': '/fr',
        'it': '/it',
      },
    },
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
      apple: '/logo.png',
    },
    openGraph: {
      type: 'website',
      siteName: 'Black Elephant',
      title: titles[locale] || titles.pt,
      description: descriptions[locale] || descriptions.pt,
      url: `${siteUrl}/${locale}`,
      locale: locale,
      alternateLocale: routing.locales.filter(l => l !== locale),
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
          alt: 'Black Elephant Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.pt,
      description: descriptions[locale] || descriptions.pt,
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

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <LoadingProvider>
            <Header />
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </LoadingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
