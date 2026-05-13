'use client'

type Panel = 'todos' | 'notes' | 'passwords'

interface Props {
  activePanel: Panel | null
  onToggle: (panel: Panel) => void
}

const BUTTONS: { id: Panel; label: string; icon: React.ReactNode }[] = [
  {
    id: 'todos',
    label: 'Tarefas',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'Notas',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: 'passwords',
    label: 'Senhas',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
]

export function TopNavbar({ activePanel, onToggle }: Props) {
  return (
    <div
      className="flex h-12 shrink-0 items-center justify-end gap-1 px-4"
      style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--nav-background)' }}
    >
      {BUTTONS.map(btn => {
        const active = activePanel === btn.id
        return (
          <button
            key={btn.id}
            onClick={() => onToggle(btn.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              color: active ? 'var(--color-lime)' : 'var(--foreground-muted)',
              background: active ? 'rgba(57,255,20,0.1)' : 'transparent',
              border: active ? '1px solid rgba(57,255,20,0.2)' : '1px solid transparent',
            }}
          >
            <span style={{ color: active ? 'var(--color-lime)' : 'var(--foreground-muted)' }}>{btn.icon}</span>
            {btn.label}
          </button>
        )
      })}
    </div>
  )
}
