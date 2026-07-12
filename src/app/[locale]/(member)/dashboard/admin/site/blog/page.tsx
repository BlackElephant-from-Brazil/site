import { setRequestLocale } from 'next-intl/server'
import { getBlogPosts } from '@/lib/actions/blog-posts'

export const dynamic = 'force-dynamic'
import { BlogView } from '@/components/admin/views/BlogView'

type Params = Promise<{ locale: string }>

export default async function BlogPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const posts = await getBlogPosts()
  return <BlogView initialPosts={posts} />
}
