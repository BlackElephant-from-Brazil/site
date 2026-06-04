'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { KanbanCard, LandingPageKanbanColumnWithCards } from '@/types'

export async function getLandingPagesKanbanBoard(): Promise<LandingPageKanbanColumnWithCards[]> {
  const supabase = createAdminClient()
  const { data: columns, error: colErr } = await supabase
    .from('landing_pages_kanban_columns')
    .select('*')
    .order('position', { ascending: true })
  if (colErr) throw new Error(colErr.message)

  const { data: cards, error: cardErr } = await supabase
    .from('landing_pages_kanban_cards')
    .select(`
      *,
      project:landing_pages_projects(*, client:clients(*)),
      assignee:users(id, name, avatar_url)
    `)
    .order('position', { ascending: true })
  if (cardErr) throw new Error(cardErr.message)

  return (columns ?? []).map(col => ({
    ...col,
    cards: (cards ?? []).filter(c => c.column_id === col.id),
  })) as LandingPageKanbanColumnWithCards[]
}

export async function createLandingPagesKanbanCard(payload: {
  column_id: string
  name: string
  description?: string | null
  project_id?: string | null
  assignee_id?: string | null
}): Promise<KanbanCard> {
  const supabase = createAdminClient()

  let card_number = 1
  if (payload.project_id) {
    const { count } = await supabase
      .from('landing_pages_kanban_cards')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', payload.project_id)
    card_number = (count ?? 0) + 1
  }

  const { count: posCount } = await supabase
    .from('landing_pages_kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('column_id', payload.column_id)
  const position = posCount ?? 0

  const { data, error } = await supabase
    .from('landing_pages_kanban_cards')
    .insert({ ...payload, card_number, position })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  return data
}

export async function moveLandingPagesKanbanCard(
  cardId: string,
  targetColumnId: string,
  targetPosition: number,
  sourceColumnId: string,
  sourcePosition: number
): Promise<void> {
  const supabase = createAdminClient()

  if (sourceColumnId === targetColumnId) {
    const { data: cards } = await supabase
      .from('landing_pages_kanban_cards')
      .select('id, position')
      .eq('column_id', sourceColumnId)
      .order('position', { ascending: true })

    const reordered = cards ?? []
    const moving = reordered.find(c => c.id === cardId)
    if (!moving) return
    const without = reordered.filter(c => c.id !== cardId)
    without.splice(targetPosition, 0, moving)
    await Promise.all(
      without.map((c, i) =>
        supabase.from('landing_pages_kanban_cards').update({ position: i }).eq('id', c.id)
      )
    )
  } else {
    const { data: sourceCards } = await supabase
      .from('landing_pages_kanban_cards')
      .select('id, position')
      .eq('column_id', sourceColumnId)
      .neq('id', cardId)
      .order('position', { ascending: true })

    const { data: targetCards } = await supabase
      .from('landing_pages_kanban_cards')
      .select('id, position')
      .eq('column_id', targetColumnId)
      .order('position', { ascending: true })

    const newTarget = [...(targetCards ?? [])]
    newTarget.splice(targetPosition, 0, { id: cardId, position: targetPosition })

    await supabase
      .from('landing_pages_kanban_cards')
      .update({ column_id: targetColumnId })
      .eq('id', cardId)

    await Promise.all([
      ...(sourceCards ?? []).map((c, i) =>
        supabase.from('landing_pages_kanban_cards').update({ position: i }).eq('id', c.id)
      ),
      ...newTarget.map((c, i) =>
        supabase.from('landing_pages_kanban_cards').update({ position: i }).eq('id', c.id)
      ),
    ])
  }

  revalidatePath('/dashboard/admin/landing-pages')
}

export async function updateLandingPagesKanbanCard(
  id: string,
  payload: Partial<{ name: string; description: string | null; project_id: string | null; assignee_id: string | null; hours_worked: number | null }>
): Promise<KanbanCard> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_kanban_cards')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  return data
}

export async function deleteLandingPagesKanbanCard(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('landing_pages_kanban_cards').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
}
