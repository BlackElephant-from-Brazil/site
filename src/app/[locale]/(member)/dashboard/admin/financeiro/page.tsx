import { setRequestLocale } from 'next-intl/server'
import { getProjects } from '@/lib/actions/projects'
import type { ProjectWithRefs } from '@/types'

export const dynamic = 'force-dynamic'
import { FinanceiroView } from '@/components/admin/views/FinanceiroView'

type Params = Promise<{ locale: string }>

function effectiveValue(p: ProjectWithRefs): number {
  if (p.service_value != null) return p.service_value
  const t = p.project_type
  if (!t) return 0
  return (t.is_recurring ? t.recurring_value : t.one_time_value) ?? 0
}

export default async function FinanceiroPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const projects = (await getProjects()).filter(p => !p.is_internal)

  let mrr = 0
  let oneTime = 0
  const byClient = new Map<string, { name: string; projects: { acronym: string; recurring: boolean; value: number }[]; mrr: number; oneTime: number }>()
  const byType = new Map<string, number>()
  let noValueCount = 0

  for (const p of projects) {
    const value = effectiveValue(p)
    const recurring = p.project_type?.is_recurring === true
    if (value === 0) noValueCount++
    if (recurring) mrr += value
    else oneTime += value

    const clientKey = p.client?.id ?? '__none__'
    const clientName = p.client?.trade_name ?? 'Sem cliente'
    if (!byClient.has(clientKey)) byClient.set(clientKey, { name: clientName, projects: [], mrr: 0, oneTime: 0 })
    const bc = byClient.get(clientKey)!
    bc.projects.push({ acronym: p.acronym, recurring, value })
    if (recurring) bc.mrr += value
    else bc.oneTime += value

    if (recurring && value > 0) {
      const typeName = p.project_type?.name ?? 'Outros'
      byType.set(typeName, (byType.get(typeName) ?? 0) + value)
    }
  }

  const clientsWithRecurring = [...byClient.values()].filter(c => c.mrr > 0).length
  const ticket = clientsWithRecurring > 0 ? mrr / clientsWithRecurring : 0

  const clients = [...byClient.values()].sort((a, b) => b.mrr - a.mrr || b.oneTime - a.oneTime)
  const types = [...byType.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  return (
    <FinanceiroView
      mrr={mrr}
      arr={mrr * 12}
      oneTime={oneTime}
      ticket={ticket}
      clients={clients}
      types={types}
      noValueCount={noValueCount}
    />
  )
}
