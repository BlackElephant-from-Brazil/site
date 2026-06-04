'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { uploadKanbanImage } from '@/lib/actions/uploads'
import type { KanbanCard, KanbanBoardCard, User } from '@/types'

interface Props {
  card: KanbanBoardCard | null
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
  onClose: () => void
  onUpdate: (card: KanbanBoardCard) => void
  onDelete: (cardId: string) => void
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

function renderDescription(text: string) {
  if (!text) return null
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = imageRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={key++} style={{ whiteSpace: 'pre-wrap' }}>
          {text.slice(lastIndex, match.index)}
        </span>
      )
    }
    nodes.push(
      <img
        key={key++}
        src={match[2]}
        alt={match[1] || 'imagem'}
        style={{
          display: 'block',
          maxWidth: '100%',
          borderRadius: '0.5rem',
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
        }}
      />
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(
      <span key={key++} style={{ whiteSpace: 'pre-wrap' }}>
        {text.slice(lastIndex)}
      </span>
    )
  }

  return <div style={{ lineHeight: 1.6 }}>{nodes}</div>
}

export function CardDetailModal({ card, adminUsers, onClose, onUpdate, onDelete, updateCard, deleteCard }: Props) {
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [description, setDescription] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [hoursWorked, setHoursWorked] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [assigneeId, setAssigneeId] = useState<string>('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const latestAssigneeRequest = useRef<string | null>(null)

  useEffect(() => {
    if (!card) return
    setName(card.name)
    setDescription(card.description ?? '')
    setHoursWorked(card.hours_worked != null ? String(card.hours_worked) : '')
    setAssigneeId(card.assignee_id ?? '')
    setEditingName(false)
    setEditingDescription(false)
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
      const updated = await updateCard(card.id, { name: name.trim() })
      onUpdate({ ...card, ...updated })
    } finally {
      setSaving(false)
      setEditingName(false)
    }
  }

  async function saveDescription() {
    if (!card || description === (card.description ?? '')) {
      setEditingDescription(false)
      return
    }
    setSaving(true)
    try {
      const updated = await updateCard(card.id, { description: description || null })
      onUpdate({ ...card, ...updated })
    } finally {
      setSaving(false)
      setEditingDescription(false)
    }
  }

  async function saveHoursWorked() {
    if (!card) return
    const parsed = hoursWorked.trim() === '' ? null : parseFloat(hoursWorked.trim().replace(',', '.'))
    const current = card.hours_worked ?? null
    if (parsed === current || (parsed !== null && isNaN(parsed))) return
    setSaving(true)
    try {
      const updated = await updateCard(card.id, { hours_worked: parsed })
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
      const updated = await updateCard(card.id, { assignee_id: newAssigneeId })
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
    await deleteCard(card.id)
    onDelete(card.id)
    onClose()
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadKanbanImage(formData)
      setDescription(prev => prev + (prev ? '\n' : '') + `![](${url})`)
    } finally {
      setUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const cardLabel = card?.project
    ? `${card.project.acronym}${card.card_number}`
    : `#${card?.card_number}`

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--foreground-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '0.375rem',
  }

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
              maxHeight: '85vh',
            }}
          >
            {/* left — description */}
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
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveName()
                    if (e.key === 'Escape') { setName(card.name); setEditingName(false) }
                  }}
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

              {/* description */}
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <p style={fieldLabelStyle}>Descrição</p>
                  <div className="flex items-center gap-2">
                    {editingDescription && (
                      <>
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
                          }}
                        >
                          {uploading ? 'Enviando…' : '+ Imagem'}
                        </button>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageUpload}
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (editingDescription) {
                          saveDescription()
                        } else {
                          setEditingDescription(true)
                        }
                      }}
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--foreground-muted)',
                        background: 'none',
                        border: '1px solid var(--card-border)',
                        borderRadius: '0.25rem',
                        padding: '0.2rem 0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      {editingDescription ? 'Salvar' : 'Editar'}
                    </button>
                  </div>
                </div>

                {editingDescription ? (
                  <textarea
                    className="w-full flex-1 resize-none rounded-lg p-3 text-sm"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--primary)',
                      color: 'var(--foreground)',
                      outline: 'none',
                      minHeight: '200px',
                      fontFamily: 'var(--font-primary)',
                    }}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Adicione uma descrição… Use ![](url) para inserir imagens."
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex-1 rounded-lg p-3 text-sm"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--card-border)',
                      color: description ? 'var(--foreground)' : 'var(--foreground-muted)',
                      minHeight: '120px',
                      cursor: 'text',
                    }}
                    onClick={() => setEditingDescription(true)}
                  >
                    {description
                      ? renderDescription(description)
                      : <span style={{ fontStyle: 'italic' }}>Clique para adicionar uma descrição…</span>
                    }
                  </div>
                )}

                {saving && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>Salvando…</p>
                )}
              </div>
            </div>

            {/* right — metadata */}
            <div className="flex w-60 shrink-0 flex-col gap-5 overflow-y-auto p-6">
              {/* badge */}
              <div>
                <p style={fieldLabelStyle}>Identificador</p>
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
                  <p style={fieldLabelStyle}>Projeto</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{card.project.name}</p>
                  {card.project.client && (
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{card.project.client.trade_name}</p>
                  )}
                </div>
              )}

              {/* assignee */}
              <div>
                <p style={fieldLabelStyle}>Responsável</p>
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

              {/* hours worked */}
              <div>
                <p style={fieldLabelStyle}>Horas trabalhadas</p>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full rounded-lg px-2 py-1.5 text-sm"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                    outline: 'none',
                  }}
                  value={hoursWorked}
                  onChange={e => setHoursWorked(e.target.value)}
                  onBlur={saveHoursWorked}
                  placeholder="0"
                />
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
