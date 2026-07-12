'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { createPricingPlan, updatePricingPlan, deletePricingPlan } from '@/lib/actions/pricing-plans'
import type { PricingPlanWithRefs, ProjectType } from '@/types'

const EMPTY_FORM = {
  name: '',
  price: '',
  project_type_id: '',
}

interface Props {
  initialPlans: PricingPlanWithRefs[]
  projectTypes: ProjectType[]
}

export function PricingPlansView({ initialPlans, projectTypes }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<PricingPlanWithRefs | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [benefits, setBenefits] = useState<string[]>([])
  const [benefitDraft, setBenefitDraft] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setBenefits([])
    setBenefitDraft('')
    setError('')
    setDrawerOpen(true)
  }

  function openEdit(plan: PricingPlanWithRefs) {
    setEditing(plan)
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      project_type_id: plan.project_type_id ?? '',
    })
    setBenefits(plan.benefits.map(b => b.label))
    setBenefitDraft('')
    setError('')
    setDrawerOpen(true)
  }

  function addBenefit() {
    if (!benefitDraft.trim()) return
    setBenefits(prev => [...prev, benefitDraft.trim()])
    setBenefitDraft('')
  }

  function removeBenefit(index: number) {
    setBenefits(prev => prev.filter((_, i) => i !== index))
  }

  function moveBenefit(index: number, direction: -1 | 1) {
    setBenefits(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return next
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.price) { setError('Preço é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        project_type_id: form.project_type_id || null,
        benefits,
      }
      if (editing) {
        await updatePricingPlan(editing.id, payload)
      } else {
        await createPricingPlan(payload)
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
    if (!confirm('Excluir este plano?')) return
    try {
      await deletePricingPlan(id)
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
        title="Planos e Preços"
        subtitle="Gerencie os planos e preços"
        action={
          <button
            onClick={openNew}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={{ background: 'var(--primary)', color: '#000', boxShadow: '0 0 16px rgba(57,255,20,0.4)' }}
          >
            + Novo Plano
          </button>
        }
      />

      {initialPlans.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum plano cadastrado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialPlans.map(plan => (
            <div
              key={plan.id}
              className="flex flex-col gap-2 rounded-xl border p-5"
              style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}
            >
              <p className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}>{plan.name}</p>
              {plan.project_type && <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{plan.project_type.name}</p>}
              <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{plan.benefits.length} benefício(s)</p>
              <div className="mt-auto flex justify-end gap-2 pt-2">
                <RowActions onEdit={() => openEdit(plan)} onDelete={() => handleDelete(plan.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Editar Plano' : 'Novo Plano'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do plano" required />
          </div>

          <div>
            <label style={labelStyle}>Preço (R$) *</label>
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Tipo de Serviço</label>
            <select
              style={inputStyle}
              value={form.project_type_id}
              onChange={e => setForm(f => ({ ...f, project_type_id: e.target.value }))}
            >
              <option value="">Sem tipo</option>
              {projectTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Itens de benefício</label>
            <div className="mb-2 flex gap-2">
              <input
                style={inputStyle}
                value={benefitDraft}
                onChange={e => setBenefitDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit() } }}
                placeholder="Ex: Suporte prioritário"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold"
                style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--primary)', border: '1px solid rgba(57,255,20,0.3)' }}
              >
                + add
              </button>
            </div>
            {benefits.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {benefits.map((label, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5"
                    style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>{label}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveBenefit(i, -1)} disabled={i === 0} className="text-xs" style={{ color: 'var(--foreground-muted)', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                      <button type="button" onClick={() => moveBenefit(i, 1)} disabled={i === benefits.length - 1} className="text-xs" style={{ color: 'var(--foreground-muted)', opacity: i === benefits.length - 1 ? 0.3 : 1 }}>↓</button>
                      <button type="button" onClick={() => removeBenefit(i)} className="text-xs" style={{ color: '#ff4d4f' }}>×</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-xs" style={{ color: '#ff4d4f' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
              style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: '#000' }}
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

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={onEdit} className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors" style={{ color: 'var(--foreground-muted)' }}>Editar</button>
      <button onClick={onDelete} className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors" style={{ color: '#ff4d4f' }}>Excluir</button>
    </div>
  )
}
