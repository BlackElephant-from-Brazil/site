'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Client, ClientType } from '@/types'

export async function getClients(): Promise<Client[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('trade_name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createClient(payload: {
  trade_name: string
  cnpj?: string | null
  company_name?: string | null
  logo_url?: string | null
  client_type?: ClientType
}): Promise<Client> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/clientes')
  return data
}

export async function updateClient(
  id: string,
  payload: Partial<{
    trade_name: string
    cnpj: string | null
    company_name: string | null
    logo_url: string | null
    client_type: ClientType
  }>
): Promise<Client> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/clientes')
  return data
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/clientes')
}
