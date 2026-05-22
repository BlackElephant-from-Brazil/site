'use client'

import { useState, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/ui'
import { signOut } from '@/lib/auth/actions'
import type { User } from '@/types'

const ADMIN_BASE = '/dashboard/admin'

const NAV = [
  {
    label: 'Dashboard',
    href: `${ADMIN_BASE}`,
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Metas',
    href: `${ADMIN_BASE}/metas`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    label: 'Agenda',
    href: `${ADMIN_BASE}/agenda`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Desenvolvimento',
    accordion: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    children: [
      {
        label: 'Kanban',
        href: `${ADMIN_BASE}/kanban`,
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
          </svg>
        ),
      },
      {
        label: 'Projetos',
        href: `${ADMIN_BASE}/projetos`,
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        label: 'Configurações',
        href: `${ADMIN_BASE}/configuracoes`,
        icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Financeiro',
    href: `${ADMIN_BASE}/financeiro`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Clientes',
    href: `${ADMIN_BASE}/clientes`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Usuários',
    href: `${ADMIN_BASE}/usuarios`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

interface NavLinkProps {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  indent?: boolean
}

function NavLink({ href, label, icon, exact, indent }: NavLinkProps) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150"
      style={{
        color: active ? 'var(--primary)' : 'var(--foreground-muted)',
        background: active ? 'rgba(57,255,20,0.07)' : 'transparent',
        paddingLeft: indent ? '2.5rem' : undefined,
      }}
    >
      <span style={{ color: active ? 'var(--primary)' : 'var(--foreground-muted)' }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {active && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 8px var(--primary)',
            flexShrink: 0,
          }}
        />
      )}
    </Link>
  )
}

export function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const devRoutes = [`${ADMIN_BASE}/kanban`, `${ADMIN_BASE}/projetos`, `${ADMIN_BASE}/configuracoes`]
  const devActive = devRoutes.some(r => pathname.startsWith(r))
  const [devOpen, setDevOpen] = useState(devActive)

  useEffect(() => {
    if (devActive) setDevOpen(true)
  }, [devActive])

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col"
      style={{
        background: 'var(--nav-background)',
        borderRight: '1px solid var(--card-border)',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* logo — vertical layout, left-aligned */}
      <div className="flex flex-col items-start gap-1.5 px-5 pb-4 pt-6">
        <Logo variant="icon" size={52} />
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'var(--foreground-muted)' }}
        >
          blackelephant
        </span>
      </div>

      <div className="mx-4 border-t" style={{ borderColor: 'var(--card-border)' }} />

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV.map(item => {
            if (item.accordion && item.children) {
              const open = devOpen
              return (
                <li key={item.label}>
                  <button
                    onClick={() => setDevOpen(v => !v)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{ color: devActive ? 'var(--primary)' : 'var(--foreground-muted)' }}
                  >
                    <span className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      {item.label}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.ul
                        key="children"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                        className="flex flex-col gap-0.5 pt-0.5"
                      >
                        {item.children.map(child => (
                          <li key={child.href}>
                            <NavLink href={child.href} label={child.label} icon={child.icon} indent />
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              )
            }
            return (
              <li key={item.href}>
                <NavLink href={item.href!} label={item.label} icon={item.icon} exact={item.exact} />
              </li>
            )
          })}
        </ul>
      </nav>

      {/* user card */}
      <div className="px-3 pb-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(57,255,20,0.1) 0%, rgba(57,255,20,0.03) 100%)',
            border: '1px solid rgba(57,255,20,0.18)',
            boxShadow: '0 0 24px rgba(57,255,20,0.06)',
          }}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: 'rgba(57,255,20,0.15)',
                color: 'var(--primary)',
                boxShadow: '0 0 12px rgba(57,255,20,0.2)',
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-xs font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                {user.name}
              </p>
              <p
                className="text-[0.6rem] uppercase tracking-widest"
                style={{ color: 'var(--primary)' }}
              >
                admin
              </p>
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg py-1.5 text-xs font-semibold transition-all"
              style={{
                background: 'rgba(255,59,48,0.12)',
                color: '#ff3b30',
                border: '1px solid rgba(255,59,48,0.25)',
              }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
