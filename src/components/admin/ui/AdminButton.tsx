import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'ghost' | 'danger'

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const VARIANTS: Record<Variant, React.CSSProperties> = {
  // teal sólido, texto branco — ação principal neutra
  primary: { background: 'var(--color-brand)', color: '#fff', boxShadow: 'var(--shadow-soft)' },
  // âmbar CTA — ações de criação/destaque
  accent: { background: 'var(--color-accent)', color: 'var(--color-accent-ink)', boxShadow: 'var(--shadow-cta)' },
  ghost: { background: 'transparent', color: 'var(--foreground-muted)', border: '1px solid var(--card-border)' },
  danger: { background: 'rgba(214,69,69,0.08)', color: 'var(--color-error)', border: '1px solid rgba(214,69,69,0.25)' },
}

/** Botão do dashboard (pill). Variantes: primary (teal), accent (âmbar), ghost, danger. */
export function AdminButton({ variant = 'primary', children, style, className, ...props }: AdminButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${className ?? ''}`}
      style={{ ...VARIANTS[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
