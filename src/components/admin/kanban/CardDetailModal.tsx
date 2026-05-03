'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { updateKanbanCard, deleteKanbanCard } from '@/lib/actions/kanban-cards'
import type { KanbanCardWithProject, User } from '@/types'

interface Props {
  card: KanbanCardWithProject | null
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
  onClose: () => void
  onUpdate: (card: KanbanCardWithProject) => void
  onDelete: (cardId: string) => void
}

export function CardDetailModal({ card, adminUsers, onClose, onUpdate, onDelete }: Props) {
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [assigneeId, setAssigneeId] = useState<string>('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const latestAssigneeRequest = useRef<string | null>(null)

  useEffect(() => {
    if (!card) return
    setName(card.name)
    setDescription(card.description ?? '')
    setAssigneeId(card.assignee_id ?? '')
    setEditingName(false)
  }, [card?.id])

  useEffect(() => {
    if (!card) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [card, onClose])

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  async function saveName() {
    if (!card || name.trim() === card.name) { setEditingName(false); return }
    if (!name.trim()) { setName(card.name); setEditingName(false); return }
    setSaving(true)
    try {
      const updated = await updateKanbanCard(card.id, { name: name.trim() })
      onUpdate({ ...card, ...updated })
    } finally {
      setSaving(false)
      setEditingName(false)
    }
  }

  async function saveDescription() {
    if (!card || description === (card.description ?? '')) return
    setSaving(true)
    try {
      const updated = await updateKanbanCard(card.id, { description: description || null })
      onUpdate({ ...card, ...updated })
    } finally {
      setSaving(false)
    }
  }

  async function saveAssignee(value: string) {
    if (!card) return
    const newAssigneeId = value || null
    if (newAssigneeId === card.assignee_id) return
    latestAssigneeRequest.current = value
    setSaving(true)
    try {
      const updated = await updateKanbanCard(card.id, { assignee_id: newAssigneeId })
      if (latestAssigneeRequest.current !== value) return
      const newAssignee = adminUsers.find(u => u.id === newAssigneeId) ?? null
      onUpdate({ ...card, ...updated, assignee: newAssignee })
    } catch {
      if (latestAssigneeRequest.current === value) {
        setAssigneeId(card.assignee_id ?? '')
      }
    } finally {
      if (latestAssigneeRequest.current === value) setSaving(false)
    }
  }

  async function handleDelete() {
    if (!card || !confirm('Excluir este card?')) return
    await deleteKanbanCard(card.id)
    onDelete(card.id)
    onClose()
  }

  const cardLabel = card?.project
    ? `${card.project.acronym}${card.card_number}`
    : `#${card?.card_number}`

  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
            style={{
              background: 'var(--background-secondary)',
              border: '1px solid var(--card-border)',
              maxHeight: '80vh',
            }}
          >
            {/* left 60% — description */}
            <div
              className="flex flex-1 flex-col gap-4 overflow-y-auto p-6"
              style={{ borderRight: '1px solid var(--card-border)' }}
            >
              {/* card name */}
              {editingName ? (
                <input
                  ref={nameInputRef}
                  className="w-full rounded-lg px-3 py-1.5 text-base font-semibold"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--primary)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-title)',
                    outline: 'none',
                  }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setName(card.name); setEditingName(false) } }}
                />
              ) : (
                <h3
                  className="cursor-pointer text-base font-semibold"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}
                  onClick={() => setEditingName(true)}
                  title="Clique para editar"
                >
                  {name}
                </h3>
              )}

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Descrição
                </p>
                <textarea
                  className="w-full resize-none rounded-lg p-3 text-sm"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                    outline: 'none',
                    minHeight: '160px',
                    fontFamily: 'var(--font-primary)',
                  }}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onBlur={saveDescription}
                  placeholder="Adicione uma descrição…"
                />
                {saving && <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>Salvando…</p>}
              </div>
            </div>

            {/* right 40% — metadata */}
            <div className="flex w-56 shrink-0 flex-col gap-5 p-6">
              {/* badge */}
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Identificador
                </p>
                <span
                  className="rounded px-2.5 py-1 text-sm font-bold tracking-widest"
                  style={{
                    background: 'rgba(57,255,20,0.1)',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-title)',
                  }}
                >
                  {cardLabel}
                </span>
              </div>

              {/* project */}
              {card.project && (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    Projeto
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{card.project.name}</p>
                  {card.project.client && (
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{card.project.client.trade_name}</p>
                  )}
                </div>
              )}

              {/* assignee */}
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Responsável
                </p>
                <select
                  className="w-full rounded-lg px-2 py-1.5 text-sm"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                    outline: 'none',
                  }}
                  value={assigneeId}
                  onChange={e => { setAssigneeId(e.target.value); saveAssignee(e.target.value) }}
                >
                  <option value="">— Sem responsável —</option>
                  {adminUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={handleDelete}
                  className="w-full rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
                  style={{ borderColor: 'rgba(255,77,79,0.4)', color: '#ff4d4f' }}
                >
                  Excluir card
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
                  style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
