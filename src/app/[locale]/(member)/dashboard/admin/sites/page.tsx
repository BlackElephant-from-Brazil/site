import { setRequestLocale } from 'next-intl/server'
import { getSitesKanbanBoard, createSitesKanbanCard, moveSitesKanbanCard, updateSitesKanbanCard, deleteSitesKanbanCard } from '@/lib/actions/sites-kanban-cards'
import { getSitesProjects } from '@/lib/actions/sites-projects'
import { getAdminUsers, getCurrentUserPublicId } from '@/lib/actions/users'
import { getClients } from '@/lib/actions/clients'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function SitesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projects, adminUsers, clients, currentUserId] = await Promise.all([
    getSitesKanbanBoard(),
    getSitesProjects(),
    getAdminUsers(),
    getClients(),
    getCurrentUserPublicId(),
  ])
  return (
    <KanbanBoard
      title="Sites"
      subtitle="Quadro de atividades de sites"
      initialBoard={board}
      projects={projects}
      adminUsers={adminUsers}
      clients={clients}
      currentUserId={currentUserId}
      createCard={createSitesKanbanCard}
      moveCard={moveSitesKanbanCard}
      updateCard={updateSitesKanbanCard}
      deleteCard={deleteSitesKanbanCard}
    />
  )
}
