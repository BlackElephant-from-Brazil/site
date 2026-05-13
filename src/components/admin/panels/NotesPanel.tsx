'use client'

import { useState, useEffect, useTransition, useRef, useCallback } from 'react'
import { fetchUserNotes, createUserNote, updateUserNote, updateUserNoteColor, deleteUserNote } from '@/lib/actions/user-notes'
import type { UserNote } from '@/types'

const NOTE_COLORS = [
  { value: '#2a2a1a', label: 'Amarelo escuro' },
  { value: '#0a2a0a', label: 'Verde escuro' },
  { value: '#0a1a2a', label: 'Azul escuro' },
  { value: '#1a0a2a', label: 'Roxo escuro' },
  { value: '#2a0a0a', label: 'Vermelho escuro' },
  { value: '#1c1c1c', label: 'Cinza' },
]

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderMarkdown(content: string): string {
  if (!content.trim()) return '<span style="opacity:0.4;font-size:0.7rem;">Nota vazia — clique para editar</span>'
  const escaped = escapeHtml(content)
  return escaped
    .replace(/^### (.+)$/gm, '<strong style="font-size:0.8rem">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="font-size:0.85rem">$1</strong>')
    .replace(/^# (.+)$/gm, '<strong style="font-size:0.9rem">$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 4px;border-radius:3px;font-size:0.7rem">$1</code>')
    .replace(/\n/g, '<br/>')
}

function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.slice(start, end) || placeholder
  const newValue = textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end)
  const newPos = start + before.length + selected.length + after.length
  return { newValue, newPos }
}

interface NoteCardProps {
  note: UserNote
  onUpdate: (id: string, content: string) => void
  onColorChange: (id: string, color: string) => void
  onDelete: (id: string) => void
}

function NoteCard({ note, onUpdate, onColorChange, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    setContent(value)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onUpdate(note.id, value), 800)
  }

  function handleBlur() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    onUpdate(note.id, content)
    setEditing(false)
  }

  function insertFormat(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current
    if (!ta) return
    const { newValue, newPos } = insertAtCursor(ta, before, after, placeholder)
    setContent(newValue)
    onUpdate(note.id, newValue)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(newPos, newPos)
    })
  }

  return (
    <div
      className="group relative flex flex-col rounded-lg"
      style={{
        background: note.color,
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: 120,
      }}
    >
      <button
        onClick={() => onDelete(note.id)}
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100"
        style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.3)' }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex-1 p-2.5 pt-2" onClick={() => { setEditing(true); requestAnimationFrame(() => textareaRef.current?.focus()) }}>
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              {[
                { label: 'B', before: '**', after: '**', ph: 'texto' },
                { label: 'I', before: '*', after: '*', ph: 'texto' },
                { label: 'H', before: '## ', after: '', ph: 'título' },
                { label: '`', before: '`', after: '`', ph: 'código' },
              ].map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); insertFormat(btn.before, btn.after, btn.ph) }}
                  className="flex h-5 w-5 items-center justify-center rounded text-[0.6rem] font-bold transition-colors"
                  style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.7)' }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => handleChange(e.target.value)}
              onBlur={handleBlur}
              rows={5}
              className="w-full resize-none bg-transparent text-xs outline-none"
              style={{ color: 'rgba(255,255,255,0.9)', caretColor: 'var(--color-lime)' }}
              placeholder="Escreva sua nota em markdown..."
            />
          </div>
        ) : (
          <div
            className="text-xs leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.85)', minHeight: 60, cursor: 'text' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>

      <div className="flex items-center gap-1 px-2.5 pb-2">
        {NOTE_COLORS.map(c => (
          <button
            key={c.value}
            onClick={() => onColorChange(note.id, c.value)}
            title={c.label}
            className="h-3 w-3 rounded-full border transition-transform hover:scale-125"
            style={{
              background: c.value,
              borderColor: note.color === c.value ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface Props {
  userId: string
  onClose: () => void
}

export function NotesPanel({ userId, onClose }: Props) {
  const [notes, setNotes] = useState<UserNote[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchUserNotes(userId).then(setNotes).finally(() => setLoading(false))
  }, [userId])

  function handleCreate() {
    startTransition(async () => {
      const note = await createUserNote(userId)
      setNotes(prev => [note, ...prev])
    })
  }

  function handleUpdate(id: string, content: string) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n))
    startTransition(() => updateUserNote(id, content))
  }

  function handleColorChange(id: string, color: string) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n))
    startTransition(() => updateUserNoteColor(id, color))
  }

  function handleDelete(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id))
    startTransition(() => deleteUserNote(id))
  }

  return (
    <div className="flex h-full flex-col" style={{ width: 320, borderLeft: '1px solid var(--card-border)', background: 'var(--nav-background)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-lime)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Notas</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--color-lime)', background: 'rgba(57,255,20,0.1)' }}
            title="Nova nota"
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

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10" style={{ borderTopColor: 'var(--color-lime)' }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--foreground-muted)', marginBottom: 8 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Nenhuma nota ainda</p>
            <button
              onClick={handleCreate}
              className="mt-3 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
              style={{ background: 'var(--color-lime)', color: '#000' }}
            >
              Criar primeira nota
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdate}
                onColorChange={handleColorChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
