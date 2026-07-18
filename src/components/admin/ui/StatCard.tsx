import type { ReactNode } from 'react'
import { AdminCard } from './AdminCard'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  accent?: 'brand' | 'accent' | 'deep' | 'muted'
}

const ACCENTS = {
  brand: { fg: 'var(--color-brand)', soft: 'rgba(31,111,107,0.10)' },
  accent: { fg: 'var(--color-accent-dark)', soft: 'rgba(232,169,60,0.14)' },
  deep: { fg: 'var(--color-deep)', soft: 'rgba(18,59,79,0.08)' },
  muted: { fg: 'var(--foreground-muted)', soft: 'var(--background-tertiary)' },
} as const

/** Tile de KPI: rótulo em caixa alta, valor grande (Sora), ícone em pill colorida. */
export function StatCard({ label, value, hint, icon, accent = 'brand' }: StatCardProps) {
  const a = ACCENTS[accent]
  return (
    <AdminCard padding="1.25rem 1.35rem">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {label}
          </p>
          <p
            className="mt-2 text-[2rem] leading-none font-bold tabular-nums"
            style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              {hint}
            </p>
          )}
        </div>
        {icon && (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: a.soft, color: a.fg }}
          >
            {icon}
          </span>
        )}
      </div>
    </AdminCard>
  )
}
