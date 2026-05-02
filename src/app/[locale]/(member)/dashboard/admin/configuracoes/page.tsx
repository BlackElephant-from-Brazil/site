import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

type Params = Promise<{ locale: string }>

const CONFIG_CARDS = [
  {
    href: 'configuracoes/kanban',
    title: 'Colunas do Kanban',
    description: 'Adicione, renomeie, reordene e exclua colunas do quadro.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="8" rx="1" />
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
