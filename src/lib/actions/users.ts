'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { User } from '@/types'

export async function getUsers(): Promise<User[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createUser(payload: {
  name: string
  email: string
  role: 'admin' | 'customer'
  avatar_url?: string | null
}): Promise<User> {
  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
    payload.email,
    {
      data: {
        name: payload.name,
        role: payload.role,
        avatar_url: payload.avatar_url ?? null,
      },
    }
  )
  if (authError) throw new Error(authError.message)

  const { data, error } = await supabase
    .from('users')
    .insert({
      user_id: authData.user.id,
      email: authData.user.email!,
      name: payload.name,
      role: payload.role,
      avatar_url: payload.avatar_url ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/usuarios')
  return data
}

export async function updateUser(
  id: string,
  payload: Partial<{
    name: string
    role: 'admin' | 'customer'
    avatar_url: string | null
  }>
): Promise<User> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/usuarios')
  return data
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('users')
    .select('user_id')
    .eq('id', id)
    .single()

  await supabase.from('users').delete().eq('id', id)

  if (profile?.user_id) {
    const { error } = await supabase.auth.admin.deleteUser(profile.user_id)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/usuarios')
}

export async function getAdminUsers(): Promise<Pick<User, 'id' | 'name' | 'avatar_url'>[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('role', 'admin')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}
