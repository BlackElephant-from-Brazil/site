import { setRequestLocale } from 'next-intl/server'
import { getPricingPlans } from '@/lib/actions/pricing-plans'
import { getProjectTypes } from '@/lib/actions/project-types'

export const dynamic = 'force-dynamic'
import { PricingPlansView } from '@/components/admin/views/PricingPlansView'

type Params = Promise<{ locale: string }>

export default async function PlanosPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [plans, projectTypes] = await Promise.all([getPricingPlans(), getProjectTypes()])
  return <PricingPlansView initialPlans={plans} projectTypes={projectTypes} />
}
