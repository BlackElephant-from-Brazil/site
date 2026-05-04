'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { createProjectType, updateProjectType, deleteProjectType } from '@/lib/actions/project-types'
import type { ProjectType } from '@/types'

const EMPTY_FORM = { name: '', is_internal: false, is_recurring: false, one_time_value: '', recurring_value: '' }

function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 transition-all duration-200"
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
        boxShadow: checked ? '0 0 10px rgba(57,255,20,0.4)' : undefined,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: checked ? '#000' : 'rgba(255,255,255,0.5)',
          transition: 'left 0.2s',
          display: 'block',
        }}
      />
    </button>
  )
}

const fmt = (v: number | null) =>
  v != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '—'

export function ProjectTypesView({ initialTypes }: { initialTypes: ProjectType[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState('Novo Tipo de Projeto')
  const [editing, setEditing] = useState<ProjectType | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDrawerTitle('Novo Tipo de Projeto')
    setError('')
    setDrawerOpen(true)
  }

  function openEdit(pt: ProjectType) {
    setEditing(pt)
    setForm({
      name: pt.name,
      is_internal: pt.is_internal,
      is_recurring: pt.is_recurring,
      one_time_value: pt.one_time_value?.toString() ?? '',
      recurring_value: pt.recurring_value?.toString() ?? '',
    })
    setDrawerTitle('Editar Tipo')
    setError('')
    setDrawerOpen(true)
  }

  function openDuplicate(pt: ProjectType) {
    setEditing(null)
    setForm({
      name: `${pt.name} (cópia)`,
      is_internal: pt.is_internal,
      is_recurring: pt.is_recurring,
      one_time_value: pt.one_time_value?.toString() ?? '',
      recurring_value: pt.recurring_value?.toString() ?? '',
    })
    setDrawerTitle('Duplicar Tipo')
    setError('')
    setDrawerOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        is_internal: form.is_internal,
        is_recurring: form.is_internal ? false : form.is_recurring,
        one_time_value: form.is_internal ? null : (form.one_time_value ? parseFloat(form.one_time_value) : null),
        recurring_value: form.is_internal ? null : (form.recurring_value ? parseFloat(form.recurring_value) : null),
      }
      if (editing) {
        await updateProjectType(editing.id, payload)
      } else {
        await createProjectType(payload)
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
    if (!confirm('Excluir este tipo de projeto?')) return
    try {
      await deleteProjectType(id)
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
        title="Tipos de Projeto"
        subtitle="Defina os tipos de serviço oferecidos pela agência"
        action={
          <button
            onClick={openNew}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: 'var(--primary)', color: '#000', boxShadow: '0 0 16px rgba(57,255,20,0.4)' }}
          >
            + Novo Tipo
          </button>
        }
      />

      {initialTypes.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum tipo de projeto cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--background-secondary)' }}>
                {['Nome', 'Recorrente', 'Valor Avulso', 'Mensalidade', 'Ações'].map(h => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${h === 'Ações' ? 'text-center' : 'text-left'}`}
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialTypes.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < initialTypes.length - 1 ? '1px solid var(--card-border)' : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{t.name}</td>
                  <td className="px-4 py-3">
                    {t.is_internal ? (
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground-muted)' }}>
                        Interno
                      </span>
                    ) : (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          background: t.is_recurring ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.05)',
                          color: t.is_recurring ? 'var(--primary)' : 'var(--foreground-muted)',
                        }}
                      >
                        {t.is_recurring ? 'Recorrente' : 'Avulso'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{t.is_internal ? '—' : fmt(t.one_time_value)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{t.is_internal ? '—' : fmt(t.recurring_value)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>Editar</button>
                      <button onClick={() => openDuplicate(t)} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>Duplicar</button>
                      <button onClick={() => handleDelete(t.id)} className="rounded px-2 py-1 text-xs" style={{ color: '#ff4d4f' }}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Site Institucional"
              required
            />
          </div>

          {/* interno switch */}
          <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Interno
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Sem faturamento associado
              </p>
            </div>
            <Switch
              checked={form.is_internal}
              onChange={v => setForm(f => ({ ...f, is_internal: v }))}
            />
          </div>

          {/* billing fields — hidden when internal */}
          {!form.is_internal && (
            <>
          {/* recorrente switch */}
          <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Projeto recorrente
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Cobrado como mensalidade
              </p>
            </div>
            <Switch
              checked={form.is_recurring}
              onChange={v => setForm(f => ({ ...f, is_recurring: v }))}
            />
          </div>

          {/* value field — toggles based on switch */}
          {form.is_recurring ? (
            <div>
              <label style={{ ...labelStyle, color: 'var(--primary)' }}>Mensalidade (R$)</label>
              <input
                style={{ ...inputStyle, borderColor: 'rgba(57,255,20,0.4)' }}
                type="number"
                step="0.01"
                min="0"
                value={form.recurring_value}
                onChange={e => setForm(f => ({ ...f, recurring_value: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Valor Avulso (R$)</label>
              <input
                style={inputStyle}
                type="number"
                step="0.01"
                min="0"
                value={form.one_time_value}
                onChange={e => setForm(f => ({ ...f, one_time_value: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          )}
            </>
          )}

          {error && <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
              style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}
            >
              {saving ? 'Salvando…' : 'Salvar'}
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
    </div>
  )
}
