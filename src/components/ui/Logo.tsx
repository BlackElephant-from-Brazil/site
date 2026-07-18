import Image from 'next/image'
import { cn } from '@/lib/utils'

type Tone = 'dark' | 'light'

export interface LogoProps {
  /** Tamanho do elefante em pixels */
  size?: number
  /** Classes CSS adicionais */
  className?: string
  /** Mostrar apenas o ícone ou com nome */
  variant?: 'icon' | 'full'
  /** 'dark' (padrão): elefante/texto pretos para fundos claros.
   *  'light': elefante invertido (branco) + texto branco para fundos escuros. */
  tone?: Tone
}

/**
 * Logo BlackElephant — elefante preto (logo-elephant.png), sem moldura.
 * Em fundos escuros use tone="light" (inverte para branco).
 */
export function Logo({ size = 48, className, variant = 'icon', tone = 'dark' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/logo-elephant.png"
        alt="BlackElephant"
        width={size}
        height={size}
        className="object-contain"
        style={{ filter: tone === 'light' ? 'invert(1)' : undefined }}
        priority
      />
      {variant === 'full' && <BrandName tone={tone} />}
    </div>
  )
}

export interface BrandNameProps {
  /** Classes CSS adicionais */
  className?: string
  /** Tamanho do texto */
  size?: 'sm' | 'md' | 'lg'
  tone?: Tone
}

/**
 * Nome da marca BlackElephant — wordmark escuro (ou branco em fundo escuro).
 */
export function BrandName({ className, size = 'md', tone = 'dark' }: BrandNameProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }
  const color = tone === 'light' ? '#ffffff' : 'var(--color-deep)'

  return (
    <span
      className={cn('font-extrabold tracking-tight', sizeClasses[size], className)}
      style={{ fontFamily: 'var(--font-title)', color }}
    >
      BlackElephant
    </span>
  )
}
