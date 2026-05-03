'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { CardDetailModal } from '@/components/admin/kanban/CardDetailModal'
import { createKanbanCard, moveKanbanCard } from '@/lib/actions/kanban-cards'
import type { KanbanColumnWithCards, KanbanCardWithProject, Project, User } from '@/types'

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(p => p.length > 0)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface Props {
  initialBoard: KanbanColumnWithCards[]
  projects: Project[]
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
}

export function KanbanBoard({ initialBoard, projects, adminUsers }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [board, setBoard] = useState(initialBoard)
  const [selectedCard, setSelectedCard] = useState<KanbanCardWithProject | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newCardForm, setNewCardForm] = useState({ name: '', description: '', project_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // DnD state
  const dragCard = useRef<{ cardId: string; sourceColumnId: string; sourceIndex: number } | null>(null)

  const firstColumnId = board[0]?.id

  function handleDragStart(cardId: string, sourceColumnId: string, sourceIndex: number) {
    dragCard.current = { cardId, sourceColumnId, sourceIndex }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleDropOnColumn(targetColumnId: string) {
    const drag = dragCard.current
    if (!drag) return

    const sourceCol = board.find(c => c.id === drag.sourceColumnId)!
    const targetCol = board.find(c => c.id === targetColumnId)!
    const targetPosition = targetCol.cards.length

    // optimistic update
    const movingCard = sourceCol.cards.find(c => c.id === drag.cardId)!
    setBoard(prev => prev.map(col => {
      if (col.id === drag.sourceColumnId) {
        return { ...col, cards: col.cards.filter(c => c.id !== drag.cardId) }
      }
      if (col.id === targetColumnId) {
        return { ...col, cards: [...col.cards, { ...movingCard, column_id: targetColumnId }] }
      }
      return col
    }))

    dragCard.current = null

    try {
      await moveKanbanCard(drag.cardId, targetColumnId, targetPosition, drag.sourceColumnId, drag.sourceIndex)
      startTransition(() => router.refresh())
    } catch {
      setBoard(initialBoard)
    }
  }

  async function handleDropOnCard(targetColumnId: string, targetIndex: number) {
    const drag = dragCard.current
    if (!drag) return

    const sourceCol = board.find(c => c.id === drag.sourceColumnId)!
    const movingCard = sourceCol.cards.find(c => c.id === drag.cardId)!

    // optimistic update
    setBoard(prev => {
      const next = prev.map(col => ({
        ...col,
        cards: col.cards.filter(c => c.id !== drag.cardId),
      }))
      return next.map(col => {
        if (col.id !== targetColumnId) return col
        const cards = [...col.cards]
        cards.splice(targetIndex, 0, { ...movingCard, column_id: targetColumnId })
        return { ...col, cards }
      })
    })

    dragCard.current = null

    try {
      await moveKanbanCard(drag.cardId, targetColumnId, targetIndex, drag.sourceColumnId, drag.sourceIndex)
      startTransition(() => router.refresh())
    } catch {
      setBoard(initialBoard)
    }
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault()
    if (!newCardForm.name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      await createKanbanCard({
        column_id: firstColumnId,
        name: newCardForm.name.trim(),
        description: newCardForm.description.trim() || null,
        project_id: newCardForm.project_id || null,
      })
      setDrawerOpen(false)
      setNewCardForm({ name: '', description: '', project_id: '' })
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atividade.')
    } finally {
      setSaving(false)
    }
  }

  function handleCardUpdate(updated: KanbanCardWithProject) {
    setBoard(prev =>
      prev.map(col => ({
        ...col,
        cards: col.cards.map(c => c.id === updated.id ? updated : c),
      }))
    )
    if (selectedCard?.id === updated.id) setSelectedCard(updated)
    startTransition(() => router.refresh())
  }

  function handleCardDelete(cardId: string) {
    setBoard(prev =>
      prev.map(col => ({ ...col, cards: col.cards.filter(c => c.id !== cardId) }))
    )
    startTransition(() => router.refresh())
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--background)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--foreground)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--foreground-muted)',
    marginBottom: '0.375rem',
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <AdminPageHeader title="Kanban" subtitle="Quadro de atividades do time" />

      {board.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhuma coluna criada. Configure as colunas em Configurações &rarr; Colunas do Kanban.
        </p>
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {board.map(col => (
            <div
              key={col.id}
              className="flex w-72 shrink-0 flex-col rounded-xl"
              style={{ background: 'var(--background-secondary)', border: '1px solid var(--card-border)' }}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnColumn(col.id)}
            >
              {/* column header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--card-border)' }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}
                >
                  {col.name}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}
                >
                  {col.cards.length}
                </span>
              </div>

              {/* cards */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                {col.cards.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card.id, col.id, cardIndex)}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                    onDrop={e => { e.stopPropagation(); handleDropOnCard(col.id, cardIndex) }}
                    onClick={() => setSelectedCard(card)}
                    className="cursor-pointer rounded-lg border p-3 transition-all"
                    style={{
                      borderColor: 'var(--card-border)',
                      background: 'var(--background)',
                      cursor: 'grab',
                    }}
                  >
                    {card.project && (
                      <span
                        className="mb-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-bold tracking-widest"
                        style={{
                          background: 'rgba(57,255,20,0.1)',
                          color: 'var(--primary)',
                          fontFamily: 'var(--font-title)',
                        }}
                      >
                        {card.project.acronym}{card.card_number}
                      </span>
                    )}
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {card.name}
                    </p>
                    {card.description && (
                      <p
                        className="mt-1 line-clamp-2 text-xs"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        {card.description}
                      </p>
                    )}
                    {card.assignee && (
                      <div className="mt-2 flex justify-end">
                        <div
                          className="flex items-center justify-center rounded-full text-xs font-semibold"
                          style={{
                            width: 28,
                            height: 28,
                            background: 'rgba(57,255,20,0.15)',
                            color: 'var(--color-lime)',
                            flexShrink: 0,
                          }}
                          title={card.assignee.name}
                        >
                          {getInitials(card.assignee.name)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* "Nova atividade" only under first column */}
              {col.id === firstColumnId && (
                <div className="p-3 pt-0">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-xs font-medium transition-colors"
                    style={{
                      borderColor: 'var(--card-border)',
                      color: 'var(--foreground-muted)',
                      borderStyle: 'dashed',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nova atividade
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Nova Atividade"
      >
        <form onSubmit={handleCreateCard} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              value={newCardForm.name}
              onChange={e => setNewCardForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome da atividade"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Projeto</label>
            <select
              style={inputStyle}
              value={newCardForm.project_id}
              onChange={e => setNewCardForm(f => ({ ...f, project_id: e.target.value }))}
            >
              <option value="">Sem projeto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.acronym} — {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={newCardForm.description}
              onChange={e => setNewCardForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descreva a atividade…"
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
              style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}
            >
              {saving ? 'Criando…' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm"
              style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Drawer>

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
      />
    </div>
  )
}
