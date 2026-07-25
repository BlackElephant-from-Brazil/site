import { createAdminClient } from '@/lib/supabase/admin'
import type { BlogPostWithAuthor } from '@/types'

/**
 * Posts publicados para o site público (blog_posts tem RLS admin-only, então
 * usamos o service role; filtramos por published_at <= agora para esconder
 * posts agendados). Conteúdo do blog é público por natureza.
 */
export async function getPublishedBlogPosts(limit?: number): Promise<BlogPostWithAuthor[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('blog_posts')
    .select('*, author:users(id, name)')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPostWithAuthor[]
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:users(id, name)')
    .eq('slug', slug)
    .lte('published_at', new Date().toISOString())
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as BlogPostWithAuthor | null) ?? null
}
