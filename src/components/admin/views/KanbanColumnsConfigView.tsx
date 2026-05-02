'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import {
  createKanbanColumn,
  updateKanbanColumn,
  reorderKanbanColumns,
  deleteKanbanColumn,
} from '@/lib/actions/kanban-columns'
import type { KanbanColumn } from '@/types'

export function KanbanColumnsConfigView({ initialColumns }: { initialColumns: KanbanColumn[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [columns, setColumns] = useState(initialColumns)
  const [newName, setNewName] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  async function handleAddColumn() {
    if (!newName.trim()) return
    setSaving(true)
    setError('')
    try {
      const created = await createKanbanColumn(newName.trim())
      setColumns(prev => [...prev, created])
      setNewName('')
      setAddingNew(false)
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar coluna.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) { setEditingId(null); return }
    try {
      const updated = await updateKanbanColumn(id, editName.trim())
      setColumns(prev => prev.map(c => c.id === id ? updated : c))
      setEditingId(null)
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao renomear.')
    }
  }

  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index
  }

  async function handleDrop() {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) return
    const reordered = [...columns]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOverItem.current, 0, moved)
    setColumns(reordered)
    dragItem.current = null
    dragOverItem.current = null
    try {
      await reorderKanbanColumns(reordered.map(c => c.id))
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar.')
      setColumns(initialColumns)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta coluna?')) return
    setError('')
    try {
      await deleteKanbanColumn(id)
      setColumns(prev => prev.filter(c => c.id !== id))
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir.')
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--background)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--foreground)',
    outline: 'none',
    flex: 1,
  }

  return (
    <div>
      <AdminPageHeader
        title="Colunas do Kanban"
        subtitle="Configure as colunas do quadro de atividades"
        action={
          <button
            onClick={() => setAddingNew(true)}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: 'var(--primary)', color: '#000', boxShadow: '0 0 16px rgba(57,255,20,0.4)' }}
          >
            + Nova Coluna
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs" style={{ color: '#ff4d4f' }}>
          {error}
        </p>
      )}

      {addingNew && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}>
          <input
            autoFocus
            style={inputStyle}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setAddingNew(false) }}
            placeholder="Nome da coluna"
          />
          <button
            onClick={handleAddColumn}
            disabled={saving || !newName.trim()}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: 'var(--primary)', color: '#000' }}
          >
            {saving ? '…' : 'Criar'}
          </button>
          <button
            onClick={() => setAddingNew(false)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
          >
            Cancelar
          </button>
        </div>
      )}

      {columns.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhuma coluna criada ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {columns.map((col, index) => (
            <li
              key={col.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
              style={{
                borderColor: 'var(--card-border)',
                background: 'var(--background-secondary)',
                cursor: 'grab',
              }}
            >
              {/* drag handle */}
              <span style={{ color: 'var(--foreground-muted)', cursor: 'grab' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="9" y1="6" x2="15" y2="6" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="18" x2="15" y2="18" />
                </svg>
              </span>

              {editingId === col.id ? (
                <input
                  autoFocus
                  style={{ ...inputStyle, flex: 1 }}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename(col.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(col.id); if (e.key === 'Escape') setEditingId(null) }}
                />
              ) : (
                <span
                  className="flex-1 text-sm font-medium"
                  style={{ color: 'var(--foreground)' }}
                  onDoubleClick={() => { setEditingId(col.id); setEditName(col.name) }}
                  title="Duplo clique para renomear"
                >
                  {col.name}
                </span>
              )}

              <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>#{index + 1}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingId(col.id); setEditName(col.name) }}
                  className="rounded p-1.5 text-xs transition-colors"
                  style={{ color: 'var(--foreground-muted)' }}
                  title="Renomear"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(col.id)}
                  className="rounded p-1.5 text-xs transition-colors"
                  style={{ color: '#ff4d4f' }}
                  title="Excluir coluna"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
