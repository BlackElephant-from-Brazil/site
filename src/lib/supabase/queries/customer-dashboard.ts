import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export interface CustomerProjectActivity {
  id: string
  code: string
  name: string
  description: string | null
  status: string
  statusPosition: number
  position: number
}

export interface CustomerProjectDashboard {
  id: string
  name: string
  acronym: string
  hasMonthlyBank: boolean
  monthlyHours: number | null
  usedMinutes: number
  activities: CustomerProjectActivity[]
}

interface ProjectRow {
  id: string
  name: string
  acronym: string
  project_type: {
    has_monthly_bank?: boolean | null
    monthly_hours?: number | null
  } | null
}

interface CardRow {
  id: string
  project_id: string | null
  name: string
  description: string | null
  card_number: number
  position: number
  column: {
    name: string
    position: number
  } | null
}

interface AgendaMinutesRow {
  project_id: string | null
  minutes: number
}

export async function getCustomerProjectDashboard(
  clientId: string,
  year: number,
  month: number
): Promise<CustomerProjectDashboard[]> {
  const supabase = createAdminClient()

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      acronym,
      project_type:project_types(has_monthly_bank, monthly_hours)
    `)
    .eq('client_id', clientId)
    .order('name', { ascending: true })

  if (projectsError) throw new Error(projectsError.message)

  const projectRows = (projects ?? []) as unknown as ProjectRow[]
  if (projectRows.length === 0) return []

  const projectIds = projectRows.map(project => project.id)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  const [{ data: cards, error: cardsError }, { data: entries, error: entriesError }] = await Promise.all([
    supabase
      .from('kanban_cards')
      .select(`
        id,
        project_id,
        name,
        description,
        card_number,
        position,
        column:kanban_columns(name, position)
      `)
      .in('project_id', projectIds)
      .order('position', { ascending: true }),
    supabase
      .from('agenda_entries')
      .select('project_id, minutes')
      .in('project_id', projectIds)
      .gte('date', start)
      .lte('date', end),
  ])

  if (cardsError) throw new Error(cardsError.message)
  if (entriesError) throw new Error(entriesError.message)

  const minutesByProject = ((entries ?? []) as AgendaMinutesRow[]).reduce<Record<string, number>>((acc, entry) => {
    if (entry.project_id) acc[entry.project_id] = (acc[entry.project_id] ?? 0) + entry.minutes
    return acc
  }, {})

  const activitiesByProject = ((cards ?? []) as unknown as CardRow[]).reduce<Record<string, CustomerProjectActivity[]>>(
    (acc, card) => {
      if (!card.project_id) return acc
      const statusPosition = card.column?.position ?? 0
      const activity: CustomerProjectActivity = {
        id: card.id,
        code: `${projectRows.find(project => project.id === card.project_id)?.acronym ?? '#'}${card.card_number}`,
        name: card.name,
        description: card.description,
        status: card.column?.name ?? 'Sem status',
        statusPosition,
        position: card.position,
      }

      acc[card.project_id] = [...(acc[card.project_id] ?? []), activity]
      return acc
    },
    {}
  )

  return projectRows.map(project => ({
    id: project.id,
    name: project.name,
    acronym: project.acronym,
    hasMonthlyBank: project.project_type?.has_monthly_bank === true,
    monthlyHours: project.project_type?.monthly_hours ?? null,
    usedMinutes: minutesByProject[project.id] ?? 0,
    activities: (activitiesByProject[project.id] ?? []).sort((a, b) => {
      if (a.statusPosition !== b.statusPosition) return a.statusPosition - b.statusPosition
      return a.position - b.position
    }),
  }))
}
