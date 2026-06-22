'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { KanbanColumn } from '@/types'

export async function getLandingPagesProjectStages(): Promise<KanbanColumn[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_project_stages')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createLandingPagesProjectStage(name: string): Promise<KanbanColumn> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('landing_pages_project_stages')
    .select('*', { count: 'exact', head: true })
  const position = count ?? 0
  const { data, error } = await supabase
    .from('landing_pages_project_stages')
    .insert({ name, position })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/etapas-landing-pages')
  return data
}

export async function updateLandingPagesProjectStage(id: string, name: string): Promise<KanbanColumn> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_project_stages')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/etapas-landing-pages')
  return data
}

export async function reorderLandingPagesProjectStages(orderedIds: string[]): Promise<void> {
  const supabase = createAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('landing_pages_project_stages').update({ position: index }).eq('id', id)
    )
  )
  revalidatePath('/dashboard/admin/configuracoes/etapas-landing-pages')
}

export async function deleteLandingPagesProjectStage(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { count, error: countError } = await supabase
    .from('landing_pages_projects')
    .select('*', { count: 'exact', head: true })
    .eq('landing_page_stage_id', id)
  if (countError) throw new Error(countError.message)
  if ((count ?? 0) > 0) {
    throw new Error(`Esta etapa está em uso por ${count} projeto(s). Altere a etapa desses projetos antes de remover.`)
  }
  const { error } = await supabase.from('landing_pages_project_stages').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/configuracoes/etapas-landing-pages')
}
