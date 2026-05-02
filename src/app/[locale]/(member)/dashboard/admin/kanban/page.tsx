import { setRequestLocale } from 'next-intl/server'
import { getKanbanBoard } from '@/lib/actions/kanban-cards'
import { getProjects } from '@/lib/actions/projects'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

type Params = Promise<{ locale: string }>

export default async function KanbanPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projectsWithRefs] = await Promise.all([
    getKanbanBoard(),
    getProjects(),
  ])
  return <KanbanBoard initialBoard={board} projects={projectsWithRefs} />
}
