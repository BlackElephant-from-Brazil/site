import { createAdminClient } from '../admin'
import type { GoalWithActivities, GoalWithProgress } from '@/types'

export async function getGoals(): Promise<GoalWithProgress[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_activities(id, is_completed)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((g: any) => ({
    id: g.id,
    name: g.name,
    objective: g.objective,
    created_at: g.created_at,
    updated_at: g.updated_at,
    total: g.goal_activities?.length ?? 0,
    completed: g.goal_activities?.filter((a: any) => a.is_completed).length ?? 0,
  }))
}

export async function getGoalWithActivities(id: string): Promise<GoalWithActivities | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*, activities:goal_activities(*)')
    .eq('id', id)
    .order('position', { referencedTable: 'goal_activities', ascending: true })
    .single()
  if (error) return null
  return data as GoalWithActivities
}
