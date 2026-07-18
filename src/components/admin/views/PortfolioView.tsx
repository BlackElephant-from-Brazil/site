'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import {
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  addPortfolioImages,
  setPortfolioCovers,
  deletePortfolioImage,
} from '@/lib/actions/portfolio'
import { uploadPortfolioImage } from '@/lib/actions/uploads'
import { slugify } from '@/lib/utils/slugify'
import type { PortfolioItemWithRefs, PortfolioImage, ProjectType } from '@/types'

const MAX_IMAGES = 20
const REQUIRED_COVERS = 4

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  keywords: '',
  project_type_id: '',
}

interface Props {
  initialItems: PortfolioItemWithRefs[]
  projectTypes: ProjectType[]
}

export function PortfolioView({ initialItems, projectTypes }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<PortfolioItemWithRefs | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [selectedCovers, setSelectedCovers] = useState<Set<string>>(new Set())
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageError, setImageError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImages([])
    setSelectedCovers(new Set())
    setSlugTouched(false)
    setError('')
    setImageError('')
    setDrawerOpen(true)
  }

  function openEdit(item: PortfolioItemWithRefs) {
    setEditing(item)
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      keywords: item.keywords.join(', '),
      project_type_id: item.project_type_id ?? '',
    })
    setImages(item.images)
    setSelectedCovers(new Set(item.images.filter(i => i.is_cover).map(i => i.id)))
    setSlugTouched(true)
    setError('')
    setImageError('')
    setDrawerOpen(true)
  }

  function handleTitleChange(value: string) {
    setForm(f => ({ ...f, title: value, slug: slugTouched ? f.slug : slugify(value) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    if (!form.slug.trim()) { setError('Slug é obrigatório.'); return }
    if (!form.description.trim()) { setError('Descrição é obrigatória.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug),
        description: form.description.trim(),
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        project_type_id: form.project_type_id || null,
      }
      if (editing) {
        await updatePortfolioItem(editing.id, payload)
      } else {
        const created = await createPortfolioItem(payload)
        setEditing(created)
      }
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleImagesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !editing) return
    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`Limite de ${MAX_IMAGES} imagens por item.`)
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }
    setUploadingImages(true)
    setImageError('')
    try {
      const urls: string[] = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        urls.push(await uploadPortfolioImage(formData))
      }
      const newImages = await addPortfolioImages(editing.id, urls)
      setImages(prev => [...prev, ...newImages])
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Erro ao enviar imagens.')
    } finally {
      setUploadingImages(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  function toggleCover(imageId: string) {
    setSelectedCovers(prev => {
      const next = new Set(prev)
      if (next.has(imageId)) next.delete(imageId)
      else next.add(imageId)
      return next
    })
  }

  async function handleSaveCovers() {
    if (!editing) return
    if (selectedCovers.size !== REQUIRED_COVERS) {
      setImageError(`Selecione exatamente ${REQUIRED_COVERS} imagens de capa.`)
      return
    }
    try {
      await setPortfolioCovers(editing.id, Array.from(selectedCovers))
      setImages(prev => prev.map(img => ({ ...img, is_cover: selectedCovers.has(img.id) })))
      setImageError('')
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Erro ao definir capas.')
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      await deletePortfolioImage(imageId)
      setImages(prev => prev.filter(i => i.id !== imageId))
      setSelectedCovers(prev => {
        const next = new Set(prev)
        next.delete(imageId)
        return next
      })
      startTransition(() => router.refresh())
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Erro ao excluir imagem.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este item de portfólio?')) return
    try {
      await deletePortfolioItem(id)
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
        title="Portfólio"
        subtitle="Gerencie os itens de portfólio"
        action={
          <button
            onClick={openNew}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', boxShadow: 'var(--shadow-soft)' }}
          >
            + Novo Item
          </button>
        }
      />

      {initialItems.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum item de portfólio cadastrado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialItems.map(item => {
            const cover = item.images.find(i => i.is_cover) ?? item.images[0]
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border p-5"
                style={{ borderColor: 'var(--card-border)', background: 'var(--background-secondary)' }}
              >
                <div
                  style={{
                    width: '100%', height: 140, borderRadius: '0.5rem', overflow: 'hidden',
                    background: 'var(--background)', border: '1px solid var(--card-border)',
                  }}
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <p className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}>{item.title}</p>
                {item.project_type && <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.project_type.name}</p>}
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{item.images.length} imagem(ns)</p>
                <div className="mt-auto flex justify-end gap-2 pt-2">
                  <RowActions onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Editar Item de Portfólio' : 'Novo Item de Portfólio'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Título *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Título do item" required />
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <input
              style={inputStyle}
              value={form.slug}
              onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: e.target.value })) }}
              placeholder="titulo-do-item"
            />
          </div>

          <div>
            <label style={labelStyle}>Descrição *</label>
            <textarea
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descrição do item"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Palavras-chave (separadas por vírgula)</label>
            <input
              style={inputStyle}
              value={form.keywords}
              onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
              placeholder="e-commerce, branding, ux"
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

          {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
              style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: 'var(--primary-contrast)' }}
            >
              {saving ? 'Salvando…' : editing ? 'Salvar dados' : 'Criar item'}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm transition-colors"
              style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
            >
              Fechar
            </button>
          </div>
        </form>

        {editing && (
          <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--card-border)' }}>
            <div className="mb-3 flex items-center justify-between">
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Imagens ({images.length}/{MAX_IMAGES})
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImages || images.length >= MAX_IMAGES}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--primary)', opacity: images.length >= MAX_IMAGES ? 0.5 : 1 }}
              >
                {uploadingImages ? 'Enviando...' : '+ adicionar imagens'}
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesSelected} />
            </div>

            <p className="mb-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
              Marque exatamente {REQUIRED_COVERS} imagens para usar como capa no site. Selecionadas: {selectedCovers.size}/{REQUIRED_COVERS}
            </p>

            {images.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {images.map(img => {
                  const isCover = selectedCovers.has(img.id)
                  return (
                    <div key={img.id} className="relative">
                      <button
                        type="button"
                        onClick={() => toggleCover(img.id)}
                        className="block w-full overflow-hidden rounded-lg"
                        style={{
                          border: `2px solid ${isCover ? 'var(--primary)' : 'var(--card-border)'}`,
                          boxShadow: isCover ? '0 0 12px rgba(31,111,107,0.3)' : undefined,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.image_url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                      </button>
                      {isCover && (
                        <span
                          className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[0.6rem] font-bold"
                          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)' }}
                        >
                          CAPA
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs"
                        style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--color-error)' }}
                        aria-label="Excluir imagem"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {imageError && <p className="mb-2 text-xs" style={{ color: 'var(--color-error)' }}>{imageError}</p>}

            <button
              type="button"
              onClick={handleSaveCovers}
              className="w-full rounded-lg py-2 text-sm font-semibold transition-all"
              style={{ background: 'rgba(31,111,107,0.1)', color: 'var(--primary)', border: '1px solid rgba(31,111,107,0.3)' }}
            >
              Salvar capas
            </button>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={onEdit} className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors" style={{ color: 'var(--foreground-muted)' }}>Editar</button>
      <button onClick={onDelete} className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors" style={{ color: 'var(--color-error)' }}>Excluir</button>
    </div>
  )
}
