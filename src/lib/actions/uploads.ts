'use server'

import { createAdminClient } from '@/lib/supabase/admin'

// Requires a public bucket named "kanban-attachments" in Supabase Storage.
export async function uploadKanbanImage(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  if (!file || !file.size) throw new Error('Nenhum arquivo fornecido.')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from('kanban-attachments')
    .upload(filename, file, { contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('kanban-attachments').getPublicUrl(filename)
  return data.publicUrl
}
