'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SitesProjectWithClient } from '@/types'

export async function getSitesProjects(): Promise<SitesProjectWithClient[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sites_projects')
    .select('*, client:clients(*)')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as SitesProjectWithClient[]
}

export async function createSitesProject(payload: {
  name: string
  acronym: string
  client_id?: string | null
  is_internal?: boolean
}): Promise<SitesProjectWithClient> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sites_projects')
    .insert(payload)
    .select('*, client:clients(*)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/sites')
  return data as SitesProjectWithClient
}

export async function updateSitesProject(
  id: string,
  payload: Partial<{ name: string; acronym: string; client_id: string | null; is_internal: boolean }>
): Promise<SitesProjectWithClient> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sites_projects')
    .update(payload)
    .eq('id', id)
    .select('*, client:clients(*)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/sites')
  return data as SitesProjectWithClient
}

export async function deleteSitesProject(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('sites_projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/sites')
}
