'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import {
  getMonthlyUserSummary,
  getMonthlyProjectBankSummary,
  getEntriesForUserMonth,
  getEntriesForProject,
  createAgendaEntry,
  updateAgendaEntry,
  deleteAgendaEntry,
  getCardsForProject,
} from '@/lib/actions/agenda'
import { getProjects } from '@/lib/actions/projects'
import type {
  UserAgendaSummary,
  ProjectBankSummary,
  AgendaEntryWithRefs,
  User,
  KanbanCardWithProject,
  ProjectWithRefs,
} from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h${String(min).padStart(2, '0')}`
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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

// ─── Modal base ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--background-secondary)', border: '1px solid var(--card-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
          <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-white/[0.06]" style={{ color: 'var(--foreground-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </motion.div>
    </div>
  )
}

// ─── Card selectors ───────────────────────────────────────────────────────────

function CardSelectorMulti({
  projectId,
  selectedCardIds,
  onToggle,
}: {
  projectId: string
  selectedCardIds: string[]
  onToggle: (cardId: string) => void
}) {
  const [cards, setCards] = useState<KanbanCardWithProject[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setCards([])
    getCardsForProject(projectId)
      .then(data => { if (!cancelled) setCards(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [projectId])

  const filtered = search.trim()
    ? cards.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        String(c.card_number).includes(search)
      )
    : cards

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label style={labelStyle}>Atividades (opcional)</label>
        {selectedCardIds.length > 0 && (
          <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
            {selectedCardIds.length} selecionada{selectedCardIds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-sm italic py-1" style={{ color: 'var(--foreground-muted)' }}>Carregando atividades…</p>
      ) : cards.length === 0 ? (
        <p className="text-sm italic py-1" style={{ color: 'var(--foreground-muted)' }}>Nenhuma atividade para este projeto.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar atividade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: '0.375rem' }}
          />

          <div
            className="flex flex-col overflow-y-auto rounded-lg"
            style={{ maxHeight: '200px', border: '1px solid var(--card-border)', background: 'var(--background)' }}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum resultado.</p>
            ) : (
              filtered.map(card => {
                const isSelected = selectedCardIds.includes(card.id)
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onToggle(card.id)}
                    className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                    style={{
                      background: isSelected ? 'rgba(57,255,20,0.06)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      className="flex shrink-0 items-center justify-center rounded"
                      style={{
                        width: '15px', height: '15px',
                        border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)',
                        background: isSelected ? 'rgba(57,255,20,0.15)' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-xs font-bold"
                      style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}
                    >
                      #{card.card_number}
                    </span>
                    <p className="text-sm font-medium leading-snug truncate" style={{ color: 'var(--foreground)' }}>
                      {card.name}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CardSelectorSingle({
  projectId,
  selectedCardId,
  onSelect,
}: {
  projectId: string
  selectedCardId: string | null
  onSelect: (cardId: string | null) => void
}) {
  const [cards, setCards] = useState<KanbanCardWithProject[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setCards([])
    getCardsForProject(projectId)
      .then(data => { if (!cancelled) setCards(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [projectId])

  const filtered = search.trim()
    ? cards.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        String(c.card_number).includes(search)
      )
    : cards

  return (
    <div>
      <label style={labelStyle}>Atividade (opcional)</label>

      {loading ? (
        <p className="text-sm italic py-1" style={{ color: 'var(--foreground-muted)' }}>Carregando atividades…</p>
      ) : cards.length === 0 ? (
        <p className="text-sm italic py-1" style={{ color: 'var(--foreground-muted)' }}>Nenhuma atividade para este projeto.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar atividade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: '0.375rem' }}
          />

          <div
            className="flex flex-col overflow-y-auto rounded-lg"
            style={{ maxHeight: '180px', border: '1px solid var(--card-border)', background: 'var(--background)' }}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum resultado.</p>
            ) : (
              filtered.map(card => {
                const isSelected = selectedCardId === card.id
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onSelect(isSelected ? null : card.id)}
                    className="flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                    style={{
                      background: isSelected ? 'rgba(57,255,20,0.08)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span
                      className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold"
                      style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}
                    >
                      #{card.card_number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug" style={{ color: 'var(--foreground)' }}>
                        {card.name}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Add Entry Modal ──────────────────────────────────────────────────────────

function AddEntryModal({
  currentUserId,
  adminUsers,
  onClose,
  onSaved,
}: {
  currentUserId: string
  adminUsers: User[]
  onClose: () => void
  onSaved: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(currentUserId)
  const [projects, setProjects] = useState<ProjectWithRefs[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [form, setForm] = useState({
    date: today, start_time: '', hours: '', minutes_part: '', description: '',
  })

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  function toggleCard(cardId: string) {
    setSelectedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const totalMinutes = (parseInt(form.hours || '0') * 60) + parseInt(form.minutes_part || '0')
    if (totalMinutes <= 0) { setError('Informe o tempo trabalhado.'); return }
    setSaving(true)
    setError('')
    try {
      const base = {
        user_id: selectedUserId,
        date: form.date,
        start_time: form.start_time || null,
        minutes: totalMinutes,
        description: form.description || null,
        project_id: selectedProjectId || null,
        client_id: null,
      }
      if (selectedCardIds.length > 0) {
        await Promise.all(
          selectedCardIds.map(cardId =>
            createAgendaEntry({ ...base, kanban_card_id: cardId })
          )
        )
      } else {
        await createAgendaEntry({ ...base, kanban_card_id: null })
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Adicionar Registro" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Funcionário */}
        <div>
          <label style={labelStyle}>Funcionário *</label>
          <select style={inputStyle} value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
            {adminUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Data *</label>
            <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Início (opcional)</label>
            <input type="time" style={inputStyle} value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tempo trabalhado *</label>
          <div className="flex gap-2">
            <div style={{ flex: 1, position: 'relative' }}>
              <input type="number" min="0" max="23" placeholder="0" style={inputStyle} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--foreground-muted)' }}>h</span>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input type="number" min="0" max="59" placeholder="0" style={inputStyle} value={form.minutes_part} onChange={e => setForm(f => ({ ...f, minutes_part: e.target.value }))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--foreground-muted)' }}>min</span>
            </div>
          </div>
        </div>

        {/* Projeto */}
        <div>
          <label style={labelStyle}>Projeto</label>
          <select
            style={inputStyle}
            value={selectedProjectId}
            onChange={e => { setSelectedProjectId(e.target.value); setSelectedCardIds([]) }}
          >
            <option value="">Selecione um projeto (opcional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Atividades — múltipla escolha, só aparece com projeto selecionado */}
        {selectedProjectId && (
          <CardSelectorMulti
            projectId={selectedProjectId}
            selectedCardIds={selectedCardIds}
            onToggle={toggleCard}
          />
        )}

        <div>
          <label style={labelStyle}>Descrição</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', minHeight: '80px' }}
            placeholder="O que foi feito? Qual atividade?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {error && <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="flex-1 rounded-lg py-2.5 text-sm font-semibold" style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}>
            {saving ? 'Salvando…' : selectedCardIds.length > 1 ? `Salvar ${selectedCardIds.length} registros` : 'Salvar registro'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2.5 text-sm" style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Edit Entry Modal ─────────────────────────────────────────────────────────

function EditEntryModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: AgendaEntryWithRefs
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<ProjectWithRefs[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState(entry.project_id ?? '')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(entry.kanban_card_id)
  const [form, setForm] = useState({
    date: entry.date,
    start_time: entry.start_time ? entry.start_time.slice(0, 5) : '',
    hours: String(Math.floor(entry.minutes / 60)),
    minutes_part: String(entry.minutes % 60),
    description: entry.description ?? '',
  })

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const totalMinutes = (parseInt(form.hours || '0') * 60) + parseInt(form.minutes_part || '0')
    if (totalMinutes <= 0) { setError('Informe o tempo trabalhado.'); return }
    setSaving(true)
    setError('')
    try {
      await updateAgendaEntry(entry.id, {
        date: form.date,
        start_time: form.start_time || null,
        minutes: totalMinutes,
        description: form.description || null,
        project_id: selectedProjectId || null,
        kanban_card_id: selectedCardId,
        client_id: null,
      })
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Editar Registro" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Data *</label>
            <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Início (opcional)</label>
            <input type="time" style={inputStyle} value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tempo trabalhado *</label>
          <div className="flex gap-2">
            <div style={{ flex: 1, position: 'relative' }}>
              <input type="number" min="0" max="23" placeholder="0" style={inputStyle} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--foreground-muted)' }}>h</span>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input type="number" min="0" max="59" placeholder="0" style={inputStyle} value={form.minutes_part} onChange={e => setForm(f => ({ ...f, minutes_part: e.target.value }))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--foreground-muted)' }}>min</span>
            </div>
          </div>
        </div>

        {/* Projeto */}
        <div>
          <label style={labelStyle}>Projeto</label>
          <select
            style={inputStyle}
            value={selectedProjectId}
            onChange={e => { setSelectedProjectId(e.target.value); setSelectedCardId(null) }}
          >
            <option value="">Nenhum projeto</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Atividade — single select em modo edição */}
        {selectedProjectId && (
          <CardSelectorSingle
            projectId={selectedProjectId}
            selectedCardId={selectedCardId}
            onSelect={setSelectedCardId}
          />
        )}

        <div>
          <label style={labelStyle}>Descrição</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', minHeight: '80px' }}
            placeholder="O que foi feito? Qual atividade?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {error && <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="flex-1 rounded-lg py-2.5 text-sm font-semibold" style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2.5 text-sm" style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Entry list (shared between user/project modals) ──────────────────────────

function EntryList({
  entries,
  onDelete,
  onEdit,
}: {
  entries: AgendaEntryWithRefs[]
  onDelete: (id: string) => void
  onEdit?: (entry: AgendaEntryWithRefs) => void
}) {
  if (entries.length === 0) return (
    <p className="text-center py-6 text-sm italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum registro no período.</p>
  )

  const grouped = entries.reduce<Record<string, AgendaEntryWithRefs[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, dayEntries]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
            {fmtDate(date)} · {fmtMinutes(dayEntries.reduce((s, e) => s + e.minutes, 0))}
          </p>
          <div className="flex flex-col gap-1.5">
            {dayEntries.map(entry => {
              const label = entry.kanban_card
                ? `#${entry.kanban_card.card_number} ${entry.kanban_card.name}`
                : entry.project
                  ? entry.project.name
                  : entry.client
                    ? (entry.client as { trade_name: string }).trade_name
                    : 'Registro geral'
              return (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between gap-3 rounded-lg px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{label}</p>
                    {entry.start_time && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{entry.start_time.slice(0, 5)}</p>
                    )}
                    {entry.description && (
                      <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--foreground-muted)' }}>{entry.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}>
                      {fmtMinutes(entry.minutes)}
                    </span>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(entry)}
                        className="flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.06)' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: 'rgba(255,59,48,0.7)', background: 'rgba(255,59,48,0.08)' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Monthly Calendar Modal ────────────────────────────────────────────────────

function MonthlyCalendarModal({
  user,
  initialYear,
  initialMonth,
  onClose,
}: {
  user: User
  initialYear: number
  initialMonth: number
  onClose: () => void
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [entries, setEntries] = useState<AgendaEntryWithRefs[]>([])
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<AgendaEntryWithRefs | null>(null)

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try {
      const data = await getEntriesForUserMonth(user.user_id, y, m)
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }, [user.user_id])

  useEffect(() => { load(year, month) }, [load, year, month])

  function changeMonth(delta: number) {
    let nm = month + delta
    let ny = year
    if (nm < 1) { nm = 12; ny-- }
    if (nm > 12) { nm = 1; ny++ }
    setMonth(nm)
    setYear(ny)
    setSelectedDate(null)
    startTransition(() => load(ny, nm))
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDow = firstDay.getDay() // 0=Sun

  const minutesByDate = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.minutes
    return acc
  }, {})

  const selectedEntries = selectedDate ? entries.filter(e => e.date === selectedDate) : []
  const totalMonth = entries.reduce((s, e) => s + e.minutes, 0)

  async function handleDeleteFromCalendar(id: string) {
    if (!confirm('Remover registro?')) return
    try {
      await deleteAgendaEntry(id)
      startTransition(() => load(year, month))
    } catch { alert('Erro ao excluir.') }
  }

  return (
    <Modal title={`Agenda — ${user.name}`} onClose={onClose}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="rounded p-1.5 hover:bg-white/[0.06] transition-colors" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="text-center">
          <p className="font-semibold capitalize" style={{ color: 'var(--foreground)' }}>{monthLabel(year, month)}</p>
          {totalMonth > 0 && (
            <p className="text-xs" style={{ color: 'var(--primary)' }}>{fmtMinutes(totalMonth)} no mês</p>
          )}
        </div>
        <button onClick={() => changeMonth(1)} className="rounded p-1.5 hover:bg-white/[0.06] transition-colors" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--foreground-muted)' }}>Carregando…</p>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[0.6rem] font-semibold uppercase pb-1" style={{ color: 'var(--foreground-muted)' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDow }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const mins = minutesByDate[dateStr] ?? 0
              const isSelected = selectedDate === dateStr
              const isToday = dateStr === new Date().toISOString().slice(0, 10)
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className="flex flex-col items-center justify-center rounded-lg py-1 transition-all"
                  style={{
                    minHeight: '40px',
                    background: isSelected
                      ? 'rgba(57,255,20,0.15)'
                      : mins > 0
                        ? 'rgba(57,255,20,0.05)'
                        : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(57,255,20,0.4)'
                      : isToday
                        ? '1px solid rgba(57,255,20,0.25)'
                        : '1px solid transparent',
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: isSelected ? 'var(--primary)' : isToday ? 'var(--primary)' : 'var(--foreground)' }}>{day}</span>
                  {mins > 0 && (
                    <span className="text-[0.55rem] font-bold mt-0.5" style={{ color: 'var(--primary)', opacity: 0.8 }}>{fmtMinutes(mins)}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected day entries */}
          {selectedDate && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground-muted)' }}>
                {fmtDate(selectedDate)} · {fmtMinutes(selectedEntries.reduce((s, e) => s + e.minutes, 0))}
              </p>
              <EntryList entries={selectedEntries} onDelete={handleDeleteFromCalendar} onEdit={setEditingEntry} />
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {editingEntry && (
          <EditEntryModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSaved={() => { setEditingEntry(null); startTransition(() => load(year, month)) }}
          />
        )}
      </AnimatePresence>
    </Modal>
  )
}

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({
  summary,
  year,
  month,
}: {
  summary: UserAgendaSummary
  year: number
  month: number
}) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailEntries, setDetailEntries] = useState<AgendaEntryWithRefs[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AgendaEntryWithRefs | null>(null)
  const [, startTransition] = useTransition()

  async function openDetail() {
    setLoadingDetail(true)
    setShowDetail(true)
    try {
      const data = await getEntriesForUserMonth(summary.user.user_id, year, month)
      setDetailEntries(data)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover registro?')) return
    try {
      await deleteAgendaEntry(id)
      startTransition(async () => {
        const data = await getEntriesForUserMonth(summary.user.user_id, year, month)
        setDetailEntries(data)
      })
    } catch { alert('Erro ao excluir.') }
  }

  const initials = summary.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <div
        className="flex flex-col rounded-xl p-4 gap-3"
        style={{ background: 'var(--background-secondary)', border: '1px solid var(--card-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>{summary.user.name}</p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{summary.user.email}</p>
          </div>
        </div>

        <button
          onClick={openDetail}
          className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.04]"
          style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.15)' }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Horas no mês</span>
          <span className="text-base font-bold" style={{ color: summary.total_minutes > 0 ? 'var(--primary)' : 'var(--foreground-muted)' }}>
            {fmtMinutes(summary.total_minutes)}
          </span>
        </button>

        <button
          onClick={() => setShowCalendar(true)}
          className="flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.06]"
          style={{ border: '1px solid var(--card-border)', color: 'var(--foreground-muted)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Ver agenda
        </button>
      </div>

      <AnimatePresence>
        {showDetail && (
          <Modal title={`Registros — ${summary.user.name} · ${monthLabel(year, month)}`} onClose={() => setShowDetail(false)}>
            {loadingDetail
              ? <p className="text-center py-6 text-sm" style={{ color: 'var(--foreground-muted)' }}>Carregando…</p>
              : <EntryList entries={detailEntries} onDelete={handleDelete} onEdit={setEditingEntry} />}
          </Modal>
        )}
        {showCalendar && (
          <MonthlyCalendarModal
            user={summary.user}
            initialYear={year}
            initialMonth={month}
            onClose={() => setShowCalendar(false)}
          />
        )}
        {editingEntry && (
          <EditEntryModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSaved={() => {
              setEditingEntry(null)
              startTransition(async () => {
                const data = await getEntriesForUserMonth(summary.user.user_id, year, month)
                setDetailEntries(data)
              })
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Project bank card ────────────────────────────────────────────────────────

function ProjectBankCard({
  summary,
  year,
  month,
}: {
  summary: ProjectBankSummary
  year: number
  month: number
}) {
  const [showDetail, setShowDetail] = useState(false)
  const [detailEntries, setDetailEntries] = useState<AgendaEntryWithRefs[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AgendaEntryWithRefs | null>(null)
  const [, startTransition] = useTransition()

  const usedHours = summary.used_minutes / 60
  const available = summary.available_hours
  const pct = available ? Math.min(100, (usedHours / available) * 100) : null
  const overBudget = available !== null && usedHours > available

  async function openDetail() {
    setLoadingDetail(true)
    setShowDetail(true)
    try {
      const data = await getEntriesForProject(summary.project.id, year, month)
      setDetailEntries(data)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover registro?')) return
    try {
      await deleteAgendaEntry(id)
      startTransition(async () => {
        const data = await getEntriesForProject(summary.project.id, year, month)
        setDetailEntries(data)
      })
    } catch { alert('Erro ao excluir.') }
  }

  const clientName = summary.project.client?.trade_name ?? null

  return (
    <>
      <div
        className="flex flex-col rounded-xl p-4 gap-3"
        style={{ background: 'var(--background-secondary)', border: '1px solid var(--card-border)' }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{summary.project.name}</p>
          {clientName && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{clientName}</p>
          )}
        </div>

        <button
          onClick={openDetail}
          className="flex flex-col gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Horas usadas</span>
            <span className="text-sm font-bold" style={{ color: overBudget ? '#ff4d4f' : 'var(--primary)' }}>
              {fmtMinutes(summary.used_minutes)}
              {available !== null && (
                <span className="text-xs font-normal ml-1" style={{ color: 'var(--foreground-muted)' }}>
                  / {available}h
                </span>
              )}
            </span>
          </div>
          {pct !== null && (
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: overBudget ? '#ff4d4f' : 'var(--primary)',
                }}
              />
            </div>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showDetail && (
          <Modal title={`Registros — ${summary.project.name} · ${monthLabel(year, month)}`} onClose={() => setShowDetail(false)}>
            {loadingDetail
              ? <p className="text-center py-6 text-sm" style={{ color: 'var(--foreground-muted)' }}>Carregando…</p>
              : <EntryList entries={detailEntries} onDelete={handleDelete} onEdit={setEditingEntry} />}
          </Modal>
        )}
        {editingEntry && (
          <EditEntryModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSaved={() => {
              setEditingEntry(null)
              startTransition(async () => {
                const data = await getEntriesForProject(summary.project.id, year, month)
                setDetailEntries(data)
              })
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

interface Props {
  initialUserSummaries: UserAgendaSummary[]
  initialProjectSummaries: ProjectBankSummary[]
  currentUserId: string
  currentYear: number
  currentMonth: number
}

export function AgendaView({
  initialUserSummaries,
  initialProjectSummaries,
  currentUserId,
  currentYear,
  currentMonth,
}: Props) {
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [userSummaries, setUserSummaries] = useState(initialUserSummaries)
  const [projectSummaries, setProjectSummaries] = useState(initialProjectSummaries)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [, startTransition] = useTransition()

  async function loadMonth(y: number, m: number) {
    setLoading(true)
    try {
      const [users, projects] = await Promise.all([
        getMonthlyUserSummary(y, m),
        getMonthlyProjectBankSummary(y, m),
      ])
      setUserSummaries(users)
      setProjectSummaries(projects)
    } finally {
      setLoading(false)
    }
  }

  function changeMonth(delta: number) {
    let nm = month + delta
    let ny = year
    if (nm < 1) { nm = 12; ny-- }
    if (nm > 12) { nm = 1; ny++ }
    setMonth(nm)
    setYear(ny)
    startTransition(() => loadMonth(ny, nm))
  }

  function handleSaved() {
    startTransition(() => loadMonth(year, month))
  }

  const allAdminUsers = userSummaries.map(s => s.user)

  return (
    <div>
      <AdminPageHeader
        title="Agenda"
        subtitle="Controle de horas e banco de horas por funcionário e projeto"
        action={
          <div className="flex items-center gap-3">
            {/* Month nav */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeMonth(-1)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid var(--card-border)', color: 'var(--foreground-muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span className="px-3 py-1.5 text-sm font-medium capitalize" style={{ color: 'var(--foreground)' }}>
                {monthLabel(year, month)}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/[0.06]"
                style={{ border: '1px solid var(--card-border)', color: 'var(--foreground-muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: 'var(--primary)', color: '#000', boxShadow: '0 0 16px rgba(57,255,20,0.4)' }}
            >
              + Adicionar registro
            </button>
          </div>
        }
      />

      {loading && (
        <p className="text-center py-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>Carregando…</p>
      )}

      {/* Funcionários */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--foreground-muted)' }}>
          Funcionários
        </h2>
        {userSummaries.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum administrador encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userSummaries.map(s => (
              <UserCard key={s.user.id} summary={s} year={year} month={month} />
            ))}
          </div>
        )}
      </section>

      {/* Projetos com banco de horas */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--foreground-muted)' }}>
          Projetos com Banco de Horas
        </h2>
        {projectSummaries.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
            Nenhum projeto com banco de horas configurado. Ative o banco de horas em{' '}
            <span style={{ color: 'var(--primary)' }}>Configurações → Tipos de Projeto</span>.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projectSummaries.map(s => (
              <ProjectBankCard key={s.project.id} summary={s} year={year} month={month} />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {showAddModal && (
          <AddEntryModal
            currentUserId={currentUserId}
            adminUsers={allAdminUsers}
            onClose={() => setShowAddModal(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
