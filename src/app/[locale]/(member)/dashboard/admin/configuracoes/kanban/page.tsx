import { setRequestLocale } from 'next-intl/server'
import { getKanbanColumns } from '@/lib/actions/kanban-columns'
import { KanbanColumnsConfigView } from '@/components/admin/views/KanbanColumnsConfigView'

type Params = Promise<{ locale: string }>

export default async function KanbanConfigPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const columns = await getKanbanColumns()
  return <KanbanColumnsConfigView initialColumns={columns} />
}
