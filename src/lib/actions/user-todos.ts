'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { UserTodo } from '@/types'

export async function fetchUserTodos(userId: string): Promise<UserTodo[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_todos')
    .select('*')
    .eq('user_id', userId)
    .order('is_completed', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as UserTodo[]
}

export async function createUserTodo(
  userId: string,
  title: string,
  description?: string,
  dueDate?: string,
): Promise<UserTodo> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_todos')
    .insert({
      user_id: userId,
      title,
      description: description ?? null,
      due_date: dueDate ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as UserTodo
}

export async function toggleUserTodo(id: string, isCompleted: boolean): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('user_todos')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteUserTodo(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('user_todos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
