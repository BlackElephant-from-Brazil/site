'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LandingPageProjectWithClient } from '@/types'

export async function getLandingPagesProjects(): Promise<LandingPageProjectWithClient[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_projects')
    .select('*, client:clients(*)')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as LandingPageProjectWithClient[]
}

export async function createLandingPageProject(payload: {
  name: string
  acronym: string
  client_id?: string | null
  is_internal?: boolean
}): Promise<LandingPageProjectWithClient> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_projects')
    .insert(payload)
    .select('*, client:clients(*)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  return data as LandingPageProjectWithClient
}

export async function updateLandingPageProject(
  id: string,
  payload: Partial<{ name: string; acronym: string; client_id: string | null; is_internal: boolean }>
): Promise<LandingPageProjectWithClient> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_pages_projects')
    .update(payload)
    .eq('id', id)
    .select('*, client:clients(*)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
  return data as LandingPageProjectWithClient
}

export async function deleteLandingPageProject(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('landing_pages_projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/landing-pages')
}
