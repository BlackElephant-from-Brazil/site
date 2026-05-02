'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Project, ProjectWithRefs } from '@/types'

export async function getProjects(): Promise<ProjectWithRefs[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      project_type:project_types(*)
    `)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as ProjectWithRefs[]
}

export async function createProject(payload: {
  name: string
  acronym: string
  is_internal: boolean
  client_id?: string | null
  project_type_id?: string | null
  service_value?: number | null
}): Promise<Project> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/projetos')
  return data
}

export async function updateProject(
  id: string,
  payload: Partial<{
    name: string
    acronym: string
    is_internal: boolean
    client_id: string | null
    project_type_id: string | null
    service_value: number | null
  }>
): Promise<Project> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/projetos')
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/projetos')
}
