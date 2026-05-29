'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { createClient, updateClient, deleteClient } from '@/lib/actions/clients'
import { createUser } from '@/lib/actions/users'
import type { Client } from '@/types'

type ViewMode = 'list' | 'grid'

const EMPTY_FORM = { trade_name: '', cnpj: '', company_name: '', logo_url: '' }
const EMPTY_USER_FORM = { name: '', email: '', avatar_url: '' }

export function ClientsView({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [userDrawerOpen, setUserDrawerOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [userError, setUserError] = useState('')
  const [userSaving, setUserSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setDrawerOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setForm({
      trade_name: client.trade_name,
      cnpj: client.cnpj ?? '',
      company_name: client.company_name ?? '',
      logo_url: client.logo_url ?? '',
    })
    setError('')
    setDrawerOpen(true)
  }

  function openNewUser(client: Client) {
    setSelectedClient(client)
    setUserForm(EMPTY_USER_FORM)
    setUserError('')
    setUserDrawerOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.trade_name.trim()) { setError('Nome fantasia é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        trade_name: form.trade_name.trim(),
        cnpj: form.cnpj.trim() || null,
        company_name: form.company_name.trim() || null,
        logo_url: form.logo_url.trim() || null,
      }
      if (editing) {
        await updateClient(editing.id, payload)
      } else {
        await createClient(payload)
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
    if (!confirm('Excluir este cliente?')) return
    try {
      await deleteClient(id)
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir.')
    }
  }

  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient) { setUserError('Cliente não encontrado.'); return }
    if (!userForm.name.trim()) { setUserError('Nome é obrigatório.'); return }
    if (!userForm.email.trim()) { setUserError('E-mail é obrigatório.'); return }
    setUserSaving(true)
    setUserError('')
    try {
      await createUser({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: 'customer',
        client_id: selectedClient.id,
        avatar_url: userForm.avatar_url.trim() || null,
      })
      setUserDrawerOpen(false)
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setUserError(err instanceof Error ? err.message : 'Erro ao criar usuário.')
    } finally {
      setUserSaving(false)
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
        title="Clientes"
        subtitle="Gerencie sua carteira de clientes"
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
            + Novo Cliente
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

      {initialClients.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum cliente cadastrado ainda.
        </p>
      ) : viewMode === 'list' ? (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--background-secondary)' }}>
                {['Nome Fantasia', 'Razão Social', 'CNPJ', ''].map(h => (
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
              {initialClients.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: i < initialClients.length - 1 ? '1px solid var(--card-border)' : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          overflow: 'hidden', border: '1px solid var(--card-border)',
                          background: 'var(--background-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {c.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.logo_url} alt={c.trade_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                            {c.trade_name[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>{c.trade_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{c.company_name ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{c.cnpj ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onAddUser={() => openNewUser(c)} onEdit={() => openEdit(c)} onDelete={() => handleDelete(c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialClients.map(c => (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-xl border p-5"
              style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}
            >
              {c.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_url} alt={c.trade_name} className="mb-1 h-8 w-auto object-contain" />
              )}
              <p className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}>
                {c.trade_name}
              </p>
              {c.company_name && (
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{c.company_name}</p>
              )}
              {c.cnpj && (
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{c.cnpj}</p>
              )}
              <div className="mt-auto flex justify-end gap-2 pt-2">
                <RowActions onAddUser={() => openNewUser(c)} onEdit={() => openEdit(c)} onDelete={() => handleDelete(c.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Nome Fantasia *</label>
            <input
              style={inputStyle}
              value={form.trade_name}
              onChange={e => setForm(f => ({ ...f, trade_name: e.target.value }))}
              placeholder="Ex: BlackElephant"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Razão Social</label>
            <input
              style={inputStyle}
              value={form.company_name}
              onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
              placeholder="Razão social completa"
            />
          </div>
          <div>
            <label style={labelStyle}>CNPJ</label>
            <input
              style={inputStyle}
              value={form.cnpj}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 14)
                let masked = digits
                if (digits.length > 12) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`
                else if (digits.length > 8) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`
                else if (digits.length > 5) masked = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`
                else if (digits.length > 2) masked = `${digits.slice(0,2)}.${digits.slice(2)}`
                setForm(f => ({ ...f, cnpj: masked }))
              }}
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
            />
          </div>
          <div>
            <label style={labelStyle}>Logo (URL)</label>
            <input
              style={inputStyle}
              value={form.logo_url}
              onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>
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

      <Drawer
        open={userDrawerOpen}
        onClose={() => setUserDrawerOpen(false)}
        title="Novo Usuário"
      >
        <form onSubmit={handleUserSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Empresa</label>
            <input
              style={{
                ...inputStyle,
                opacity: 0.65,
                cursor: 'not-allowed',
              }}
              value={selectedClient?.trade_name ?? ''}
              disabled
              readOnly
            />
          </div>

          <div>
            <label style={labelStyle}>Foto de Perfil (URL)</label>
            <input
              style={inputStyle}
              value={userForm.avatar_url}
              onChange={e => setUserForm(f => ({ ...f, avatar_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              value={userForm.name}
              onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>E-mail *</label>
            <input
              style={inputStyle}
              type="email"
              value={userForm.email}
              onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
              placeholder="usuario@email.com"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Função</label>
            <input
              style={{
                ...inputStyle,
                opacity: 0.65,
                cursor: 'not-allowed',
              }}
              value="Customer"
              disabled
              readOnly
            />
          </div>

          {userError && (
            <p className="text-xs" style={{ color: '#ff4d4f' }}>{userError}</p>
          )}

          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
            Um e-mail de convite será enviado para o usuário definir sua senha.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={userSaving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
              style={{
                background: userSaving ? 'var(--card-border)' : 'var(--primary)',
                color: '#000',
              }}
            >
              {userSaving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setUserDrawerOpen(false)}
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

function RowActions({ onAddUser, onEdit, onDelete }: { onAddUser: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onAddUser}
        className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors"
        style={{ color: 'var(--primary)' }}
      >
        Adicionar usuário
      </button>
      <button
        onClick={onEdit}
        className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors"
        style={{ color: 'var(--foreground-muted)' }}
      >
        Editar
      </button>
      <button
        onClick={onDelete}
        className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors"
        style={{ color: '#ff4d4f' }}
      >
        Excluir
      </button>
    </div>
  )
}
