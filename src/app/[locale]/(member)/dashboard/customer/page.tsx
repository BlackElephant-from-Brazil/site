import { setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/supabase/queries/users'
import {
  getCustomerProjectDashboard,
  type CustomerProjectDashboard,
  type CustomerProjectActivity,
} from '@/lib/supabase/queries/customer-dashboard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function CustomerDashboardPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const user = await getCurrentUser()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const projects = user?.client_id
    ? await getCustomerProjectDashboard(user.client_id, year, month)
    : []
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now)

  return (
    <div className="flex flex-col gap-8 py-8">
      <section className="flex flex-col gap-2">
        <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
          Olá, <span style={{ color: 'var(--primary)' }}>{user?.name}</span>.
        </p>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Acompanhe seus projetos, atividades em desenvolvimento e consumo de suporte mensal.
        </p>
      </section>

      {!user?.client_id ? (
        <EmptyState message="Seu usuário ainda não está vinculado a uma empresa." />
      ) : projects.length === 0 ? (
        <EmptyState message="Nenhum projeto cadastrado para sua empresa ainda." />
      ) : (
        <section className="flex flex-col gap-5">
          {projects.map(project => (
            <ProjectActivityList key={project.id} project={project} monthLabel={monthLabel} />
          ))}
        </section>
      )}
    </div>
  )
}

function ProjectActivityList({
  project,
  monthLabel,
}: {
  project: CustomerProjectDashboard
  monthLabel: string
}) {
  const usedLabel = formatMinutes(project.usedMinutes)
  const supportLabel = project.hasMonthlyBank
    ? `${formatHours(project.monthlyHours)} contratadas`
    : 'Sem suporte mensal contratado'
  const statusSegments = buildStatusSegments(project.activities)
  const hoursUsage = buildHoursUsage(project)

  return (
    <article
      className="rounded-xl border"
      style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}
    >
      <header
        className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between"
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}
          >
            {project.name}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
            {project.acronym}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Metric label="Suporte mensal" value={supportLabel} muted={!project.hasMonthlyBank} />
          <Metric label={`Horas usadas em ${monthLabel}`} value={usedLabel} />
        </div>
      </header>

      <ProjectCharts
        statusSegments={statusSegments}
        totalActivities={project.activities.length}
        hoursUsage={hoursUsage}
      />

      {project.activities.length === 0 ? (
        <p className="px-5 py-5 text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhuma atividade cadastrada para este projeto.
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
          {project.activities.map(activity => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </ul>
      )}
    </article>
  )
}

function ProjectCharts({
  statusSegments,
  totalActivities,
  hoursUsage,
}: {
  statusSegments: StatusSegment[]
  totalActivities: number
  hoursUsage: HoursUsage
}) {
  return (
    <section
      className="grid gap-3 border-b px-5 py-4 lg:grid-cols-2"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <ChartPanel title="Status das atividades">
        <StatusPieChart segments={statusSegments} totalActivities={totalActivities} />
      </ChartPanel>
      <ChartPanel title="Uso do suporte mensal">
        <HoursProgressChart usage={hoursUsage} />
      </ChartPanel>
    </section>
  )
}

function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,0.025)' }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--foreground-muted)' }}
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function StatusPieChart({
  segments,
  totalActivities,
}: {
  segments: StatusSegment[]
  totalActivities: number
}) {
  if (totalActivities === 0) {
    return <ChartEmptyState message="Nenhuma atividade para calcular status." />
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 42 42" className="h-28 w-28 -rotate-90" aria-hidden="true">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          {segments.map(segment => (
            <circle
              key={segment.status}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="6"
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            {totalActivities}
          </span>
          <span
            className="whitespace-nowrap text-[0.58rem] uppercase leading-none"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {formatActivityCountLabel(totalActivities)}
          </span>
        </div>
      </div>

      <ul className="grid min-w-0 flex-1 gap-2">
        {segments.map(segment => (
          <li key={segment.status}>
            <Tooltip
              content={`${segment.status}: ${segment.count} ${formatActivityCountLabel(segment.count)}, ${formatNumber(segment.percentage)}%`}
            >
              <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-white/[0.03]">
                <span className="flex min-w-0 items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segment.color }} />
                  <span className="truncate">{segment.status}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                  {segment.count} - {formatNumber(segment.percentage)}%
                </span>
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HoursProgressChart({ usage }: { usage: HoursUsage }) {
  if (!usage.hasBank) {
    return <ChartEmptyState message="Sem suporte mensal contratado." />
  }

  const tooltip = [
    `${formatMinutes(usage.usedMinutes)} usadas`,
    `${formatMinutes(usage.contractedMinutes)} contratadas`,
    `${formatMinutes(usage.remainingMinutes)} disponíveis`,
    usage.overageMinutes > 0 ? `${formatMinutes(usage.overageMinutes)} excedentes` : null,
  ].filter(Boolean).join(' | ')

  return (
    <Tooltip content={tooltip}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {formatNumber(usage.usagePercent)}%
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              do banco mensal utilizado
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <p>
              <span style={{ color: 'var(--foreground)' }}>{formatMinutes(usage.remainingMinutes)}</span> disponíveis
            </p>
            {usage.overageMinutes > 0 && (
              <p style={{ color: '#fb7185' }}>{formatMinutes(usage.overageMinutes)} excedentes</p>
            )}
          </div>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full border"
          role="progressbar"
          aria-valuenow={Math.round(usage.usagePercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={tooltip}
          style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${usage.usagePercent}%`,
              background: usage.overageMinutes > 0
                ? 'linear-gradient(90deg, #39FF14 0%, #fb7185 100%)'
                : 'linear-gradient(90deg, #39FF14 0%, #7dd3fc 100%)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--foreground-muted)' }}>
          <span>{formatMinutes(usage.usedMinutes)} usadas</span>
          <span>{formatMinutes(usage.contractedMinutes)} contratadas</span>
        </div>
      </div>
    </Tooltip>
  )
}

function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <div className="group relative">
      <div
        tabIndex={0}
        aria-label={content}
        className="rounded-md outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF14]"
      >
        {children}
      </div>
      <div
        role="tooltip"
        className="pointer-events-none absolute inset-x-0 top-full z-[400] mx-auto mt-2 w-64 max-w-[min(16rem,calc(100vw-2rem))] whitespace-normal break-words rounded-md border px-2.5 py-1.5 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          borderColor: 'var(--card-border)',
          background: 'rgba(10,10,10,0.96)',
          color: 'var(--foreground-muted)',
        }}
      >
        {content}
      </div>
    </div>
  )
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-28 items-center justify-center rounded-md border border-dashed px-4 py-6 text-center text-sm"
      style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
    >
      {message}
    </div>
  )
}

function ActivityRow({ activity }: { activity: CustomerProjectActivity }) {
  return (
    <li
      className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-xs font-bold tracking-widest"
            style={{
              background: 'rgba(57,255,20,0.1)',
              color: 'var(--primary)',
              fontFamily: 'var(--font-title)',
            }}
          >
            {activity.code}
          </span>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {activity.name}
          </p>
        </div>
        {activity.description && (
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            {activity.description}
          </p>
        )}
      </div>
      <span
        className="w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold"
        style={{
          borderColor: 'rgba(57,255,20,0.25)',
          color: 'var(--primary)',
          background: 'rgba(57,255,20,0.08)',
        }}
      >
        {activity.status}
      </span>
    </li>
  )
}

function Metric({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div
      className="min-w-44 rounded-lg border px-3 py-2"
      style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[0.68rem] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold" style={{ color: muted ? 'var(--foreground-muted)' : 'var(--foreground)' }}>
        {value}
      </p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border px-5 py-6 text-sm"
      style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
    >
      {message}
    </div>
  )
}

const STATUS_COLORS = [
  '#39FF14',
  '#7dd3fc',
  '#facc15',
  '#fb7185',
  '#a78bfa',
  '#f97316',
]

interface StatusSegment {
  status: string
  count: number
  percentage: number
  color: string
  dashArray: string
  dashOffset: number
}

interface HoursUsage {
  hasBank: boolean
  contractedMinutes: number
  usedMinutes: number
  remainingMinutes: number
  overageMinutes: number
  usagePercent: number
}

function buildStatusSegments(activities: CustomerProjectActivity[]): StatusSegment[] {
  const counts = activities.reduce<Record<string, number>>((acc, activity) => {
    acc[activity.status] = (acc[activity.status] ?? 0) + 1
    return acc
  }, {})

  const total = activities.length
  let offset = 0

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([status, count], index) => {
      const rawPercentage = total === 0 ? 0 : (count / total) * 100
      const percentage = Math.round(rawPercentage * 10) / 10
      const segment: StatusSegment = {
        status,
        count,
        percentage,
        color: STATUS_COLORS[index % STATUS_COLORS.length],
        dashArray: `${percentage} ${100 - percentage}`,
        dashOffset: -offset,
      }
      offset += percentage
      return segment
    })
}

function buildHoursUsage(project: CustomerProjectDashboard): HoursUsage {
  const monthlyHours = project.monthlyHours
  const hasBank = project.hasMonthlyBank && monthlyHours !== null
  const contractedMinutes = hasBank ? Math.max(monthlyHours * 60, 0) : 0
  const usedMinutes = project.usedMinutes
  const remainingMinutes = hasBank ? Math.max(contractedMinutes - usedMinutes, 0) : 0
  const overageMinutes = hasBank ? Math.max(usedMinutes - contractedMinutes, 0) : 0
  const usagePercent = hasBank && contractedMinutes > 0
    ? Math.min((usedMinutes / contractedMinutes) * 100, 100)
    : hasBank && usedMinutes > 0
      ? 100
      : 0

  return {
    hasBank,
    contractedMinutes,
    usedMinutes,
    remainingMinutes,
    overageMinutes,
    usagePercent,
  }
}

function formatMinutes(minutes: number) {
  const hours = minutes / 60
  return `${formatNumber(hours)}h`
}

function formatHours(hours: number | null) {
  if (hours === null) return 'Horas não definidas'
  return `${formatNumber(hours)}h`
}

function formatActivityCountLabel(count: number) {
  return count === 1 ? 'atividade' : 'atividades'
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)
}
