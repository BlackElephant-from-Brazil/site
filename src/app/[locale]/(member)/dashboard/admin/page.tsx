import { setRequestLocale } from 'next-intl/server'
import { ConstructionPage } from '@/components/admin/ConstructionPage'

type Params = Promise<{ locale: string }>

export default async function AdminDashboardPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ConstructionPage title="Dashboard" subtitle="Visão geral do sistema" />
}
