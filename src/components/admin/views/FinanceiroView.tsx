'use client'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { StatCard } from '@/components/admin/ui/StatCard'
import { Avatar } from '@/components/admin/ui/Avatar'

interface ClientRow {
  name: string
  projects: { acronym: string; recurring: boolean; value: number }[]
  mrr: number
  oneTime: number
}
interface TypeSlice { name: string; value: number }

interface Props {
  mrr: number
  arr: number
  oneTime: number
  ticket: number
  clients: ClientRow[]
  types: TypeSlice[]
  noValueCount: number
}

const DONUT_COLORS = ['#1F6F6B', '#E8A93C', '#123B4F', '#2f9d8f', '#8fb7c9', '#b48ead']

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function Donut({ types }: { types: TypeSlice[] }) {
  const total = types.reduce((s, t) => s + t.value, 0)
  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
        Sem receita recorrente por tipo.
      </p>
    )
  }
  const radius = 15.915 // circumference = 100
  // offset acumulado (começa em 25 = topo), calculado sem mutação durante o render
  const segments = types.map((t, i) => {
    const pct = (t.value / total) * 100
    const prior = types.slice(0, i).reduce((s, x) => s + (x.value / total) * 100, 0)
    return {
      ...t,
      pct,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      dash: pct,
      offset: 25 - prior,
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 42 42" className="h-40 w-40" role="img" aria-label="MRR por tipo">
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="var(--background-tertiary)" strokeWidth="5" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="21"
            cy="21"
            r={radius}
            fill="transparent"
            stroke={s.color}
            strokeWidth="5"
            strokeDasharray={`${s.dash} ${100 - s.dash}`}
            strokeDashoffset={s.offset}
          />
        ))}
        <text x="21" y="20.5" textAnchor="middle" style={{ fontSize: '3.2px', fontWeight: 700, fill: 'var(--color-deep)' }}>
          MRR
        </text>
        <text x="21" y="24.5" textAnchor="middle" style={{ fontSize: '2.6px', fill: 'var(--foreground-muted)' }}>
          {types.length} tipo(s)
        </text>
      </svg>
      <ul className="flex w-full flex-col gap-1.5">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--foreground)' }}>{s.name}</span>
            <span className="tabular-nums font-semibold" style={{ color: 'var(--foreground-muted)' }}>{brl(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FinanceiroView({ mrr, arr, oneTime, ticket, clients, types, noValueCount }: Props) {
  return (
    <div>
      <AdminPageHeader title="Financeiro" subtitle="Receita recorrente e pontual da agência" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="MRR" value={brl(mrr)} accent="brand" hint="receita mensal recorrente" />
        <StatCard label="ARR (projeção)" value={brl(arr)} accent="deep" hint="MRR × 12" />
        <StatCard label="Receita pontual" value={brl(oneTime)} accent="accent" hint="contratada (one-time)" />
        <StatCard label="Ticket médio mensal" value={brl(ticket)} accent="brand" hint="por cliente recorrente" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Receita por cliente */}
        <div className="lg:col-span-2">
          <AdminCard padding="0">
            <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--card-border)' }}>
              <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--foreground)' }}>
                Receita por cliente
              </h2>
            </div>
            {clients.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
                Nenhum projeto faturável cadastrado.
              </p>
            ) : (
              <ul>
                {clients.map((c, idx) => (
                  <li
                    key={c.name + idx}
                    className="flex items-center gap-3 px-5 py-3"
                    style={{ borderBottom: idx < clients.length - 1 ? '1px solid var(--card-border)' : undefined }}
                  >
                    <Avatar name={c.name} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.projects.map((p, i) => (
                          <span
                            key={i}
                            className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider"
                            style={{
                              fontFamily: 'var(--font-title)',
                              background: p.recurring ? 'rgba(31,111,107,0.10)' : 'rgba(232,169,60,0.14)',
                              color: p.recurring ? 'var(--color-brand)' : 'var(--color-accent-dark)',
                            }}
                          >
                            {p.acronym}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {c.mrr > 0 && (
                        <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-brand)' }}>
                          {brl(c.mrr)}<span className="text-[0.65rem] font-normal">/mês</span>
                        </p>
                      )}
                      {c.oneTime > 0 && (
                        <p className="text-xs tabular-nums" style={{ color: 'var(--foreground-muted)' }}>
                          {brl(c.oneTime)} pontual
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>

        {/* Donut + alerta */}
        <div className="flex flex-col gap-4">
          <AdminCard padding="1.35rem">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--foreground)' }}>
              MRR por tipo de projeto
            </h2>
            <Donut types={types} />
          </AdminCard>

          {noValueCount > 0 && (
            <AdminCard padding="1rem 1.2rem" style={{ background: 'rgba(232,169,60,0.10)', border: '1px solid rgba(232,169,60,0.35)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-dark)' }}>
                {noValueCount} projeto(s) sem valor definido
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Defina o valor do serviço ou do tipo de projeto para refletir na receita.
              </p>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  )
}
