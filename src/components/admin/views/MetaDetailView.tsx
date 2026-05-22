'use client'

import { useState, useTransition, useMemo, useRef, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createGoalActivity, toggleGoalActivity, deleteGoalActivity } from '@/lib/actions/goals'
import type { GoalWithActivities, GoalActivity, GoalActivityWithChildren } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTree(flat: GoalActivity[], parentId: string | null = null): GoalActivityWithChildren[] {
  return flat
    .filter(a => (a.parent_id ?? null) === parentId)
    .sort((a, b) => a.position - b.position)
    .map(a => ({ ...a, children: buildTree(flat, a.id) }))
}

function countAll(activities: GoalActivityWithChildren[]): { total: number; completed: number } {
  return activities.reduce((acc, a) => {
    const sub = countAll(a.children)
    return {
      total: acc.total + 1 + sub.total,
      completed: acc.completed + (a.is_completed ? 1 : 0) + sub.completed,
    }
  }, { total: 0, completed: 0 })
}

function collectIds(activity: GoalActivityWithChildren): string[] {
  return [activity.id, ...activity.children.flatMap(collectIds)]
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

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

// ─── Inline add form ──────────────────────────────────────────────────────────

function InlineAddForm({
  placeholder,
  onSubmit,
  onCancel,
}: {
  placeholder: string
  onSubmit: (title: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onSubmit(t)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && onCancel()}
        placeholder={placeholder}
        className="flex-1 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(57,255,20,0.3)',
          color: 'var(--foreground)',
        }}
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-30"
        style={{ background: 'var(--color-lime)', color: '#000' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all"
        style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.06)' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </form>
  )
}

// ─── Activity item (recursive) ────────────────────────────────────────────────

function ActivityItem({
  activity,
  goalId,
  depth,
  onToggle,
  onDelete,
  onAddChild,
}: {
  activity: GoalActivityWithChildren
  goalId: string
  depth: number
  onToggle: (id: string, v: boolean) => void
  onDelete: (id: string, descendantIds: string[]) => void
  onAddChild: (title: string, parentId: string) => void
}) {
  const [addingChild, setAddingChild] = useState(false)

  const descendantIds = activity.children.flatMap(collectIds)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Row */}
      <div
        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.02]"
        style={{ marginBottom: '2px' }}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(activity.id, !activity.is_completed)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
          style={{
            borderColor: activity.is_completed ? 'var(--color-lime)' : 'rgba(255,255,255,0.2)',
            background: activity.is_completed ? 'rgba(57,255,20,0.15)' : 'transparent',
          }}
        >
          {activity.is_completed && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-lime)' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className="flex-1 text-sm leading-snug"
          style={{
            color: activity.is_completed ? 'var(--foreground-muted)' : 'var(--foreground)',
            textDecoration: activity.is_completed ? 'line-through' : 'none',
            opacity: activity.is_completed ? 0.55 : 1,
          }}
        >
          {activity.title}
        </span>

        {/* Actions (on hover) */}
        <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
          <button
            onClick={() => setAddingChild(v => !v)}
            title="Adicionar sub-atividade"
            className="flex h-5 w-5 items-center justify-center rounded transition-colors"
            style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(activity.id, descendantIds)}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors"
            style={{ color: 'rgba(255,59,48,0.7)', background: 'rgba(255,59,48,0.08)' }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub-activities (children + inline add form) */}
      {(activity.children.length > 0 || addingChild) && (
        <div
          style={{
            marginLeft: `${Math.min(depth + 1, 6) * 20}px`,
            paddingLeft: '12px',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            marginBottom: '4px',
          }}
        >
          <AnimatePresence mode="popLayout">
            {activity.children.map(child => (
              <ActivityItem
                key={child.id}
                activity={child}
                goalId={goalId}
                depth={depth + 1}
                onToggle={onToggle}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </AnimatePresence>

          {addingChild && (
            <div className="py-1">
              <InlineAddForm
                placeholder="Nova sub-atividade..."
                onSubmit={title => {
                  onAddChild(title, activity.id)
                  setAddingChild(false)
                }}
                onCancel={() => setAddingChild(false)}
              />
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

interface Props {
  goal: GoalWithActivities
}

export function MetaDetailView({ goal: initialGoal }: Props) {
  const [flat, setFlat] = useState<GoalActivity[]>(initialGoal.activities)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const tree = useMemo(() => buildTree(flat), [flat])
  const { total, completed } = useMemo(() => countAll(tree), [tree])
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function handleToggle(id: string, value: boolean) {
    setFlat(prev => prev.map(a => a.id === id ? { ...a, is_completed: value } : a))
    startTransition(() => toggleGoalActivity(id, value))
  }

  function handleDelete(id: string, descendantIds: string[]) {
    const remove = new Set([id, ...descendantIds])
    setFlat(prev => prev.filter(a => !remove.has(a.id)))
    startTransition(() => deleteGoalActivity(id))
  }

  function handleAddChild(title: string, parentId: string) {
    startTransition(async () => {
      const activity = await createGoalActivity(initialGoal.id, title, parentId)
      setFlat(prev => [...prev, activity])
    })
  }

  function handleAddTop(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle('')
    startTransition(async () => {
      const activity = await createGoalActivity(initialGoal.id, title, null)
      setFlat(prev => [...prev, activity])
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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

      {/* Progress */}
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

      {/* Activities */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--glass-background)', border: '1px solid var(--glass-border)' }}
      >
        <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Atividades</h2>

        <div className="mb-2">
          <AnimatePresence mode="popLayout">
            {tree.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center text-sm"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Nenhuma atividade ainda. Adicione a primeira abaixo.
              </motion.p>
            ) : (
              tree.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  goalId={initialGoal.id}
                  depth={0}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add top-level activity */}
        <form onSubmit={handleAddTop} className="mt-3 flex items-center gap-2">
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
