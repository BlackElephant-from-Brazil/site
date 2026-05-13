'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { UserNote } from '@/types'

export async function fetchUserNotes(userId: string): Promise<UserNote[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as UserNote[]
}

export async function createUserNote(userId: string, color?: string): Promise<UserNote> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_notes')
    .insert({ user_id: userId, content: '', color: color ?? '#2a2a1a' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as UserNote
}

export async function updateUserNote(id: string, content: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('user_notes')
    .update({ content })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateUserNoteColor(id: string, color: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('user_notes')
    .update({ color })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteUserNote(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('user_notes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
