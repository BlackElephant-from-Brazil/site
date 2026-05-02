import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface LogoProps {
  /** Tamanho do avatar em pixels */
  size?: number
  /** Classes CSS adicionais */
  className?: string
  /** Mostrar apenas o ícone ou com nome */
  variant?: 'icon' | 'full'
}

/**
 * Logo BlackElephant
 * Avatar redondo com fundo preto e logo branca centralizada
 */
export function Logo({ size = 48, className, variant = 'icon' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="relative flex items-center justify-center rounded-full overflow-hidden"
        style={{
          width: size,
          height: size,
          backgroundColor: 'var(--color-black)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <Image
          src="/logo.png"
          alt="BlackElephant Logo"
          width={size * 0.7}
          height={size * 0.7}
          className="object-contain"
          priority
        />
      </div>
      {variant === 'full' && <BrandName />}
    </div>
  )
}

export interface BrandNameProps {
  /** Classes CSS adicionais */
  className?: string
  /** Tamanho do texto */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Nome da marca BlackElephant
 * "Black" em cor de contraste (branco/preto) + "Elephant" em verde limão
 */
export function BrandName({ className, size = 'md' }: BrandNameProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <span
      className={cn(
        'font-bold tracking-tight',
        sizeClasses[size],
        className
      )}
      style={{ fontFamily: 'var(--font-title)' }}
    >
      <span style={{ color: 'var(--foreground)' }}>Black</span>
      <span style={{ color: 'var(--primary)' }}>Elephant</span>
    </span>
  )
}
