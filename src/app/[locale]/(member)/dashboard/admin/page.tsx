import { setRequestLocale } from 'next-intl/server'
import { getCurrentUser } from '@/lib/supabase/queries/users'
import { getEntriesForDay } from '@/lib/actions/agenda'
import { fetchUserTodos } from '@/lib/actions/user-todos'
import { getKanbanBoard } from '@/lib/actions/kanban-cards'
import { getSitesKanbanBoard } from '@/lib/actions/sites-kanban-cards'
import { getLandingPagesKanbanBoard } from '@/lib/actions/landing-pages-kanban-cards'
import { getGoals } from '@/lib/supabase/queries/goals'

export const dynamic = 'force-dynamic'
import { DashboardView } from '@/components/admin/views/DashboardView'

type Params = Promise<{ locale: string }>

function countCards(board: { cards: unknown[] }[]): number {
  return board.reduce((sum, col) => sum + col.cards.length, 0)
}

export default async function AdminDashboardPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getCurrentUser()
  const today = new Date().toISOString().slice(0, 10)

  const [agendaToday, todos, softwareBoard, sitesBoard, lpBoard, goals] = await Promise.all([
    user ? getEntriesForDay(user.user_id, today) : Promise.resolve([]),
    user ? fetchUserTodos(user.user_id) : Promise.resolve([]),
    getKanbanBoard('software'),
    getSitesKanbanBoard(),
    getLandingPagesKanbanBoard(),
    getGoals(),
  ])

  const pendingTodos = todos
    .filter(t => !t.is_completed)
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })

  const minutesToday = agendaToday.reduce((sum, e) => sum + e.minutes, 0)

  const boardCounts = {
    software: countCards(softwareBoard),
    sites: countCards(sitesBoard),
    landing: countCards(lpBoard),
  }
  const totalCards = boardCounts.software + boardCounts.sites + boardCounts.landing

  const goalsWithProgress = goals.filter(g => g.total > 0)
  const goalsAvg = goalsWithProgress.length
    ? Math.round(
        (goalsWithProgress.reduce((s, g) => s + g.completed / g.total, 0) / goalsWithProgress.length) * 100,
      )
    : 0

  const softwareColumns = softwareBoard.map(col => ({ name: col.name, count: col.cards.length }))

  const topGoals = [...goals]
    .filter(g => g.total > 0)
    .sort((a, b) => a.completed / a.total - b.completed / b.total)
    .slice(0, 3)

  return (
    <DashboardView
      userName={user?.name ?? 'Admin'}
      today={today}
      agendaToday={agendaToday}
      minutesToday={minutesToday}
      pendingTodos={pendingTodos}
      boardCounts={boardCounts}
      totalCards={totalCards}
      softwareColumns={softwareColumns}
      goalsAvg={goalsAvg}
      topGoals={topGoals}
    />
  )
}
