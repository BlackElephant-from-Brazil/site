'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/utils'

const localeFlags: Record<string, { flag: string; name: string }> = {
  en: { flag: '🇺🇸', name: 'English' },
  'pt-br': { flag: '🇧🇷', name: 'Português (Brasil)' },
  'pt-pt': { flag: '🇵🇹', name: 'Português (Portugal)' },
  es: { flag: '🇪🇸', name: 'Español' },
}

export interface HeaderProps {
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Header do site institucional
 * Menu: Início, Quem Somos, Serviços, Contato, Login
 */
export function Header({ className }: HeaderProps) {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setIsLangOpen(false)
  }

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/portfolio', label: t('portfolio') },
    { href: '/plans', label: t('plans') },
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ]

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[150] transition-[padding] duration-300 ease-out',
        isScrolled ? 'pt-4 px-4 sm:px-6 lg:px-8' : 'pt-0 px-0',
        className
      )}
    >
      <header
        className={cn(
          'mx-auto w-full transition-all duration-300 ease-out',
          isScrolled
            ? 'max-w-[var(--container-max-width)] rounded-2xl border'
            : 'border-b'
        )}
        style={{
          backgroundColor: isScrolled
            ? 'rgba(255, 255, 255, 0.85)'
            : 'rgba(255, 255, 255, 0.6)',
          borderColor: 'var(--nav-border)',
          boxShadow: isScrolled ? 'var(--shadow-soft)' : 'none',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className={cn(
          'mx-auto transition-all duration-300',
          isScrolled ? 'px-4 sm:px-6' : 'px-4 sm:px-6 lg:px-8 max-w-[var(--container-max-width)]'
        )}>
          <div className={cn(
            'flex items-center justify-between transition-all duration-300',
            isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-20'
          )}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size={isScrolled ? 36 : 40} variant="full" />
            </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-300',
                  'hover:text-[var(--color-brand)] rounded-lg hover:bg-[var(--background-tertiary)]'
                )}
                style={{
                  color: 'var(--foreground-muted)',
                  fontFamily: 'var(--font-primary)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Login Button & Language Selector - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xl transition-all duration-300',
                  'hover:bg-[var(--background-tertiary)] active:scale-95',
                  isLangOpen && 'bg-[var(--background-tertiary)]'
                )}
                aria-label="Selecionar idioma"
              >
                <span>{localeFlags[locale]?.flag}</span>
                <svg 
                  className={cn('w-3 h-3 transition-transform duration-200', isLangOpen && 'rotate-180')}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown */}
              <div
                className={cn(
                  'absolute right-0 top-full mt-2 py-2 rounded-xl border',
                  'transition-all duration-200 origin-top-right',
                  isLangOpen
                    ? 'opacity-100 scale-100 pointer-events-auto'
                    : 'opacity-0 scale-95 pointer-events-none'
                )}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  borderColor: 'var(--nav-border)',
                  boxShadow: 'var(--shadow-soft)',
                  backdropFilter: 'blur(20px)',
                  minWidth: '140px',
                }}
              >
                {Object.entries(localeFlags).map(([code, { flag, name }]) => (
                  <button
                    key={code}
                    onClick={() => handleLocaleChange(code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200',
                      'hover:bg-[var(--background-tertiary)]',
                      locale === code && 'bg-[var(--primary-soft)]'
                    )}
                    style={{
                      color: locale === code ? 'var(--color-brand)' : 'var(--foreground-muted)',
                    }}
                  >
                    <span className="text-lg">{flag}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/login"
              className={cn(
                'px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300',
                'hover:-translate-y-0.5 active:scale-95'
              )}
              style={{
                backgroundColor: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
                boxShadow: 'var(--shadow-cta)',
              }}
            >
              {t('login')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'lg:hidden p-2.5 rounded-xl transition-all duration-300',
              'hover:bg-white/10 active:scale-95',
              isMenuOpen && 'bg-white/10'
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ color: 'var(--foreground)' }}
          >
            <div className="w-5 h-5 relative flex flex-col justify-center items-center">
              <span 
                className={cn(
                  'block h-0.5 w-5 bg-current transition-all duration-300 absolute',
                  isMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                )} 
              />
              <span 
                className={cn(
                  'block h-0.5 w-5 bg-current transition-all duration-300',
                  isMenuOpen && 'opacity-0 scale-0'
                )} 
              />
              <span 
                className={cn(
                  'block h-0.5 w-5 bg-current transition-all duration-300 absolute',
                  isMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                )} 
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-500 ease-out',
          isMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--nav-border)' }}>
          <nav className="space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300',
                  'hover:bg-[var(--background-tertiary)] hover:text-[var(--color-brand)]'
                )}
                style={{ 
                  color: 'var(--foreground-muted)',
                  fontFamily: 'var(--font-primary)',
                  transitionDelay: `${index * 50}ms`,
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--nav-border)' }}>
            {/* Language Selector - Mobile */}
            <div className="flex flex-wrap gap-2 px-2">
              {Object.entries(localeFlags).map(([code, { flag }]) => (
                <button
                  key={code}
                  onClick={() => {
                    handleLocaleChange(code)
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl text-xl transition-all duration-200',
                    'hover:bg-[var(--background-tertiary)] active:scale-95',
                    locale === code
                      ? 'bg-[var(--primary-soft)] ring-1 ring-[var(--color-brand)]'
                      : 'bg-[var(--background-tertiary)]'
                  )}
                >
                  {flag}
                </button>
              ))}
            </div>

            <Link
              href="/login"
              className="block px-4 py-3 rounded-full text-base font-semibold text-center transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
                boxShadow: 'var(--shadow-cta)',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
      </header>
    </div>
  )
}
