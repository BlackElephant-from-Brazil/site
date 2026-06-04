import { setRequestLocale } from 'next-intl/server'
import {
  getLandingPagesKanbanColumns,
  createLandingPagesKanbanColumn,
  updateLandingPagesKanbanColumn,
  reorderLandingPagesKanbanColumns,
  deleteLandingPagesKanbanColumn,
} from '@/lib/actions/landing-pages-kanban-columns'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function LandingPagesConfigPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const columns = await getLandingPagesKanbanColumns()
  return (
    <KanbanColumnsConfigView
      title="Colunas do Kanban - Landing Pages"
      subtitle="Configure as colunas do quadro de atividades de landing pages"
      initialColumns={columns}
      createColumn={createLandingPagesKanbanColumn}
      updateColumn={updateLandingPagesKanbanColumn}
      reorderColumns={reorderLandingPagesKanbanColumns}
      deleteColumn={deleteLandingPagesKanbanColumn}
    />
  )
}
