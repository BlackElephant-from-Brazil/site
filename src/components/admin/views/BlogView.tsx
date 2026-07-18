'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Drawer } from '@/components/admin/Drawer'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/actions/blog-posts'
import { uploadBlogImage } from '@/lib/actions/uploads'
import { slugify } from '@/lib/utils/slugify'
import type { BlogPostWithAuthor } from '@/types'

const EMPTY_FORM = {
  slug: '',
  title: '',
  excerpt: '',
  keywords: '',
  cover_image_url: '',
  content_html: '',
  published_at: '',
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function BlogView({ initialPosts }: { initialPosts: BlogPostWithAuthor[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<BlogPostWithAuthor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, published_at: toDatetimeLocal(new Date().toISOString()) })
    setSlugTouched(false)
    setError('')
    setDrawerOpen(true)
  }

  function openEdit(post: BlogPostWithAuthor) {
    setEditing(post)
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      keywords: post.keywords.join(', '),
      cover_image_url: post.cover_image_url ?? '',
      content_html: post.content_html,
      published_at: toDatetimeLocal(post.published_at),
    })
    setSlugTouched(true)
    setError('')
    setDrawerOpen(true)
  }

  function handleTitleChange(value: string) {
    setForm(f => ({ ...f, title: value, slug: slugTouched ? f.slug : slugify(value) }))
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const url = await uploadBlogImage(formData)
      setForm(f => ({ ...f, cover_image_url: url }))
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título é obrigatório.'); return }
    if (!form.slug.trim()) { setError('Slug é obrigatório.'); return }
    if (!form.excerpt.trim()) { setError('Resumo é obrigatório.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        slug: slugify(form.slug),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        cover_image_url: form.cover_image_url.trim() || null,
        content_html: form.content_html,
        published_at: new Date(form.published_at).toISOString(),
      }
      if (editing) {
        await updateBlogPost(editing.id, payload)
      } else {
        await createBlogPost(payload)
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
    if (!confirm('Excluir este post?')) return
    try {
      await deleteBlogPost(id)
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
        title="Blog"
        subtitle="Gerencie os posts do blog"
        action={
          <button
            onClick={openNew}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
            style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', boxShadow: 'var(--shadow-soft)' }}
          >
            + Novo Post
          </button>
        }
      />

      {initialPosts.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhum post cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--background-secondary)' }}>
                {['Capa', 'Título', 'Autor', 'Publicação', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialPosts.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < initialPosts.length - 1 ? '1px solid var(--card-border)' : undefined }}>
                  <td className="px-4 py-3">
                    <div
                      style={{
                        width: 48, height: 32, borderRadius: '0.375rem', flexShrink: 0,
                        overflow: 'hidden', border: '1px solid var(--card-border)',
                        background: 'var(--background-secondary)',
                      }}
                    >
                      {p.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.cover_image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{p.title}</span>
                    <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>{p.author?.name ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>
                    {new Date(p.published_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Editar Post' : 'Novo Post'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Título *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Título do post" required />
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <input
              style={inputStyle}
              value={form.slug}
              onChange={e => { setSlugTouched(true); setForm(f => ({ ...f, slug: e.target.value })) }}
              placeholder="titulo-do-post"
            />
          </div>

          <div>
            <label style={labelStyle}>Resumo *</label>
            <textarea
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="Resumo/descrição do post"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Palavras-chave (separadas por vírgula)</label>
            <input
              style={inputStyle}
              value={form.keywords}
              onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
              placeholder="marketing, design, tecnologia"
            />
          </div>

          <div>
            <label style={labelStyle}>Autor</label>
            <input style={{ ...inputStyle, opacity: 0.65, cursor: 'not-allowed' }} value={editing?.author?.name ?? 'Você (usuário logado)'} disabled readOnly />
          </div>

          <div>
            <label style={labelStyle}>Data de publicação</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={form.published_at}
              onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Imagem de capa</label>
            {form.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.cover_image_url} alt="capa" className="mb-2 h-28 w-auto rounded-lg object-cover" style={{ border: '1px solid var(--card-border)' }} />
            )}
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="text-xs" style={{ color: 'var(--foreground-muted)' }} />
            {uploadingCover && <p className="mt-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>Enviando...</p>}
          </div>

          <div>
            <label style={labelStyle}>Artigo completo *</label>
            <RichTextEditor content={form.content_html} onChange={html => setForm(f => ({ ...f, content_html: html }))} />
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
              style={{ background: saving ? 'var(--card-border)' : 'var(--primary)', color: 'var(--primary-contrast)' }}
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
      <button onClick={onDelete} className="whitespace-nowrap rounded px-2 py-1 text-xs transition-colors" style={{ color: 'var(--color-error)' }}>Excluir</button>
    </div>
  )
}
