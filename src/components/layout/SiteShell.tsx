'use client'

import Image from 'next/image'
import Script from 'next/script'
import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'
import { GoogleTagManager } from '@next/third-parties/google'
import { usePathname } from '@/i18n/navigation'
import { reportContatoWhatsappConversion } from '@/lib/analytics/google-ads'
import { Header } from './Header'
import { Footer } from './Footer'

const HIDE_CHROME = ['/login', '/signup', '/forgot-password', '/dashboard', '/reset-password']
const HIDE_HEADER = ['/venda-mais-com-uma-landing-page-de-alta-conversao', '/somos-uma-agencia-de-marketing-digital-e-web-design-que-cria-sites-em-lisboa-porto-braga-e-toda-portugal']
// LPs autossuficientes: têm o próprio rodapé + WhatsApp, e um design system
// próprio (claro), por isso escondemos o rodapé escuro e o botão flutuante
// global — mas mantemos GTM/Umami/Clarity para o tráfego pago.
const HIDE_FOOTER = ['/somos-uma-agencia-de-marketing-digital-e-web-design-que-cria-sites-em-lisboa-porto-braga-e-toda-portugal']
const GTM_ID = 'GTM-TL3KWXFR'
const UMAMI_WEBSITE_ID = 'cef9a48e-8eea-4d3a-bba8-6a2f8db03723'
const CLARITY_PROJECT_ID = 'wxsoe8gkq7'

function PublicGoogleTagManager() {
  return (
    <>
      <GoogleTagManager gtmId={GTM_ID} />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

function FloatingWhatsAppButton({ isLandingPage }: { isLandingPage: boolean }) {
  return (
    <a
      href="https://wa.me/5519978055531"
      target="_blank"
      rel="noopener noreferrer"
      onClick={isLandingPage ? reportContatoWhatsappConversion : undefined}
      aria-label="Tirar dúvidas no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full lg:hidden"
      style={{
        backgroundColor: '#25D366',
        color: '#08331b',
        boxShadow:
          '0 14px 34px rgba(37,211,102,0.35), 0 0 0 1px rgba(18,59,79,0.10)',
      }}
    >
      <Image
        src="/whatsapp.png"
        alt=""
        width={35}
        height={35}
        aria-hidden="true"
      />
    </a>
  )
}

// Sem JavaScript, as animações de entrada (framer-motion) nunca rodam e o
// conteúdo ficaria congelado no estado inicial `opacity: 0`. Este override só
// existe quando o JS está desligado — para quem tem JS, nada muda.
function NoScriptRevealFallback() {
  return (
    <noscript>
      <style>{
        '[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}'
      }</style>
    </noscript>
  )
}

function PublicUmamiAnalytics() {
  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  )
}

function PublicClarityAnalytics() {
  useEffect(() => {
    Clarity.init(CLARITY_PROJECT_ID)
  }, [])

  return null
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome = HIDE_CHROME.some(p => pathname.startsWith(p))
  const hideHeader = HIDE_HEADER.some(p => pathname.includes(p))
  const isLandingPage = pathname.includes('venda-mais-com-uma-landing-page-de-alta-conversao')
  // LP autossuficiente (rodapé + WhatsApp próprios): esconde rodapé e botão flutuante globais.
  const isSelfContainedLanding = HIDE_FOOTER.some(p => pathname.includes(p))

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <NoScriptRevealFallback />
      <PublicGoogleTagManager />
      <PublicUmamiAnalytics />
      <PublicClarityAnalytics />
      {!hideHeader && <Header />}
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        {!isSelfContainedLanding && <Footer />}
      </div>
      {!isSelfContainedLanding && <FloatingWhatsAppButton isLandingPage={isLandingPage} />}
    </>
  )
}
