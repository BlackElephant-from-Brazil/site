'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PortfolioItemWithRefs, PortfolioImage } from '@/types'

const ROUTE = '/dashboard/admin/site/portfolio'
const MAX_IMAGES = 20
const REQUIRED_COVERS = 4

export async function getPortfolioItems(): Promise<PortfolioItemWithRefs[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*, project_type:project_types(*), images:portfolio_images(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(item => ({
    ...item,
    images: (item.images ?? []).sort((a: PortfolioImage, b: PortfolioImage) => a.position - b.position),
  })) as PortfolioItemWithRefs[]
}

export async function createPortfolioItem(payload: {
  slug: string
  title: string
  description: string
  keywords: string[]
  project_type_id: string | null
}): Promise<PortfolioItemWithRefs> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('portfolio_items')
    .insert(payload)
    .select('*, project_type:project_types(*), images:portfolio_images(*)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
  return { ...data, images: [] } as PortfolioItemWithRefs
}

export async function updatePortfolioItem(
  id: string,
  payload: Partial<{
    slug: string
    title: string
    description: string
    keywords: string[]
    project_type_id: string | null
  }>
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('portfolio_items').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
}

export async function addPortfolioImages(
  portfolioItemId: string,
  imageUrls: string[]
): Promise<PortfolioImage[]> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('portfolio_images')
    .select('*', { count: 'exact', head: true })
    .eq('portfolio_item_id', portfolioItemId)
  const currentCount = count ?? 0
  if (currentCount + imageUrls.length > MAX_IMAGES) {
    throw new Error(`Limite de ${MAX_IMAGES} imagens por item de portfólio.`)
  }

  const rows = imageUrls.map((image_url, i) => ({
    portfolio_item_id: portfolioItemId,
    image_url,
    position: currentCount + i,
  }))

  const { data, error } = await supabase.from('portfolio_images').insert(rows).select()
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
  return (data ?? []) as PortfolioImage[]
}

export async function setPortfolioCovers(
  portfolioItemId: string,
  coverImageIds: string[]
): Promise<void> {
  if (coverImageIds.length !== REQUIRED_COVERS) {
    throw new Error(`Selecione exatamente ${REQUIRED_COVERS} imagens de capa.`)
  }

  const supabase = createAdminClient()
  const { error: clearError } = await supabase
    .from('portfolio_images')
    .update({ is_cover: false })
    .eq('portfolio_item_id', portfolioItemId)
  if (clearError) throw new Error(clearError.message)

  const { error: setError } = await supabase
    .from('portfolio_images')
    .update({ is_cover: true })
    .in('id', coverImageIds)
  if (setError) throw new Error(setError.message)

  revalidatePath(ROUTE)
}

export async function deletePortfolioImage(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('portfolio_images').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
}

export async function reorderPortfolioImages(
  items: { id: string; position: number }[]
): Promise<void> {
  const supabase = createAdminClient()
  const results = await Promise.all(
    items.map(({ id, position }) =>
      supabase.from('portfolio_images').update({ position }).eq('id', id)
    )
  )
  const failed = results.find(r => r.error)
  if (failed?.error) throw new Error(failed.error.message)
  revalidatePath(ROUTE)
}
