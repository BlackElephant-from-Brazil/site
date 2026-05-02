'use client'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* gradient banner — contained with rounded corners */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '2.25rem 2rem 1.75rem',
          borderRadius: '1rem',
          border: '1px solid rgba(57,255,20,0.18)',
          boxShadow: '0 0 40px rgba(57,255,20,0.10), 0 0 80px rgba(57,255,20,0.05)',
          background:
            'linear-gradient(120deg, rgba(57,255,20,0.10) 0%, rgba(57,255,20,0.03) 45%, transparent 70%)',
        }}
      >
        {/* glow orb */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '-40px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'var(--primary)',
            opacity: 0.07,
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />
        {/* second smaller orb for depth */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '60px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'var(--primary)',
            opacity: 0.06,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.6rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            background: 'linear-gradient(90deg, #fff 0%, rgba(57,255,20,0.85) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
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
              color: 'var(--foreground-muted)',
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
