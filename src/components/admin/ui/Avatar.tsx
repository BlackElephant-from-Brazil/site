import { avatarColor } from './styles'

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

/** Círculo com inicial e cor determinística da paleta da marca. */
export function Avatar({ name, size = 36, className }: AvatarProps) {
  const bg = avatarColor(name || '?')
  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        fontFamily: 'var(--font-title)',
        flexShrink: 0,
      }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  )
}
