import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

type Params = Promise<{ locale: string }>

const CONFIG_CARDS = [
  {
    href: 'configuracoes/kanban',
    title: 'Colunas do Kanban - Software',
    description: 'Configure as colunas do quadro de atividades de software.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
      </svg>
    ),
  },
  {
    href: 'configuracoes/landing-pages',
    title: 'Colunas do Kanban - Landing Pages',
    description: 'Configure as colunas do quadro de atividades de landing pages.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    href: 'configuracoes/sites',
    title: 'Colunas do Kanban - Sites',
    description: 'Configure as colunas do quadro de atividades de sites.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    href: 'configuracoes/tipos-projeto',
    title: 'Tipos de Projeto',
    description: 'Gerencie os tipos de projeto, recorrência e valores.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

export default async function ConfiguracoesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div>
      <AdminPageHeader title="Configurações" subtitle="Personalize o funcionamento do sistema" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONFIG_CARDS.map(card => (
          <Link
            key={card.href}
            href={`/dashboard/admin/${card.href}`}
            className="group flex flex-col gap-3 rounded-xl border p-6 transition-all duration-200"
            style={{
              borderColor: 'var(--card-border)',
              background: 'var(--background-secondary)',
            }}
          >
            <span
              className="transition-colors"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {card.icon}
            </span>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}
              >
                {card.title}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
