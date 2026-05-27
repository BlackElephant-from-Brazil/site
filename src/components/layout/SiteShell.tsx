'use client'

import Image from 'next/image'
import Script from 'next/script'
import { GoogleTagManager } from '@next/third-parties/google'
import { usePathname } from '@/i18n/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

const HIDE_CHROME = ['/login', '/signup', '/forgot-password', '/dashboard', '/reset-password']
const GTM_ID = 'GTM-TL3KWXFR'
const UMAMI_WEBSITE_ID = 'cef9a48e-8eea-4d3a-bba8-6a2f8db03723'

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

function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/5519978055531"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tirar dúvidas no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full lg:hidden"
      style={{
        backgroundColor: 'var(--color-lime)',
        color: '#0a0a0a',
        boxShadow:
          '0 14px 34px rgba(57,255,20,0.30), 0 0 0 1px rgba(10,10,10,0.18)',
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

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome = HIDE_CHROME.some(p => pathname.startsWith(p))

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <PublicGoogleTagManager />
      <PublicUmamiAnalytics />
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <FloatingWhatsAppButton />
    </>
  )
}
