import { cn } from '@/lib/utils'
import { type ReactNode, type ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg'
  /** Ícone à esquerda */
  leftIcon?: ReactNode
  /** Ícone à direita */
  rightIcon?: ReactNode
  /** Ocupar largura total */
  fullWidth?: boolean
  /** Estado de carregamento */
  loading?: boolean
  children: ReactNode
}

/**
 * Componente Button
 * Botão estilizado com variantes e tamanhos
 */
export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary: `
      bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]
      hover:bg-[var(--button-primary-hover)]
      focus:ring-[var(--primary)]
      shadow-md hover:shadow-glow
    `,
    secondary: `
      bg-[var(--background-secondary)] text-[var(--foreground)]
      hover:bg-[var(--background-tertiary)]
      border border-[var(--card-border)]
      focus:ring-[var(--primary)]
    `,
    outline: `
      bg-transparent text-[var(--primary)]
      border-2 border-[var(--primary)]
      hover:bg-[var(--primary-soft)]
      focus:ring-[var(--primary)]
    `,
    ghost: `
      bg-transparent text-[var(--foreground)]
      hover:bg-[var(--background-secondary)]
      hover:text-[var(--primary)]
      focus:ring-[var(--primary)]
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon}
    </button>
  )
}
