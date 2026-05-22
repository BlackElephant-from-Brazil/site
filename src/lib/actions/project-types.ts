'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ProjectType } from '@/types'

export async function getProjectTypes(): Promise<ProjectType[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_types')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createProjectType(payload: {
  name: string
  is_internal: boolean
  is_recurring: boolean
  one_time_value?: number | null
  recurring_value?: number | null
  monthly_hours?: number | null
  has_monthly_bank?: boolean
}): Promise<ProjectType> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_types')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/tipos-projeto')
  return data
}

export async function updateProjectType(
  id: string,
  payload: Partial<{
    name: string
    is_internal: boolean
    is_recurring: boolean
    one_time_value: number | null
    recurring_value: number | null
    monthly_hours: number | null
    has_monthly_bank: boolean
  }>
): Promise<ProjectType> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_types')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/tipos-projeto')
  return data
}

export async function deleteProjectType(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('project_types').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/tipos-projeto')
}
