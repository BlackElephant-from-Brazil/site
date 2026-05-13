'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { UserPassword } from '@/types'

export async function fetchUserPasswords(userId: string): Promise<UserPassword[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_passwords')
    .select('*')
    .eq('user_id', userId)
    .order('service_name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as UserPassword[]
}

export async function createUserPassword(
  userId: string,
  serviceName: string,
  password: string,
  username?: string,
  url?: string,
): Promise<UserPassword> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_passwords')
    .insert({
      user_id: userId,
      service_name: serviceName,
      password,
      username: username ?? null,
      url: url ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as UserPassword
}

export async function updateUserPassword(
  id: string,
  payload: { service_name?: string; username?: string | null; password?: string; url?: string | null },
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('user_passwords')
    .update(payload)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteUserPassword(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('user_passwords').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
