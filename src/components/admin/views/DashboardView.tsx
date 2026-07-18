'use client'

import { Link } from '@/i18n/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { StatCard } from '@/components/admin/ui/StatCard'
import type { AgendaEntryWithRefs, UserTodo, GoalWithProgress } from '@/types'

interface Props {
  userName: string
  today: string
  agendaToday: AgendaEntryWithRefs[]
  minutesToday: number
  pendingTodos: UserTodo[]
  boardCounts: { software: number; sites: number; landing: number }
  totalCards: number
  softwareColumns: { name: string; count: number }[]
  goalsAvg: number
  topGoals: GoalWithProgress[]
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatTime(t: string | null): string {
  if (!t) return '--:--'
  return t.slice(0, 5)
}

export function DashboardView(props: Props) {
  const {
    userName, today, agendaToday, minutesToday, pendingTodos,
    boardCounts, totalCards, softwareColumns, goalsAvg, topGoals,
  } = props

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const maxCol = Math.max(1, ...softwareColumns.map(c => c.count))

  return (
    <div className="flex flex-col gap-6">
      {/* Saudação */}
      <div>
        <h1
          className="text-[1.75rem] font-bold"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--color-deep)' }}
        >
          {greeting()}, {userName.split(' ')[0]}.
        </h1>
        <p className="mt-1 text-sm capitalize" style={{ color: 'var(--foreground-muted)' }}>
          {dateLabel}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Tarefas pendentes"
          value={pendingTodos.length}
          accent="accent"
          hint={pendingTodos.filter(t => t.due_date && t.due_date < today).length > 0
            ? `${pendingTodos.filter(t => t.due_date && t.due_date < today).length} atrasada(s)`
            : 'em dia'}
        />
        <StatCard label="Horas registradas hoje" value={formatMinutes(minutesToday)} accent="brand" />
        <StatCard
          label="Cards ativos"
          value={totalCards}
          accent="deep"
          hint={`${boardCounts.software} soft · ${boardCounts.sites} sites · ${boardCounts.landing} LP`}
        />
        <StatCard label="Progresso das metas" value={`${goalsAvg}%`} accent="brand" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Agenda de hoje */}
          <AdminCard padding="1.35rem">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--foreground)' }}>
                Agenda de hoje
              </h2>
              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                {formatMinutes(minutesToday)}
              </span>
            </div>
            {agendaToday.length === 0 ? (
              <p className="py-6 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
                Nenhum lançamento de horas hoje.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {agendaToday.map(entry => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}
                  >
                    <span
                      className="shrink-0 text-xs font-bold tabular-nums"
                      style={{ fontFamily: 'var(--font-title)', color: 'var(--color-brand)' }}
                    >
                      {formatTime(entry.start_time)}
                    </span>
                    {entry.project && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[0.65rem] font-bold tracking-wider"
                        style={{ background: 'rgba(31,111,107,0.10)', color: 'var(--color-brand)', fontFamily: 'var(--font-title)' }}
                      >
                        {entry.project.acronym}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--foreground)' }}>
                      {entry.description || entry.client?.trade_name || 'Sem descrição'}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums" style={{ color: 'var(--foreground-muted)' }}>
                      {formatMinutes(entry.minutes)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          {/* Kanban distribuição */}
          <AdminCard padding="1.35rem">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--foreground)' }}>
              Kanban — distribuição (software)
            </h2>
            {softwareColumns.length === 0 ? (
              <p className="py-4 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
                Nenhuma coluna configurada.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {softwareColumns.map(col => (
                  <li key={col.name} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      {col.name}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--background-tertiary)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(col.count / maxCol) * 100}%`, background: 'var(--color-brand)' }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                      {col.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-4">
          {/* Minhas tarefas */}
          <AdminCard padding="1.35rem">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--foreground)' }}>
              Minhas tarefas
            </h2>
            {pendingTodos.length === 0 ? (
              <p className="py-4 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
                Nenhuma tarefa pendente. 🎉
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pendingTodos.slice(0, 6).map(todo => {
                  const overdue = todo.due_date && todo.due_date < today
                  return (
                    <li key={todo.id} className="flex items-start gap-2.5">
                      <span
                        className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border"
                        style={{ borderColor: 'var(--card-border)' }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm" style={{ color: 'var(--foreground)' }}>{todo.title}</p>
                        {todo.due_date && (
                          <p className="text-[0.7rem]" style={{ color: overdue ? 'var(--color-error)' : 'var(--foreground-muted)' }}>
                            {new Date(todo.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </AdminCard>

          {/* Metas */}
          <AdminCard padding="1.35rem">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--foreground)' }}>
                Metas
              </h2>
              <Link href="/dashboard/admin/metas" className="text-xs font-semibold" style={{ color: 'var(--color-brand)' }}>
                ver todas
              </Link>
            </div>
            {topGoals.length === 0 ? (
              <p className="py-4 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
                Nenhuma meta com atividades.
              </p>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {topGoals.map(goal => {
                  const pct = Math.round((goal.completed / goal.total) * 100)
                  return (
                    <li key={goal.id}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-sm" style={{ color: 'var(--foreground)' }}>{goal.name}</span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground-muted)' }}>{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--background-tertiary)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--color-brand), var(--color-accent))' }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
