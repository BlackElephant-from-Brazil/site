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
  
  return {
    title: 'Black Elephant',
    description: 'Black Elephant - Transformando ideias em realidade',
    alternates: {
      languages: {
        'pt-BR': '/pt',
        'es': '/es',
        'en': '/en',
        'de': '/de',
        'fr': '/fr',
        'it': '/it',
      },
    },
    openGraph: {
      locale: locale,
      alternateLocale: routing.locales.filter(l => l !== locale),
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
