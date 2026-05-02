'use client'

import { usePathname } from '@/i18n/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

const HIDE_CHROME = ['/login', '/signup', '/forgot-password', '/dashboard', '/reset-password']

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideChrome = HIDE_CHROME.some(p => pathname.startsWith(p))

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  )
}
