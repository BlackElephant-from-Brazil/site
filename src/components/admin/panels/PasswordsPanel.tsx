'use client'

import { useState, useEffect, useTransition } from 'react'
import { fetchUserPasswords, createUserPassword, updateUserPassword, deleteUserPassword } from '@/lib/actions/user-passwords'
import type { UserPassword } from '@/types'

function PasswordItem({
  entry,
  onDelete,
  onEdit,
}: {
  entry: UserPassword
  onDelete: (id: string) => void
  onEdit: (entry: UserPassword) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(entry.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="group flex flex-col gap-1.5 rounded-lg p-3 transition-colors"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{entry.service_name}</p>
          {entry.username && (
            <p className="truncate text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>{entry.username}</p>
          )}
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-[0.6rem] underline transition-colors"
              style={{ color: 'var(--color-lime)', opacity: 0.7, display: 'block', maxWidth: 180 }}
              onClick={e => e.stopPropagation()}
            >
              {entry.url}
            </a>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="flex h-6 w-6 items-center justify-center rounded opacity-60 transition-all hover:opacity-100"
            style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex h-6 w-6 items-center justify-center rounded opacity-60 transition-all hover:opacity-100"
            style={{ color: 'rgba(255,59,48,0.8)', background: 'rgba(255,59,48,0.08)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-md px-2 py-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <span className="flex-1 font-mono text-[0.65rem]" style={{ color: 'var(--foreground-muted)' }}>
          {revealed ? entry.password : '••••••••••'}
        </span>
        <button
          onClick={() => setRevealed(v => !v)}
          className="flex h-5 w-5 items-center justify-center rounded opacity-70 transition-all hover:opacity-100"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {revealed ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
        <button
          onClick={handleCopy}
          className="flex h-5 w-5 items-center justify-center rounded opacity-70 transition-all hover:opacity-100"
          style={{ color: copied ? 'var(--color-lime)' : 'var(--foreground-muted)' }}
        >
          {copied ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

const EMPTY_FORM = { service_name: '', username: '', password: '', url: '' }

interface Props {
  userId: string
  onClose: () => void
}

export function PasswordsPanel({ userId, onClose }: Props) {
  const [passwords, setPasswords] = useState<UserPassword[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPass, setShowPass] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchUserPasswords(userId).then(setPasswords).finally(() => setLoading(false))
  }, [userId])

  function handleEdit(entry: UserPassword) {
    setEditingId(entry.id)
    setForm({ service_name: entry.service_name, username: entry.username ?? '', password: entry.password, url: entry.url ?? '' })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function handleDelete(id: string) {
    setPasswords(prev => prev.filter(p => p.id !== id))
    startTransition(() => deleteUserPassword(id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.service_name.trim() || !form.password.trim()) return
    startTransition(async () => {
      if (editingId) {
        await updateUserPassword(editingId, {
          service_name: form.service_name.trim(),
          username: form.username.trim() || null,
          password: form.password,
          url: form.url.trim() || null,
        })
        setPasswords(prev => prev.map(p => p.id === editingId
          ? { ...p, service_name: form.service_name.trim(), username: form.username.trim() || null, password: form.password, url: form.url.trim() || null }
          : p
        ))
      } else {
        const created = await createUserPassword(userId, form.service_name.trim(), form.password, form.username.trim() || undefined, form.url.trim() || undefined)
        setPasswords(prev => [...prev, created].sort((a, b) => a.service_name.localeCompare(b.service_name)))
      }
      handleCancel()
    })
  }

  return (
    <div className="flex h-full flex-col" style={{ width: 320, borderLeft: '1px solid var(--card-border)', background: 'var(--nav-background)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-lime)' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Senhas</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(v => !v) }}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--color-lime)', background: 'rgba(57,255,20,0.1)' }}
            title="Nova senha"
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
              {editingId ? 'Editar senha' : 'Nova senha'}
            </p>
            {[
              { key: 'service_name', placeholder: 'Serviço *', required: true, type: 'text' },
              { key: 'username', placeholder: 'Usuário / E-mail', required: false, type: 'text' },
              { key: 'url', placeholder: 'URL (opcional)', required: false, type: 'url' },
            ].map(field => (
              <input
                key={field.key}
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full rounded-md border px-2.5 py-1.5 text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              />
            ))}
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Senha *"
                required
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-md border px-2.5 py-1.5 pr-8 text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  }
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-md py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: 'var(--color-lime)', color: '#000' }}
              >
                {isPending ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-md py-1.5 text-xs font-medium"
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
        ) : passwords.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--foreground-muted)', marginBottom: 8 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Nenhuma senha salva</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {passwords.map(entry => (
              <PasswordItem key={entry.id} entry={entry} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
