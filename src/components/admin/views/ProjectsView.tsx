'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { createProject, updateProject, deleteProject } from '@/lib/actions/projects'
import { deriveAcronym } from '@/lib/utils/acronym'
import type { Client, ProjectType, ProjectWithRefs } from '@/types'

type ViewMode = 'list' | 'grid'

const EMPTY_FORM = {
  name: '',
  acronym: '',
  is_internal: false,
  client_id: '',
  project_type_id: '',
  service_value: '',
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
        boxShadow: checked ? '0 0 10px rgba(57,255,20,0.4)' : undefined,
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.2s',
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

interface Props {
  initialProjects: ProjectWithRefs[]
  clients: Client[]
  projectTypes: ProjectType[]
}

export function ProjectsView({ initialProjects, clients, projectTypes }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectWithRefs | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [acronymTouched, setAcronymTouched] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedType = projectTypes.find(t => t.id === form.project_type_id)
  const isRecurring = selectedType?.is_recurring ?? false
  const typeDefaultValue = selectedType
    ? isRecurring
      ? selectedType.recurring_value
      : selectedType.one_time_value
    : null

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setAcronymTouched(false)
    setError('')
    setDrawerOpen(true)
  }

  function openEdit(project: ProjectWithRefs) {
    setEditing(project)
    setForm({
      name: project.name,
      acronym: project.acronym,
      is_internal: project.is_internal,
      client_id: project.client_id ?? '',
      project_type_id: project.project_type_id ?? '',
      service_value: project.service_value?.toString() ?? '',
    })
    setAcronymTouched(true)
    setError('')
    setDrawerOpen(true)
  }

  function handleNameChange(value: string) {
    setForm(f => ({
      ...f,
      name: value,
      acronym: acronymTouched ? f.acronym : deriveAcronym(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.acronym.trim()) { setError('Sigla é obrigatória.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        acronym: form.acronym.trim().toUpperCase().slice(0, 3),
        is_internal: form.is_internal,
        client_id: form.is_internal ? null : (form.client_id || null),
        project_type_id: form.project_type_id || null,
        service_value: form.is_internal ? null : (form.service_value ? parseFloat(form.service_value) : null),
      }
      if (editing) {
        await updateProject(editing.id, payload)
      } else {
        await createProject(payload)
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
    if (!confirm('Excluir este projeto?')) return
    try {
      await deleteProject(id)
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
        title="Projetos"
        subtitle="Gerencie os projetos da agência"
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
            + Novo Projeto
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

      {initialProjects.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum projeto cadastrado ainda.
        </p>
      ) : viewMode === 'list' ? (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--background-secondary)' }}>
                {['Sigla', 'Nome', 'Cliente', 'Tipo', 'Valor', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialProjects.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < initialProjects.length - 1 ? '1px solid var(--card-border)' : undefined }}>
                  <td className="px-4 py-3">
                    <span
                      className="rounded px-2 py-0.5 text-xs font-bold tracking-widest"
                      style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}
                    >
                      {p.acronym}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>{p.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{p.client?.trade_name ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{p.project_type?.name ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>
                    {p.service_value != null
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.service_value)
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialProjects.map(p => (
            <div
              key={p.id}
              className="flex flex-col gap-2 rounded-xl border p-5"
              style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="rounded px-2 py-0.5 text-xs font-bold tracking-widest"
                  style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}
                >
                  {p.acronym}
                </span>
                <RowActions onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} />
              </div>
              <p className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}>{p.name}</p>
              {p.client && <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{p.client.trade_name}</p>}
              {p.project_type && <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{p.project_type.name}</p>}
              {p.service_value != null && (
                <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.service_value)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Editar Projeto' : 'Novo Projeto'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Nome do projeto"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Sigla (gerada automaticamente)</label>
            <input
              style={{ ...inputStyle, fontFamily: 'var(--font-title)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              value={form.acronym}
              onChange={e => {
                setAcronymTouched(true)
                setForm(f => ({ ...f, acronym: e.target.value.toUpperCase().slice(0, 3) }))
              }}
              placeholder="ABC"
              maxLength={3}
            />
          </div>

          {/* projeto interno switch */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Projeto interno
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                Sem cliente ou valor associado
              </p>
            </div>
            <Switch
              checked={form.is_internal}
              onChange={v => setForm(f => ({ ...f, is_internal: v, project_type_id: '', service_value: '' }))}
            />
          </div>

          {!form.is_internal && (
            <div>
              <label style={labelStyle}>Cliente</label>
              <select
                style={inputStyle}
                value={form.client_id}
                onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
              >
                <option value="">Sem cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.trade_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Tipo de Projeto</label>
            <select
              style={inputStyle}
              value={form.project_type_id}
              onChange={e => {
                const typeId = e.target.value
                const type = projectTypes.find(t => t.id === typeId)
                const autoValue = type
                  ? (type.is_recurring ? type.recurring_value : type.one_time_value)
                  : null
                setForm(f => ({
                  ...f,
                  project_type_id: typeId,
                  service_value: autoValue != null ? autoValue.toString() : f.service_value,
                }))
              }}
            >
              <option value="">Sem tipo</option>
              {projectTypes
                .filter(t => t.is_internal === form.is_internal)
                .map(t => (
                  <option key={t.id} value={t.id}>{t.name}{t.is_recurring ? ' (recorrente)' : ''}</option>
                ))}
            </select>
          </div>

          {!form.is_internal && (
            <div>
              <label style={{ ...labelStyle, color: isRecurring ? 'var(--primary)' : 'var(--foreground-muted)' }}>
                {isRecurring ? 'Valor da Mensalidade (R$)' : 'Valor do Serviço (R$)'}
                {typeDefaultValue != null && (
                  <span className="ml-2" style={{ color: 'var(--foreground-muted)', fontWeight: 400 }}>
                    (padrão: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(typeDefaultValue)})
                  </span>
                )}
              </label>
              <input
                style={{ ...inputStyle, borderColor: isRecurring ? 'rgba(57,255,20,0.35)' : undefined }}
                type="number"
                step="0.01"
                min="0"
                value={form.service_value}
                onChange={e => setForm(f => ({ ...f, service_value: e.target.value }))}
                placeholder="0,00"
              />
            </div>
          )}

          {error && <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
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

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>Editar</button>
      <button onClick={onDelete} className="rounded px-2 py-1 text-xs" style={{ color: '#ff4d4f' }}>Excluir</button>
    </div>
  )
}
