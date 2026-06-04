import { setRequestLocale } from 'next-intl/server'
import { getLandingPagesKanbanBoard, createLandingPagesKanbanCard, moveLandingPagesKanbanCard, updateLandingPagesKanbanCard, deleteLandingPagesKanbanCard } from '@/lib/actions/landing-pages-kanban-cards'
import { getLandingPagesProjects } from '@/lib/actions/landing-pages-projects'
import { getAdminUsers, getCurrentUserPublicId } from '@/lib/actions/users'
import { getClients } from '@/lib/actions/clients'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function LandingPagesPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projects, adminUsers, clients, currentUserId] = await Promise.all([
    getLandingPagesKanbanBoard(),
    getLandingPagesProjects(),
    getAdminUsers(),
    getClients(),
    getCurrentUserPublicId(),
  ])
  return (
    <KanbanBoard
      title="Landing Pages"
      subtitle="Quadro de atividades de landing pages"
      initialBoard={board}
      projects={projects}
      adminUsers={adminUsers}
      clients={clients}
      currentUserId={currentUserId}
      createCard={createLandingPagesKanbanCard}
      moveCard={moveLandingPagesKanbanCard}
      updateCard={updateLandingPagesKanbanCard}
      deleteCard={deleteLandingPagesKanbanCard}
    />
  )
}
