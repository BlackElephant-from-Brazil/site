import { setRequestLocale } from 'next-intl/server'
import { getKanbanBoard } from '@/lib/actions/kanban-cards'
import { getProjects } from '@/lib/actions/projects'
import { getAdminUsers, getCurrentUserPublicId } from '@/lib/actions/users'
import { getClients } from '@/lib/actions/clients'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function KanbanPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projectsWithRefs, adminUsers, clients, currentUserId] = await Promise.all([
    getKanbanBoard(),
    getProjects(),
    getAdminUsers(),
    getClients(),
    getCurrentUserPublicId(),
  ])
  return (
    <KanbanBoard
      initialBoard={board}
      projects={projectsWithRefs}
      adminUsers={adminUsers}
      clients={clients}
      currentUserId={currentUserId}
    />
  )
}
