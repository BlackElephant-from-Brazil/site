'use client'

import { useState, useRef, useTransition, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { CardDetailModal } from '@/components/admin/kanban/CardDetailModal'
import { uploadKanbanImage } from '@/lib/actions/uploads'
import type { KanbanCard, KanbanBoardProject, KanbanBoardCard, KanbanBoardColumn, Client, User } from '@/types'

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(p => p.length > 0)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface Props {
  title: string
  subtitle: string
  initialBoard: KanbanBoardColumn[]
  projects: KanbanBoardProject[]
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
  clients: Client[]
  currentUserId: string | null
  createCard: (payload: {
    column_id: string
    name: string
    description?: string | null
    project_id?: string | null
    assignee_id?: string | null
  }) => Promise<KanbanCard>
  moveCard: (
    cardId: string,
    targetColumnId: string,
    targetPosition: number,
    sourceColumnId: string,
    sourceIndex: number
  ) => Promise<void>
  updateCard: (
    id: string,
    payload: Partial<{
      name: string
      description: string | null
      project_id: string | null
      assignee_id: string | null
      hours_worked: number | null
    }>
  ) => Promise<KanbanCard>
  deleteCard: (id: string) => Promise<void>
}

export function KanbanBoard({
  title,
  subtitle,
  initialBoard,
  projects,
  adminUsers,
  clients,
  currentUserId,
  createCard,
  moveCard,
  updateCard,
  deleteCard,
}: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [board, setBoard] = useState(initialBoard)
  const [selectedCard, setSelectedCard] = useState<KanbanBoardCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newCardForm, setNewCardForm] = useState({ name: '', description: '', project_id: '', assignee_id: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [filterClientId, setFilterClientId] = useState('')
  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterUserIds, setFilterUserIds] = useState<string[]>([])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const dragCard = useRef<{ cardId: string; sourceColumnId: string; sourceIndex: number } | null>(null)

  const firstColumnId = board[0]?.id

  const availableProjects = filterClientId
    ? projects.filter(p => p.client_id === filterClientId)
    : projects

  const filteredBoard = useMemo(() => {
    const clientActive  = filterClientId !== ''
    const projectActive = filterProjectId !== ''
    const usersActive   = filterUserIds.length > 0

    if (!clientActive && !projectActive && !usersActive) return board

    return board.map(col => ({
      ...col,
      cards: col.cards.filter(card => {
        if (clientActive || projectActive) {
          if (!card.project) return false
          if (clientActive && card.project.client_id !== filterClientId) return false
          if (projectActive && card.project_id !== filterProjectId) return false
        }
        if (usersActive) {
          if (!card.assignee_id) return false
          if (!filterUserIds.includes(card.assignee_id)) return false
        }
        return true
      }),
    }))
  }, [board, filterClientId, filterProjectId, filterUserIds])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function handleDragStart(cardId: string, sourceColumnId: string) {
    const sourceCol = board.find(c => c.id === sourceColumnId)!
    const sourceIndex = sourceCol.cards.findIndex(c => c.id === cardId)
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
      await moveCard(drag.cardId, targetColumnId, targetPosition, drag.sourceColumnId, drag.sourceIndex)
      startTransition(() => router.refresh())
    } catch {
      setBoard(initialBoard)
    }
  }

  async function handleDropOnCard(targetColumnId: string, targetCardId: string) {
    const drag = dragCard.current
    if (!drag) return

    const targetCol = board.find(c => c.id === targetColumnId)!
    const targetIndex = targetCol.cards.findIndex(c => c.id === targetCardId)
    const sourceCol = board.find(c => c.id === drag.sourceColumnId)!
    const movingCard = sourceCol.cards.find(c => c.id === drag.cardId)!

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
      await moveCard(drag.cardId, targetColumnId, targetIndex, drag.sourceColumnId, drag.sourceIndex)
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
      const created = await createCard({
        column_id: firstColumnId,
        name: newCardForm.name.trim(),
        description: newCardForm.description.trim() || null,
        project_id: newCardForm.project_id || null,
        assignee_id: newCardForm.assignee_id || null,
      })

      const project = newCardForm.project_id
        ? (projects.find(p => p.id === newCardForm.project_id) ?? null)
        : null
      const assignee = newCardForm.assignee_id
        ? (adminUsers.find(u => u.id === newCardForm.assignee_id) ?? null)
        : null

      const newBoardCard: KanbanBoardCard = { ...created, project: project ?? null, assignee: assignee ?? null }

      setBoard(prev => prev.map(col =>
        col.id === firstColumnId
          ? { ...col, cards: [...col.cards, newBoardCard] }
          : col
      ))
      setDrawerOpen(false)
      setNewCardForm({ name: '', description: '', project_id: '', assignee_id: '' })
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atividade.')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadKanbanImage(formData)
      setNewCardForm(f => ({
        ...f,
        description: f.description + (f.description ? '\n' : '') + `![](${url})`,
      }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.')
    } finally {
      setUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  function handleCardUpdate(updated: KanbanBoardCard) {
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

  const filterControlStyle: React.CSSProperties = {
    background: 'var(--background-secondary)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--foreground)',
    outline: 'none',
    cursor: 'pointer',
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <AdminPageHeader title={title} subtitle={subtitle} />

      {board.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhuma coluna criada. Configure as colunas em Configurações &rarr; Colunas do Kanban.
        </p>
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 py-3">
            <select
              style={filterControlStyle}
              value={filterClientId}
              onChange={e => {
                const newClientId = e.target.value
                setFilterClientId(newClientId)
                if (filterProjectId) {
                  if (!newClientId) {
                    setFilterProjectId('')
                  } else {
                    const proj = projects.find(p => p.id === filterProjectId)
                    if (proj?.client_id !== newClientId) setFilterProjectId('')
                  }
                }
              }}
            >
              <option value="">Todos os clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.trade_name}</option>
              ))}
            </select>

            <select
              style={{ ...filterControlStyle, opacity: availableProjects.length === 0 ? 0.5 : 1 }}
              value={filterProjectId}
              onChange={e => setFilterProjectId(e.target.value)}
              disabled={availableProjects.length === 0}
            >
              <option value="">Todos os projetos</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.acronym} — {p.name}</option>
              ))}
            </select>

            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(o => !o)}
                style={{ ...filterControlStyle, minWidth: '160px', textAlign: 'left' }}
              >
                {filterUserIds.length === 0
                  ? 'Todos os usuários'
                  : filterUserIds.length === 1
                    ? (adminUsers.find(u => u.id === filterUserIds[0])?.name ?? '1 usuário')
                    : `${filterUserIds.length} usuários`}
                {' ▾'}
              </button>
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    zIndex: 50,
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '0.5rem',
                    minWidth: '200px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {adminUsers.map(u => (
                    <label
                      key={u.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--foreground)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filterUserIds.includes(u.id)}
                        onChange={e => {
                          setFilterUserIds(prev =>
                            e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                          )
                        }}
                        style={{ accentColor: 'var(--color-lime)' }}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {currentUserId !== null && (
              <button
                type="button"
                onClick={() => {
                  const onlyMe = filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                  setFilterUserIds(onlyMe ? [] : [currentUserId])
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                    ? 'var(--color-lime)'
                    : 'var(--card-border)',
                  color: filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                    ? 'var(--color-lime)'
                    : 'var(--foreground-muted)',
                  background: filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                    ? 'rgba(57,255,20,0.05)'
                    : 'transparent',
                }}
              >
                Apenas para mim
              </button>
            )}

            {(filterClientId !== '' || filterProjectId !== '' || filterUserIds.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setFilterClientId('')
                  setFilterProjectId('')
                  setFilterUserIds([])
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  background: 'transparent',
                }}
              >
                × Limpar
              </button>
            )}
          </div>

          {/* Board columns */}
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {filteredBoard.map(col => (
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
                {col.cards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card.id, col.id)}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                    onDrop={e => { e.stopPropagation(); handleDropOnCard(col.id, card.id) }}
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
                        {card.description.replace(/!\[.*?\]\(.*?\)/g, '[imagem]')}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {card.hours_worked != null && (
                        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {card.hours_worked}h
                        </span>
                      )}
                      {card.assignee && (
                        <div className="ml-auto">
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
        </>
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
            <label style={labelStyle}>Responsável</label>
            <select
              style={inputStyle}
              value={newCardForm.assignee_id}
              onChange={e => setNewCardForm(f => ({ ...f, assignee_id: e.target.value }))}
            >
              <option value="">— Sem responsável —</option>
              {adminUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label style={{ ...labelStyle, marginBottom: 0 }}>Descrição</label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                style={{
                  fontSize: '0.7rem',
                  color: uploading ? 'var(--foreground-muted)' : 'var(--color-lime)',
                  background: 'none',
                  border: 'none',
                  cursor: uploading ? 'default' : 'pointer',
                  padding: '0 0.25rem',
                }}
              >
                {uploading ? 'Enviando…' : '+ Imagem'}
              </button>
            </div>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              value={newCardForm.description}
              onChange={e => setNewCardForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descreva a atividade…"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
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
        adminUsers={adminUsers}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
        updateCard={updateCard}
        deleteCard={deleteCard}
      />
    </div>
  )
}
