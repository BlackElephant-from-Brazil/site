import { setRequestLocale } from 'next-intl/server'
import {
  getKanbanColumns,
  createKanbanColumn,
  updateKanbanColumn,
  reorderKanbanColumns,
  deleteKanbanColumn,
} from '@/lib/actions/kanban-columns'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function KanbanConfigPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const columns = await getKanbanColumns()
  return (
    <KanbanColumnsConfigView
      title="Colunas do Kanban - Software"
      subtitle="Configure as colunas do quadro de atividades de software"
      initialColumns={columns}
      createColumn={createKanbanColumn}
      updateColumn={updateKanbanColumn}
      reorderColumns={reorderKanbanColumns}
      deleteColumn={deleteKanbanColumn}
    />
  )
}
