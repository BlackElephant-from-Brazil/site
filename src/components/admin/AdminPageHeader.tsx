'use client'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* banner navy → teal com título branco (padrão de seção escura da marca) */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '2.25rem 2rem 1.75rem',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow-soft)',
          background: 'linear-gradient(120deg, #123B4F 0%, #1F6F6B 100%)',
        }}
      >
        {/* grão sutil */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        {/* orb âmbar decorativo */}
        <div
          style={{
            position: 'absolute',
            top: '-70px',
            right: '-30px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'var(--color-accent)',
            opacity: 0.12,
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.6rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#ffffff',
            position: 'relative',
            margin: 0,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.75)',
              marginTop: '0.35rem',
              position: 'relative',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* action slot — no background, no border, right-aligned */}
      {action && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.875rem 0',
          }}
        >
          {action}
        </div>
      )}
    </div>
  )
}
