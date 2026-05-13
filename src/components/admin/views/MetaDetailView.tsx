'use client'

import { useState, useTransition } from 'react'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createGoalActivity, toggleGoalActivity, deleteGoalActivity } from '@/lib/actions/goals'
import type { GoalWithActivities, GoalActivity } from '@/types'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: 'var(--color-lime)', boxShadow: '0 0 10px rgba(57,255,20,0.4)' }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}

function ActivityItem({
  activity,
  onToggle,
  onDelete,
}: {
  activity: GoalActivity
  onToggle: (id: string, v: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}
    >
      <button
        onClick={() => onToggle(activity.id, !activity.is_completed)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
        style={{
          borderColor: activity.is_completed ? 'var(--color-lime)' : 'rgba(255,255,255,0.2)',
          background: activity.is_completed ? 'rgba(57,255,20,0.15)' : 'transparent',
        }}
      >
        {activity.is_completed && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-lime)' }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm transition-all"
        style={{
          color: activity.is_completed ? 'var(--foreground-muted)' : 'var(--foreground)',
          textDecoration: activity.is_completed ? 'line-through' : 'none',
          opacity: activity.is_completed ? 0.6 : 1,
        }}
      >
        {activity.title}
      </span>

      <button
        onClick={() => onDelete(activity.id)}
        className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100"
        style={{ color: 'rgba(255,59,48,0.7)', background: 'rgba(255,59,48,0.08)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  )
}

interface Props {
  goal: GoalWithActivities
}

export function MetaDetailView({ goal: initialGoal }: Props) {
  const [activities, setActivities] = useState<GoalActivity[]>(initialGoal.activities)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const total = activities.length
  const completed = activities.filter(a => a.is_completed).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function handleToggle(id: string, value: boolean) {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, is_completed: value } : a))
    startTransition(() => toggleGoalActivity(id, value))
  }

  function handleDelete(id: string) {
    setActivities(prev => prev.filter(a => a.id !== id))
    startTransition(() => deleteGoalActivity(id))
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle('')
    startTransition(async () => {
      const activity = await createGoalActivity(initialGoal.id, title)
      setActivities(prev => [...prev, activity])
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/admin/metas"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--foreground-muted)', border: '1px solid var(--card-border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{initialGoal.name}</h1>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            {initialGoal.objective}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--glass-background)', border: '1px solid var(--glass-border)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Progresso geral</span>
          <span className="text-sm font-semibold" style={{ color: pct === 100 ? 'var(--color-lime)' : 'var(--foreground-muted)' }}>
            {pct}%
          </span>
        </div>
        <ProgressBar value={pct} />
        <p className="mt-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
          {total === 0 ? 'Sem atividades cadastradas' : `${completed} de ${total} atividades concluídas`}
        </p>
      </div>

      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--glass-background)', border: '1px solid var(--glass-border)' }}
      >
        <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Atividades</h2>

        <div className="flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
              <p className="py-4 text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Nenhuma atividade ainda. Adicione a primeira abaixo.
              </p>
            ) : (
              activities.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleAdd} className="mt-4 flex items-center gap-2">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Nova atividade..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-lime)]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
          />
          <button
            type="submit"
            disabled={isPending || !newTitle.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-40"
            style={{ background: 'var(--color-lime)', color: '#000' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
