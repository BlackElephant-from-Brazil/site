export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getGoalWithActivities } from '@/lib/supabase/queries/goals'
import { MetaDetailView } from '@/components/admin/views/MetaDetailView'

type Params = Promise<{ id: string }>

export default async function MetaDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const goal = await getGoalWithActivities(id)
  if (!goal) notFound()
  return <MetaDetailView goal={goal} />
}
