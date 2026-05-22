import { getMonthlyUserSummary, getMonthlyProjectBankSummary } from '@/lib/actions/agenda'
import { getCurrentUser } from '@/lib/supabase/queries/users'
import { AgendaView } from '@/components/admin/views/AgendaView'

export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [user, userSummaries, projectSummaries] = await Promise.all([
    getCurrentUser(),
    getMonthlyUserSummary(year, month),
    getMonthlyProjectBankSummary(year, month),
  ])

  return (
    <AgendaView
      initialUserSummaries={userSummaries}
      initialProjectSummaries={projectSummaries}
      currentUserId={user?.user_id ?? ''}
      currentYear={year}
      currentMonth={month}
    />
  )
}
