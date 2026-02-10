'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/utils'

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/portfolio', label: t('portfolio') },
    { href: '/plans', label: t('plans') },
    { href: '/about', label: t('about') },
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
            ? 'max-w-[var(--container-max-width)] rounded-2xl border border-white/10 shadow-2xl shadow-black/20'
            : 'border-b border-white/5'
        )}
        style={{
          backgroundColor: isScrolled 
            ? 'rgba(10, 10, 10, 0.85)' 
            : 'rgba(10, 10, 10, 0.5)',
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
                  'hover:text-white rounded-lg hover:bg-white/5'
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

          {/* Login Button - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className={cn(
                'px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300',
                'hover:shadow-lg hover:shadow-[var(--color-lime)]/20 hover:scale-105',
                'active:scale-95'
              )}
              style={{
                backgroundColor: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
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
        <div className="px-4 py-4 border-t border-white/5">
          <nav className="space-y-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300',
                  'hover:bg-white/5 hover:text-white'
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
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link
              href="/login"
              className="block px-4 py-3 rounded-xl text-base font-semibold text-center transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-lime)]/20"
              style={{
                backgroundColor: 'var(--button-primary-bg)',
                color: 'var(--button-primary-text)',
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
