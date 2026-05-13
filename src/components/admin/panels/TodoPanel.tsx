'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion } from 'framer-motion'
import { fetchUserTodos, createUserTodo, toggleUserTodo, deleteUserTodo } from '@/lib/actions/user-todos'
import type { UserTodo } from '@/types'

function formatDueDate(iso: string): { label: string; overdue: boolean } {
  const date = new Date(iso)
  const now = new Date()
  const overdue = date < now
  const label = date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  return { label, overdue }
}

function TodoItem({ todo, onToggle, onDelete }: { todo: UserTodo; onToggle: (id: string, v: boolean) => void; onDelete: (id: string) => void }) {
  const due = todo.due_date ? formatDueDate(todo.due_date) : null

  return (
    <div className="group flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
      <button
        onClick={() => onToggle(todo.id, !todo.is_completed)}
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all"
        style={{
          borderColor: todo.is_completed ? 'var(--color-lime)' : 'rgba(255,255,255,0.2)',
          background: todo.is_completed ? 'rgba(57,255,20,0.15)' : 'transparent',
        }}
      >
        {todo.is_completed && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-lime)' }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium leading-snug"
          style={{
            color: todo.is_completed ? 'var(--foreground-muted)' : 'var(--foreground)',
            textDecoration: todo.is_completed ? 'line-through' : 'none',
            opacity: todo.is_completed ? 0.6 : 1,
          }}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-0.5 text-[0.65rem] leading-snug" style={{ color: 'var(--foreground-muted)' }}>
            {todo.description}
          </p>
        )}
        {due && (
          <p
            className="mt-1 text-[0.6rem] font-medium"
            style={{ color: due.overdue && !todo.is_completed ? '#ff3b30' : 'var(--foreground-muted)' }}
          >
            {due.overdue && !todo.is_completed ? '⚠ ' : ''}{due.label}
          </p>
        )}
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100"
        style={{ color: 'rgba(255,59,48,0.7)', background: 'rgba(255,59,48,0.08)' }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

interface Props {
  userId: string
  onClose: () => void
}

export function TodoPanel({ userId, onClose }: Props) {
  const [todos, setTodos] = useState<UserTodo[]>([])
  const [loading, setLoading] = useState(true)
  const [showDone, setShowDone] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchUserTodos(userId).then(setTodos).finally(() => setLoading(false))
  }, [userId])

  const pending = todos.filter(t => !t.is_completed)
  const done = todos.filter(t => t.is_completed)

  function handleToggle(id: string, value: boolean) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: value, completed_at: value ? new Date().toISOString() : null } : t))
    startTransition(() => toggleUserTodo(id, value))
  }

  function handleDelete(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    startTransition(() => deleteUserTodo(id))
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      const dueDateISO = dueDate ? new Date(dueDate + '-03:00').toISOString() : undefined
      const todo = await createUserTodo(userId, title.trim(), description.trim() || undefined, dueDateISO)
      setTodos(prev => [todo, ...prev])
      setTitle('')
      setDescription('')
      setDueDate('')
      setShowForm(false)
    })
  }

  return (
    <div className="flex h-full flex-col" style={{ width: 320, borderLeft: '1px solid var(--card-border)', background: 'var(--nav-background)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-lime)' }}>
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Minhas Tarefas</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--color-lime)', background: 'rgba(57,255,20,0.1)' }}
            title="Nova tarefa"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showForm && (
          <form onSubmit={handleAdd} className="flex flex-col gap-2 p-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título da tarefa *"
              className="w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              required
              autoFocus
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={2}
              className="w-full resize-none rounded-md border px-2.5 py-1.5 text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)', colorScheme: 'dark' }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-md py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: 'var(--color-lime)', color: '#000' }}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md py-1.5 text-xs font-medium transition-all"
                style={{ border: '1px solid var(--card-border)', color: 'var(--foreground-muted)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10" style={{ borderTopColor: 'var(--color-lime)' }} />
          </div>
        ) : (
          <div className="p-3">
            {pending.length === 0 && !showForm ? (
              <p className="py-6 text-center text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Nenhuma tarefa pendente
              </p>
            ) : (
              <div className="flex flex-col">
                {pending.map(todo => (
                  <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {done.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowDone(v => !v)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
                  style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.03)' }}
                >
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showDone ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  Concluídas ({done.length})
                </button>
                {showDone && (
                  <div className="mt-1 flex flex-col">
                    {done.map(todo => (
                      <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
