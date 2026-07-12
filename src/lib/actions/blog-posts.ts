'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { BlogPostWithAuthor } from '@/types'

const ROUTE = '/dashboard/admin/site/blog'

export async function getBlogPosts(): Promise<BlogPostWithAuthor[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, author:users(id, name)')
    .order('published_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPostWithAuthor[]
}

export async function createBlogPost(payload: {
  slug: string
  title: string
  excerpt: string
  keywords: string[]
  cover_image_url: string | null
  content_html: string
  published_at: string
}): Promise<BlogPostWithAuthor> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminClient = createAdminClient()
  let authorId: string | null = null
  if (user) {
    const { data: profile } = await adminClient
      .from('users')
      .select('id')
      .eq('user_id', user.id)
      .single()
    authorId = profile?.id ?? null
  }

  const { data, error } = await adminClient
    .from('blog_posts')
    .insert({ ...payload, author_id: authorId })
    .select('*, author:users(id, name)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
  return data as BlogPostWithAuthor
}

export async function updateBlogPost(
  id: string,
  payload: Partial<{
    slug: string
    title: string
    excerpt: string
    keywords: string[]
    cover_image_url: string | null
    content_html: string
    published_at: string
  }>
): Promise<BlogPostWithAuthor> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select('*, author:users(id, name)')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
  return data as BlogPostWithAuthor
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(ROUTE)
}
