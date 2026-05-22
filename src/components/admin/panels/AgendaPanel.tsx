'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getEntriesForDay,
  createAgendaEntry,
  updateAgendaEntry,
  deleteAgendaEntry,
  getCardsForProject,
} from '@/lib/actions/agenda'
import { getProjects } from '@/lib/actions/projects'
import type { AgendaEntryWithRefs, KanbanCardWithProject, ProjectWithRefs } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function fmtTime(t: string | null) {
  if (!t) return null
  return t.slice(0, 5)
}

function fmtMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h${String(min).padStart(2, '0')}`
}

function dayLabel(d: Date) {
  const today = new Date()
  const todayStr = fmtDate(today)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const ds = fmtDate(d)
  if (ds === todayStr) return 'Hoje'
  if (ds === fmtDate(yesterday)) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => i + 7) // 7h–20h

// ─── Card selectors ───────────────────────────────────────────────────────────

function PanelCardSelectorMulti({
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
      <div className="flex items-center justify-between mb-1">
        <label className="text-[0.7rem] font-medium" style={{ color: 'var(--foreground-muted)' }}>Atividades (opcional)</label>
        {selectedCardIds.length > 0 && (
          <span className="text-[0.65rem] font-semibold" style={{ color: 'var(--primary)' }}>
            {selectedCardIds.length} selecionada{selectedCardIds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-[0.7rem] italic py-2" style={{ color: 'var(--foreground-muted)' }}>Carregando atividades…</p>
      ) : cards.length === 0 ? (
        <p className="text-[0.7rem] italic py-2" style={{ color: 'var(--foreground-muted)' }}>Nenhuma atividade para este projeto.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar atividade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg px-2.5 py-1.5 text-[0.75rem] outline-none mb-1"
            style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
          />

          <div
            className="flex flex-col overflow-y-auto rounded-lg"
            style={{ maxHeight: '160px', border: '1px solid var(--card-border)', background: 'var(--background)' }}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[0.7rem] italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum resultado.</p>
            ) : (
              filtered.map(card => {
                const isSelected = selectedCardIds.includes(card.id)
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onToggle(card.id)}
                    className="flex items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                    style={{
                      background: isSelected ? 'rgba(57,255,20,0.06)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      className="flex shrink-0 items-center justify-center rounded"
                      style={{
                        width: '13px', height: '13px',
                        border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid var(--card-border)',
                        background: isSelected ? 'rgba(57,255,20,0.15)' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="shrink-0 rounded px-1 py-0.5 text-[0.6rem] font-bold"
                      style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}
                    >
                      #{card.card_number}
                    </span>
                    <p className="text-[0.75rem] font-medium leading-snug truncate" style={{ color: 'var(--foreground)' }}>
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

function PanelCardSelectorSingle({
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
      <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Atividade (opcional)</label>

      {loading ? (
        <p className="text-[0.7rem] italic py-2" style={{ color: 'var(--foreground-muted)' }}>Carregando atividades…</p>
      ) : cards.length === 0 ? (
        <p className="text-[0.7rem] italic py-2" style={{ color: 'var(--foreground-muted)' }}>Nenhuma atividade para este projeto.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar atividade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg px-2.5 py-1.5 text-[0.75rem] outline-none mb-1"
            style={{ background: 'var(--background)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
          />

          <div
            className="flex flex-col overflow-y-auto rounded-lg"
            style={{ maxHeight: '160px', border: '1px solid var(--card-border)', background: 'var(--background)' }}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[0.7rem] italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum resultado.</p>
            ) : (
              filtered.map(card => {
                const isSelected = selectedCardId === card.id
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onSelect(isSelected ? null : card.id)}
                    className="flex items-start gap-2 px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                    style={{
                      background: isSelected ? 'rgba(57,255,20,0.08)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span
                      className="mt-0.5 shrink-0 rounded px-1 py-0.5 text-[0.6rem] font-bold"
                      style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}
                    >
                      #{card.card_number}
                    </span>
                    <p className="text-[0.75rem] font-medium leading-snug" style={{ color: 'var(--foreground)' }}>
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

// ─── Add Entry Form ───────────────────────────────────────────────────────────

interface AddFormProps {
  userId: string
  date: string
  projects: ProjectWithRefs[]
  onSaved: () => void
  onCancel: () => void
}

function AddEntryForm({ userId, date, projects, onSaved, onCancel }: AddFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([])
  const [form, setForm] = useState({
    date,
    start_time: '',
    hours: '',
    minutes_part: '',
    description: '',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--background)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.5rem',
    padding: '0.45rem 0.65rem',
    fontSize: '0.8rem',
    color: 'var(--foreground)',
    outline: 'none',
  }

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
        user_id: userId,
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Data + início */}
      <div className="flex gap-2">
        <div style={{ flex: 1 }}>
          <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Data</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Início</label>
          <input type="time" style={inputStyle} value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
        </div>
      </div>

      {/* Duração */}
      <div>
        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Tempo trabalhado *</label>
        <div className="flex gap-2">
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="number" min="0" max="23" placeholder="0" style={inputStyle} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>h</span>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="number" min="0" max="59" placeholder="0" style={inputStyle} value={form.minutes_part} onChange={e => setForm(f => ({ ...f, minutes_part: e.target.value }))} />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>min</span>
          </div>
        </div>
      </div>

      {/* Projeto */}
      <div>
        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Projeto</label>
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
        <PanelCardSelectorMulti
          projectId={selectedProjectId}
          selectedCardIds={selectedCardIds}
          onToggle={toggleCard}
        />
      )}

      {/* Descrição */}
      <div>
        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Descrição</label>
        <textarea
          style={{ ...inputStyle, resize: 'none', minHeight: '56px' }}
          placeholder="O que você fez?"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      {error && <p className="text-[0.7rem]" style={{ color: '#ff4d4f' }}>{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}>
          {saving ? 'Salvando…' : selectedCardIds.length > 1 ? `Salvar ${selectedCardIds.length}` : 'Salvar'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── Edit Entry Form ──────────────────────────────────────────────────────────

interface EditFormProps {
  entry: AgendaEntryWithRefs
  projects: ProjectWithRefs[]
  onSaved: () => void
  onCancel: () => void
}

function EditEntryForm({ entry, projects, onSaved, onCancel }: EditFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(entry.project_id ?? '')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(entry.kanban_card_id)
  const [form, setForm] = useState({
    date: entry.date,
    start_time: entry.start_time ? entry.start_time.slice(0, 5) : '',
    hours: String(Math.floor(entry.minutes / 60)),
    minutes_part: String(entry.minutes % 60),
    description: entry.description ?? '',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--background)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.5rem',
    padding: '0.45rem 0.65rem',
    fontSize: '0.8rem',
    color: 'var(--foreground)',
    outline: 'none',
  }

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Editando registro</p>

      {/* Data + início */}
      <div className="flex gap-2">
        <div style={{ flex: 1 }}>
          <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Data</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Início</label>
          <input type="time" style={inputStyle} value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
        </div>
      </div>

      {/* Duração */}
      <div>
        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Tempo trabalhado *</label>
        <div className="flex gap-2">
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="number" min="0" max="23" placeholder="0" style={inputStyle} value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>h</span>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input type="number" min="0" max="59" placeholder="0" style={inputStyle} value={form.minutes_part} onChange={e => setForm(f => ({ ...f, minutes_part: e.target.value }))} />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>min</span>
          </div>
        </div>
      </div>

      {/* Projeto */}
      <div>
        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Projeto</label>
        <select
          style={inputStyle}
          value={selectedProjectId}
          onChange={e => { setSelectedProjectId(e.target.value); setSelectedCardId(null) }}
        >
          <option value="">Nenhum projeto</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {selectedProjectId && (
        <PanelCardSelectorSingle
          projectId={selectedProjectId}
          selectedCardId={selectedCardId}
          onSelect={setSelectedCardId}
        />
      )}

      {/* Descrição */}
      <div>
        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>Descrição</label>
        <textarea
          style={{ ...inputStyle, resize: 'none', minHeight: '56px' }}
          placeholder="O que você fez?"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      {error && <p className="text-[0.7rem]" style={{ color: '#ff4d4f' }}>{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── Entry card ───────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  onDelete,
  onEdit,
}: {
  entry: AgendaEntryWithRefs
  onDelete: (id: string) => void
  onEdit: (entry: AgendaEntryWithRefs) => void
}) {
  const label = entry.kanban_card
    ? `#${entry.kanban_card.card_number} ${entry.kanban_card.name}`
    : entry.project
      ? entry.project.name
      : entry.client
        ? (entry.client as { trade_name: string }).trade_name
        : 'Registro geral'

  return (
    <div
      className="group flex gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
      style={{ border: '1px solid var(--card-border)' }}
    >
      <div className="mt-0.5 h-full w-0.5 rounded-full shrink-0" style={{ background: 'var(--primary)', minHeight: '32px', opacity: 0.7 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{label}</p>
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold" style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}>
            {fmtMinutes(entry.minutes)}
          </span>
        </div>
        {entry.start_time && (
          <p className="mt-0.5 text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>{fmtTime(entry.start_time)}</p>
        )}
        {entry.description && (
          <p className="mt-1 text-[0.65rem] leading-snug line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>{entry.description}</p>
        )}
      </div>
      <div className="mt-0.5 flex shrink-0 flex-col gap-1 opacity-0 transition-all group-hover:opacity-100">
        <button
          onClick={() => onEdit(entry)}
          className="flex h-5 w-5 items-center justify-center rounded"
          style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.06)' }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="flex h-5 w-5 items-center justify-center rounded"
          style={{ color: 'rgba(255,59,48,0.7)', background: 'rgba(255,59,48,0.08)' }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Daily time grid ──────────────────────────────────────────────────────────

function DailyTimeGrid({
  entries,
  onDelete,
  onEdit,
}: {
  entries: AgendaEntryWithRefs[]
  onDelete: (id: string) => void
  onEdit: (entry: AgendaEntryWithRefs) => void
}) {
  const withTime = entries.filter(e => e.start_time)
  const noTime = entries.filter(e => !e.start_time)

  const slotMap = new Map<number, AgendaEntryWithRefs[]>()
  withTime.forEach(e => {
    const h = parseInt(e.start_time!.slice(0, 2))
    if (!slotMap.has(h)) slotMap.set(h, [])
    slotMap.get(h)!.push(e)
  })

  return (
    <div>
      {noTime.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Sem horário</p>
          <div className="flex flex-col gap-1.5">
            {noTime.map(e => <EntryCard key={e.id} entry={e} onDelete={onDelete} onEdit={onEdit} />)}
          </div>
        </div>
      )}
      <div className="relative">
        {HOUR_SLOTS.map(h => {
          const slotEntries = slotMap.get(h) ?? []
          const hasEntries = slotEntries.length > 0
          return (
            <div key={h} className="flex gap-2" style={{ minHeight: hasEntries ? 'auto' : '32px' }}>
              <div className="shrink-0 pt-0.5 text-right" style={{ width: '28px', fontSize: '0.6rem', color: 'var(--foreground-muted)', lineHeight: 1 }}>
                {h}h
              </div>
              <div className="flex-1 border-l pb-2 pl-2.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {hasEntries ? (
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    {slotEntries.map(e => <EntryCard key={e.id} entry={e} onDelete={onDelete} onEdit={onEdit} />)}
                  </div>
                ) : (
                  <div style={{ height: '24px' }} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface Props {
  userId: string
  onClose: () => void
}

export function AgendaPanel({ userId, onClose }: Props) {
  const [, startTransition] = useTransition()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<AgendaEntryWithRefs[]>([])
  const [projects, setProjects] = useState<ProjectWithRefs[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<'add' | 'edit' | null>(null)
  const [editingEntry, setEditingEntry] = useState<AgendaEntryWithRefs | null>(null)

  const dateStr = fmtDate(currentDate)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, projectList] = await Promise.all([
        getEntriesForDay(userId, dateStr),
        projects.length === 0 ? getProjects() : Promise.resolve(projects),
      ])
      setEntries(data)
      if (projects.length === 0) setProjects(projectList)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, dateStr])

  useEffect(() => { load() }, [load])

  function goDay(delta: number) {
    setCurrentDate(d => { const nd = new Date(d); nd.setDate(d.getDate() + delta); return nd })
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este registro?')) return
    try {
      await deleteAgendaEntry(id)
      startTransition(() => load())
    } catch { alert('Erro ao excluir.') }
  }

  function handleEdit(entry: AgendaEntryWithRefs) {
    setEditingEntry(entry)
    setShowForm('edit')
  }

  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0)

  return (
    <div className="flex h-full flex-col" style={{ width: '360px', borderLeft: '1px solid var(--card-border)', background: 'var(--nav-background)' }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Agenda</span>
          {totalMinutes > 0 && (
            <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-bold" style={{ background: 'rgba(57,255,20,0.12)', color: 'var(--primary)' }}>
              {fmtMinutes(totalMinutes)}
            </span>
          )}
        </div>
        <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-white/[0.06]" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Date navigation */}
      <div className="flex shrink-0 items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <button onClick={() => goDay(-1)} className="rounded p-1 hover:bg-white/[0.06] transition-colors" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{dayLabel(currentDate)}</p>
          <p className="text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
        <button onClick={() => goDay(1)} className="rounded p-1 hover:bg-white/[0.06] transition-colors" style={{ color: 'var(--foreground-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Add / Edit form toggle */}
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <AnimatePresence initial={false}>
          {showForm === 'add' ? (
            <motion.div key="add-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <AddEntryForm
                userId={userId}
                date={dateStr}
                projects={projects}
                onSaved={() => { setShowForm(null); startTransition(() => load()) }}
                onCancel={() => setShowForm(null)}
              />
            </motion.div>
          ) : showForm === 'edit' && editingEntry ? (
            <motion.div key="edit-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <EditEntryForm
                entry={editingEntry}
                projects={projects}
                onSaved={() => { setShowForm(null); setEditingEntry(null); startTransition(() => load()) }}
                onCancel={() => { setShowForm(null); setEditingEntry(null) }}
              />
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm('add')}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all"
              style={{ border: '1px dashed rgba(57,255,20,0.3)', color: 'var(--primary)', background: 'rgba(57,255,20,0.04)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar registro
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <p className="text-center text-xs py-8" style={{ color: 'var(--foreground-muted)' }}>Carregando…</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-xs py-8 italic" style={{ color: 'var(--foreground-muted)' }}>Nenhum registro para este dia.</p>
        ) : (
          <DailyTimeGrid entries={entries} onDelete={handleDelete} onEdit={handleEdit} />
        )}
      </div>
    </div>
  )
}
