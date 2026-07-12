import { setRequestLocale } from 'next-intl/server'
import { getPortfolioItems } from '@/lib/actions/portfolio'
import { getProjectTypes } from '@/lib/actions/project-types'

export const dynamic = 'force-dynamic'
import { PortfolioView } from '@/components/admin/views/PortfolioView'

type Params = Promise<{ locale: string }>

export default async function PortfolioPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [items, projectTypes] = await Promise.all([getPortfolioItems(), getProjectTypes()])
  return <PortfolioView initialItems={items} projectTypes={projectTypes} />
}
