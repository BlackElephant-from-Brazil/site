import type { CSSProperties, ReactNode } from 'react'

interface AdminCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padding?: string | number
}

/** Card branco arredondado com sombra suave — superfície base do dashboard. */
export function AdminCard({ children, className, style, padding = '1.25rem' }: AdminCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--card-background)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
