'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { createUser, updateUser, deleteUser } from '@/lib/actions/users'
import type { User, UserRole } from '@/types'

type ViewMode = 'list' | 'grid'

const EMPTY_FORM = { name: '', email: '', role: 'customer' as UserRole, avatar_url: '' }

export function UsersView({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setDrawerOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url ?? '',
    })
    setError('')
    setDrawerOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    if (!editing && !form.email.trim()) { setError('E-mail é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateUser(editing.id, {
          name: form.name.trim(),
          role: form.role,
          avatar_url: form.avatar_url.trim() || null,
        })
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          avatar_url: form.avatar_url.trim() || null,
        })
      }
      setDrawerOpen(false)
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este usuário?')) return
    try {
      await deleteUser(id)
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir.')
    }
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
    <div>
      <AdminPageHeader
        title="Usuários"
        subtitle="Gerencie os usuários da plataforma"
        action={
          <button
            onClick={openNew}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={{
              background: 'var(--primary)',
              color: '#000',
              boxShadow: '0 0 16px rgba(57,255,20,0.4)',
            }}
          >
            + Novo Usuário
          </button>
        }
      />

      {/* view toggle */}
      <div className="mb-5 flex items-center gap-2">
        {(['list', 'grid'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="rounded-md border p-1.5 transition-colors"
            style={{
              borderColor: viewMode === mode ? 'var(--primary)' : 'var(--card-border)',
              color: viewMode === mode ? 'var(--primary)' : 'var(--foreground-muted)',
              background: viewMode === mode ? 'rgba(57,255,20,0.07)' : 'transparent',
            }}
            title={mode === 'list' ? 'Lista' : 'Cards'}
          >
            {mode === 'list' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {initialUsers.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum usuário cadastrado ainda.
        </p>
      ) : viewMode === 'list' ? (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--background-secondary)' }}>
                {['Usuário', 'E-mail', 'Função', ''].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialUsers.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < initialUsers.length - 1 ? '1px solid var(--card-border)' : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size={32} />
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => openEdit(u)} onDelete={() => handleDelete(u.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialUsers.map(u => (
            <div
              key={u.id}
              className="flex flex-col items-center gap-3 rounded-xl border p-5 text-center"
              style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}
            >
              <Avatar user={u} size={56} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}>
                  {u.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--foreground-muted)' }}>{u.email}</p>
              </div>
              <RoleBadge role={u.role} />
              <div className="mt-auto flex gap-2 pt-1">
                <RowActions onEdit={() => openEdit(u)} onDelete={() => handleDelete(u.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* avatar preview */}
          <div className="flex flex-col items-center gap-3">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar_url}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover"
                style={{ border: '2px solid var(--card-border)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
                style={{ background: 'rgba(57,255,20,0.15)', color: 'var(--primary)' }}
              >
                {form.name ? form.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Foto de Perfil (URL)</label>
            <input
              style={inputStyle}
              value={form.avatar_url}
              onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>E-mail {!editing && '*'}</label>
            <input
              style={{
                ...inputStyle,
                opacity: editing ? 0.5 : 1,
                cursor: editing ? 'not-allowed' : 'text',
              }}
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="usuario@email.com"
              disabled={!!editing}
              required={!editing}
            />
            {editing && (
              <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                E-mail não pode ser alterado após o cadastro.
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Função *</label>
            <select
              style={{ ...inputStyle, appearance: 'none' }}
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
              required
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>
          )}

          {!editing && (
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              Um e-mail de convite será enviado para o usuário definir sua senha.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
              style={{
                background: saving ? 'var(--card-border)' : 'var(--primary)',
                color: '#000',
              }}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
              style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

function Avatar({ user, size }: { user: User; size: number }) {
  if (user.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_url}
        alt={user.name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--card-border)',
        }}
      />
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(57,255,20,0.15)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const isAdmin = role === 'admin'
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
      style={{
        background: isAdmin ? 'rgba(57,255,20,0.12)' : 'rgba(148,163,184,0.12)',
        color: isAdmin ? 'var(--primary)' : 'var(--foreground-muted)',
        border: `1px solid ${isAdmin ? 'rgba(57,255,20,0.25)' : 'var(--card-border)'}`,
      }}
    >
      {role}
    </span>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="rounded px-2 py-1 text-xs transition-colors"
        style={{ color: 'var(--foreground-muted)' }}
      >
        Editar
      </button>
      <button
        onClick={onDelete}
        className="rounded px-2 py-1 text-xs transition-colors"
        style={{ color: '#ff4d4f' }}
      >
        Excluir
      </button>
    </div>
  )
}
