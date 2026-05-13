'use client'

import { useState, useTransition } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createGoal, deleteGoal } from '@/lib/actions/goals'
import type { GoalWithProgress } from '@/types'
import { cn } from '@/lib/utils'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: 'var(--color-lime)', boxShadow: '0 0 8px rgba(57,255,20,0.4)' }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

function GoalCard({ goal, onDelete }: { goal: GoalWithProgress; onDelete: (id: string) => void }) {
  const router = useRouter()
  const pct = goal.total > 0 ? Math.round((goal.completed / goal.total) * 100) : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative flex flex-col gap-3 rounded-xl p-5 cursor-pointer transition-all"
      style={{
        background: 'var(--glass-background)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={() => router.push(`/dashboard/admin/metas/${goal.id}` as any)}
    >
      <button
        onClick={e => { e.stopPropagation(); onDelete(goal.id) }}
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100"
        style={{ color: 'var(--foreground-muted)', background: 'rgba(255,59,48,0.1)' }}
        title="Excluir meta"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
        </svg>
      </button>

      <div>
        <h3 className="mb-1 text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>
          {goal.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
          {goal.objective}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <ProgressBar value={pct} />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            {goal.total === 0 ? 'Sem atividades' : `${goal.completed} de ${goal.total} concluídas`}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: pct === 100 ? 'var(--color-lime)' : 'var(--foreground-muted)' }}
          >
            {pct}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

interface Props {
  initialGoals: GoalWithProgress[]
}

export function MetasView({ initialGoals }: Props) {
  const [goals, setGoals] = useState(initialGoals)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !objective.trim()) return
    startTransition(async () => {
      const goal = await createGoal(name.trim(), objective.trim())
      setGoals(prev => [{ ...goal, total: 0, completed: 0 }, ...prev])
      setName('')
      setObjective('')
      setShowForm(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteGoal(id)
      setGoals(prev => prev.filter(g => g.id !== id))
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Metas</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Objetivos estratégicos da BlackElephant
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all"
          style={{ background: 'var(--color-lime)', color: '#000' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Meta
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
            onSubmit={handleCreate}
          >
            <div
              className="flex flex-col gap-4 rounded-xl p-5"
              style={{ background: 'var(--glass-background)', border: '1px solid rgba(57,255,20,0.2)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Nova Meta</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Nome</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Aumentar receita recorrente"
                    className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-lime)]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Objetivo principal</label>
                  <textarea
                    value={objective}
                    onChange={e => setObjective(e.target.value)}
                    placeholder="Descreva o objetivo principal desta meta..."
                    rows={3}
                    className="resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-lime)]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'var(--color-lime)', color: '#000' }}
                >
                  {isPending ? 'Criando...' : 'Criar Meta'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setName(''); setObjective('') }}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                  style={{ color: 'var(--foreground-muted)', border: '1px solid var(--card-border)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl py-16 text-center"
          style={{ background: 'var(--glass-background)', border: '1px solid var(--glass-border)' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--foreground-muted)', marginBottom: 12 }}>
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Nenhuma meta criada ainda</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)', opacity: 0.6 }}>
            Crie sua primeira meta para acompanhar o progresso
          </p>
        </div>
      ) : (
        <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
          <AnimatePresence mode="popLayout">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
