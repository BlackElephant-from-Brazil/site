'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { KanbanColumn } from '@/types'

export async function getProjectStages(): Promise<KanbanColumn[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_stages')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createProjectStage(name: string): Promise<KanbanColumn> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('project_stages')
    .select('*', { count: 'exact', head: true })
  const position = count ?? 0
  const { data, error } = await supabase
    .from('project_stages')
    .insert({ name, position })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/etapas-software')
  return data
}

export async function updateProjectStage(id: string, name: string): Promise<KanbanColumn> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_stages')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/etapas-software')
  return data
}

export async function reorderProjectStages(orderedIds: string[]): Promise<void> {
  const supabase = createAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('project_stages').update({ position: index }).eq('id', id)
    )
  )
  revalidatePath('/dashboard/admin/configuracoes/etapas-software')
}

export async function deleteProjectStage(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { count, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('software_stage_id', id)
  if (countError) throw new Error(countError.message)
  if ((count ?? 0) > 0) {
    throw new Error(`Esta etapa está em uso por ${count} projeto(s). Altere a etapa desses projetos antes de remover.`)
  }
  const { error } = await supabase.from('project_stages').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/etapas-software')
}
