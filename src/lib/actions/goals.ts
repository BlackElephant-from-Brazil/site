'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Goal, GoalActivity } from '@/types'

export async function createGoal(name: string, objective: string): Promise<Goal> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('goals')
    .insert({ name, objective })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/metas')
  return data as Goal
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/metas')
}

export async function createGoalActivity(
  goalId: string,
  title: string,
  parentId?: string | null
): Promise<GoalActivity> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('goal_activities')
    .select('*', { count: 'exact', head: true })
    .eq('goal_id', goalId)
  const position = count ?? 0
  const { data, error } = await supabase
    .from('goal_activities')
    .insert({ goal_id: goalId, title, position, parent_id: parentId ?? null })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/metas')
  return data as GoalActivity
}

export async function toggleGoalActivity(id: string, isCompleted: boolean): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('goal_activities')
    .update({ is_completed: isCompleted })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/metas')
}

export async function deleteGoalActivity(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('goal_activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/metas')
}
