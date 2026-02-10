/**
 * User Queries
 * 
 * Todas as queries relacionadas a usuários.
 * Use apenas em Server Components ou Server Actions.
 */

import { createClient } from '../server'
import type { User } from '@/types'

/**
 * Busca o usuário atual autenticado
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Busca dados adicionais do perfil se existir tabela profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile ? {
    id: user.id,
    email: user.email!,
    name: profile.name,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  } : {
    id: user.id,
    email: user.email!,
    name: null,
    avatar_url: null,
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  }
}

/**
 * Busca um usuário por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return data as User
}
