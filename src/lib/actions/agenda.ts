'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AgendaEntry, AgendaEntryWithRefs, UserAgendaSummary, ProjectBankSummary } from '@/types'

const REVALIDATE = '/dashboard/admin/agenda'

export async function createAgendaEntry(payload: {
  user_id: string
  client_id?: string | null
  project_id?: string | null
  kanban_card_id?: string | null
  date: string
  start_time?: string | null
  minutes: number
  description?: string | null
}): Promise<AgendaEntry> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('agenda_entries')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(REVALIDATE)
  return data
}

export async function updateAgendaEntry(
  id: string,
  payload: Partial<{
    client_id: string | null
    project_id: string | null
    kanban_card_id: string | null
    date: string
    start_time: string | null
    minutes: number
    description: string | null
  }>
): Promise<AgendaEntry> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('agenda_entries')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath(REVALIDATE)
  return data
}

export async function deleteAgendaEntry(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('agenda_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(REVALIDATE)
}

// Entradas de um usuário em um dia específico (para o painel lateral)
export async function getEntriesForDay(userId: string, date: string): Promise<AgendaEntryWithRefs[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('agenda_entries')
    .select(`
      *,
      client:clients(id, trade_name, logo_url),
      project:projects(id, name, acronym),
      kanban_card:kanban_cards(id, name, card_number)
    `)
    .eq('user_id', userId)
    .eq('date', date)
    .order('start_time', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as AgendaEntryWithRefs[]
}

// Entradas de um usuário em um mês (para o calendário mensal)
export async function getEntriesForMonth(userId: string, year: number, month: number): Promise<AgendaEntryWithRefs[]> {
  const supabase = createAdminClient()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10) // last day of month
  const { data, error } = await supabase
    .from('agenda_entries')
    .select(`
      *,
      client:clients(id, trade_name, logo_url),
      project:projects(id, name, acronym),
      kanban_card:kanban_cards(id, name, card_number)
    `)
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as AgendaEntryWithRefs[]
}

// Entradas de um projeto em um mês (para modal de detalhe)
export async function getEntriesForProject(projectId: string, year: number, month: number): Promise<AgendaEntryWithRefs[]> {
  const supabase = createAdminClient()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('agenda_entries')
    .select(`
      *,
      client:clients(id, trade_name, logo_url),
      project:projects(id, name, acronym),
      kanban_card:kanban_cards(id, name, card_number)
    `)
    .eq('project_id', projectId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as AgendaEntryWithRefs[]
}

// Resumo de horas por usuário admin no mês (para a view principal)
export async function getMonthlyUserSummary(year: number, month: number): Promise<UserAgendaSummary[]> {
  const supabase = createAdminClient()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  // Busca todos os admins
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'admin')
    .order('name', { ascending: true })
  if (usersError) throw new Error(usersError.message)

  // Busca todas as entradas do mês
  const { data: entries, error: entriesError } = await supabase
    .from('agenda_entries')
    .select('user_id, minutes')
    .gte('date', start)
    .lte('date', end)
  if (entriesError) throw new Error(entriesError.message)

  // Agrupa minutos por user_id (auth UUID)
  const minutesByUser = (entries ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.user_id] = (acc[e.user_id] ?? 0) + e.minutes
    return acc
  }, {})

  return (users ?? []).map(u => ({
    user: u,
    total_minutes: minutesByUser[u.user_id] ?? 0,
  }))
}

// Resumo de horas por projeto com banco de horas no mês (para a view principal)
export async function getMonthlyProjectBankSummary(year: number, month: number): Promise<ProjectBankSummary[]> {
  const supabase = createAdminClient()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)

  // Projetos cujo tipo tem banco de horas mensal
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, trade_name, cnpj, company_name, logo_url, created_at, updated_at),
      project_type:project_types(id, name, is_internal, is_recurring, one_time_value, recurring_value, monthly_hours, has_monthly_bank, created_at, updated_at)
    `)
    .order('name', { ascending: true })
  if (projError) throw new Error(projError.message)

  const bankProjects = (projects ?? []).filter(
    p => (p.project_type as { has_monthly_bank?: boolean } | null)?.has_monthly_bank === true
  )

  if (bankProjects.length === 0) return []

  // Entradas do mês agrupadas por projeto
  const { data: entries, error: entriesError } = await supabase
    .from('agenda_entries')
    .select('project_id, minutes')
    .in('project_id', bankProjects.map(p => p.id))
    .gte('date', start)
    .lte('date', end)
  if (entriesError) throw new Error(entriesError.message)

  const minutesByProject = (entries ?? []).reduce<Record<string, number>>((acc, e) => {
    if (e.project_id) acc[e.project_id] = (acc[e.project_id] ?? 0) + e.minutes
    return acc
  }, {})

  return bankProjects.map(p => ({
    project: p as unknown as import('@/types').ProjectWithRefs,
    used_minutes: minutesByProject[p.id] ?? 0,
    available_hours: (p.project_type as { monthly_hours?: number | null } | null)?.monthly_hours ?? null,
  }))
}

// Todas as entradas de um usuário num mês (para modal de detalhe da view principal)
export async function getEntriesForUserMonth(userId: string, year: number, month: number): Promise<AgendaEntryWithRefs[]> {
  return getEntriesForMonth(userId, year, month)
}

// Todos os cards de um projeto (para seletor de atividades na agenda)
export async function getCardsForProject(
  projectId: string
): Promise<import('@/types').KanbanCardWithProject[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .select(`
      *,
      project:projects(
        *,
        client:clients(*),
        project_type:project_types(*)
      ),
      assignee:users(id, name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('card_number', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as import('@/types').KanbanCardWithProject[]
}

// Cards disponíveis para registrar horas: filtrados por cliente e sem nenhum registro ainda
export async function getAvailableCardsForClient(
  clientId: string
): Promise<import('@/types').KanbanCardWithProject[]> {
  const supabase = createAdminClient()

  // IDs de cards que já têm ao menos um registro de horas
  const { data: usedRows } = await supabase
    .from('agenda_entries')
    .select('kanban_card_id')
    .not('kanban_card_id', 'is', null)

  const usedIds = [...new Set((usedRows ?? []).map(r => r.kanban_card_id as string).filter(Boolean))]

  // Cards cujo projeto pertence ao cliente selecionado
  let query = supabase
    .from('kanban_cards')
    .select(`
      *,
      project:projects!inner(
        id, name, acronym, client_id, is_internal, service_value, project_type_id, created_at, updated_at,
        client:clients(id, trade_name, cnpj, company_name, logo_url, created_at, updated_at),
        project_type:project_types(id, name, is_internal, is_recurring, one_time_value, recurring_value, monthly_hours, has_monthly_bank, created_at, updated_at)
      ),
      assignee:users(id, name, avatar_url)
    `)
    .eq('projects.client_id', clientId)
    .order('card_number', { ascending: false })

  if (usedIds.length > 0) {
    query = query.not('id', 'in', `(${usedIds.join(',')})`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as import('@/types').KanbanCardWithProject[]
}
