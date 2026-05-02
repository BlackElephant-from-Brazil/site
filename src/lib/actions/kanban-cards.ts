'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { KanbanCard, KanbanColumnWithCards } from '@/types'

export async function getKanbanBoard(): Promise<KanbanColumnWithCards[]> {
  const supabase = createAdminClient()
  const { data: columns, error: colErr } = await supabase
    .from('kanban_columns')
    .select('*')
    .order('position', { ascending: true })
  if (colErr) throw new Error(colErr.message)

  const { data: cards, error: cardErr } = await supabase
    .from('kanban_cards')
    .select(`
      *,
      project:projects(
        *,
        client:clients(*),
        project_type:project_types(*)
      )
    `)
    .order('position', { ascending: true })
  if (cardErr) throw new Error(cardErr.message)

  return (columns ?? []).map(col => ({
    ...col,
    cards: (cards ?? []).filter(c => c.column_id === col.id),
  })) as KanbanColumnWithCards[]
}

export async function createKanbanCard(payload: {
  column_id: string
  name: string
  description?: string | null
  project_id?: string | null
}): Promise<KanbanCard> {
  const supabase = createAdminClient()

  // per-project sequential card number
  let card_number = 1
  if (payload.project_id) {
    const { count } = await supabase
      .from('kanban_cards')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', payload.project_id)
    card_number = (count ?? 0) + 1
  }

  // position = end of column
  const { count: posCount } = await supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('column_id', payload.column_id)
  const position = posCount ?? 0

  const { data, error } = await supabase
    .from('kanban_cards')
    .insert({ ...payload, card_number, position })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/kanban')
  return data
}

export async function moveKanbanCard(
  cardId: string,
  targetColumnId: string,
  targetPosition: number,
  sourceColumnId: string,
  sourcePosition: number
): Promise<void> {
  const supabase = createAdminClient()

  if (sourceColumnId === targetColumnId) {
    // reorder within column
    const { data: cards } = await supabase
      .from('kanban_cards')
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
        supabase.from('kanban_cards').update({ position: i }).eq('id', c.id)
      )
    )
  } else {
    // move to different column: shift source, insert into target
    const { data: sourceCards } = await supabase
      .from('kanban_cards')
      .select('id, position')
      .eq('column_id', sourceColumnId)
      .neq('id', cardId)
      .order('position', { ascending: true })

    const { data: targetCards } = await supabase
      .from('kanban_cards')
      .select('id, position')
      .eq('column_id', targetColumnId)
      .order('position', { ascending: true })

    const newTarget = [...(targetCards ?? [])]
    newTarget.splice(targetPosition, 0, { id: cardId, position: targetPosition })

    await supabase
      .from('kanban_cards')
      .update({ column_id: targetColumnId })
      .eq('id', cardId)

    await Promise.all([
      ...(sourceCards ?? []).map((c, i) =>
        supabase.from('kanban_cards').update({ position: i }).eq('id', c.id)
      ),
      ...newTarget.map((c, i) =>
        supabase.from('kanban_cards').update({ position: i }).eq('id', c.id)
      ),
    ])
  }

  revalidatePath('/dashboard/admin/kanban')
}

export async function updateKanbanCard(
  id: string,
  payload: Partial<{ name: string; description: string | null; project_id: string | null }>
): Promise<KanbanCard> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/kanban')
  return data
}

export async function deleteKanbanCard(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('kanban_cards').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/kanban')
}
