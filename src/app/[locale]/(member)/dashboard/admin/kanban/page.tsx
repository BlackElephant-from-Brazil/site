import { setRequestLocale } from 'next-intl/server'
import { getKanbanBoard } from '@/lib/actions/kanban-cards'
import { getProjects } from '@/lib/actions/projects'
import { getAdminUsers } from '@/lib/actions/users'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function KanbanPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projectsWithRefs, adminUsers] = await Promise.all([
    getKanbanBoard(),
    getProjects(),
    getAdminUsers(),
  ])
  return <KanbanBoard initialBoard={board} projects={projectsWithRefs} adminUsers={adminUsers} />
}
