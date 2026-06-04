import { setRequestLocale } from 'next-intl/server'
import {
  getSitesKanbanColumns,
  createSitesKanbanColumn,
  updateSitesKanbanColumn,
  reorderSitesKanbanColumns,
  deleteSitesKanbanColumn,
} from '@/lib/actions/sites-kanban-columns'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function SitesConfigPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const columns = await getSitesKanbanColumns()
  return (
    <KanbanColumnsConfigView
      title="Colunas do Kanban - Sites"
      subtitle="Configure as colunas do quadro de atividades de sites"
      initialColumns={columns}
      createColumn={createSitesKanbanColumn}
      updateColumn={updateSitesKanbanColumn}
      reorderColumns={reorderSitesKanbanColumns}
      deleteColumn={deleteSitesKanbanColumn}
    />
  )
}
