'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { KanbanColumn } from '@/types'

export async function getLandingPagesKanbanColumns(): Promise<KanbanColumn[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_kanban_columns')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createLandingPagesKanbanColumn(name: string): Promise<KanbanColumn> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('landing_pages_kanban_columns')
    .select('*', { count: 'exact', head: true })
  const position = count ?? 0
  const { data, error } = await supabase
    .from('landing_pages_kanban_columns')
    .insert({ name, position })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  revalidatePath('/dashboard/admin/configuracoes/landing-pages')
  return data
}

export async function updateLandingPagesKanbanColumn(id: string, name: string): Promise<KanbanColumn> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_kanban_columns')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  revalidatePath('/dashboard/admin/configuracoes/landing-pages')
  return data
}

export async function reorderLandingPagesKanbanColumns(orderedIds: string[]): Promise<void> {
  const supabase = createAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('landing_pages_kanban_columns').update({ position: index }).eq('id', id)
    )
  )
  revalidatePath('/dashboard/admin/landing-pages')
  revalidatePath('/dashboard/admin/configuracoes/landing-pages')
}

export async function deleteLandingPagesKanbanColumn(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { count, error: countError } = await supabase
    .from('landing_pages_kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('column_id', id)
  if (countError) throw new Error(countError.message)
  if ((count ?? 0) > 0) {
    throw new Error(`Esta coluna possui ${count} card(s). Mova ou exclua os cards antes de remover a coluna.`)
  }
  const { error } = await supabase.from('landing_pages_kanban_columns').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  revalidatePath('/dashboard/admin/configuracoes/landing-pages')
}
