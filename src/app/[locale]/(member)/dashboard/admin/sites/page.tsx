import { setRequestLocale } from 'next-intl/server'
import { getKanbanBoard, createKanbanCard, moveKanbanCard, updateKanbanCard, deleteKanbanCard } from '@/lib/actions/kanban-cards'
import { getProjects } from '@/lib/actions/projects'
import { getAdminUsers, getCurrentUserPublicId } from '@/lib/actions/users'
import { getClients } from '@/lib/actions/clients'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function SitesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projects, adminUsers, clients, currentUserId] = await Promise.all([
    getKanbanBoard('site'),
    getProjects('site'),
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
      createCard={createKanbanCard}
      moveCard={moveKanbanCard}
      updateCard={updateKanbanCard}
      deleteCard={deleteKanbanCard}
    />
  )
}
