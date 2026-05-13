export const dynamic = 'force-dynamic'

import { getGoals } from '@/lib/supabase/queries/goals'
import { MetasView } from '@/components/admin/views/MetasView'

export default async function MetasPage() {
  const goals = await getGoals()
  return <MetasView initialGoals={goals} />
}
