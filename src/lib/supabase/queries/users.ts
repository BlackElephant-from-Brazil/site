import { createClient } from '../server'
import type { User } from '@/types'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    user_id: profile.user_id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return data as User
}
