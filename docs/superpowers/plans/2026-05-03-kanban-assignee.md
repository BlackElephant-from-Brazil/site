# Kanban Assignee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar campo "Responsável" aos cards do Kanban — exibido como avatar com iniciais no card, selecionável no formulário de criação e editável na modal de detalhes; restrito a usuários admin.

**Architecture:** Nova coluna `assignee_id` em `kanban_cards` com FK para `public.users`. O join é feito em `getKanbanBoard()`. Os componentes recebem a lista de admins via prop vinda da page (server component). Não há filtro por responsável nesta versão.

**Tech Stack:** Next.js 16 App Router, Supabase (PostgreSQL + RLS), TypeScript strict, Tailwind CSS v4, Framer Motion.

---

## Mapa de Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/007_kanban_cards_add_assignee.sql` | Criar |
| `src/types/index.ts` | Modificar — `KanbanCard` + `KanbanCardWithProject` |
| `src/lib/actions/users.ts` | Modificar — nova função `getAdminUsers()` |
| `src/lib/actions/kanban-cards.ts` | Modificar — join + assinatura de `create` e `update` |
| `src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx` | Modificar — buscar e passar `adminUsers` |
| `src/components/admin/kanban/KanbanBoard.tsx` | Modificar — avatar no card + campo no drawer |
| `src/components/admin/kanban/CardDetailModal.tsx` | Modificar — select de responsável no painel lateral |
| `.claude/skills/factory-db/references/schema.md` | Modificar — registrar nova coluna |

---

## Task 1: Migration — adicionar `assignee_id` em `kanban_cards`

**Files:**
- Create: `supabase/migrations/007_kanban_cards_add_assignee.sql`

- [ ] **Step 1: Criar o arquivo de migration**

```sql
-- Migration: 007_kanban_cards_add_assignee
-- Adiciona responsável (usuário admin) ao card do Kanban.

ALTER TABLE public.kanban_cards
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_assignee ON public.kanban_cards(assignee_id);
```

- [ ] **Step 2: Aplicar no Supabase**

Abra o Supabase Studio → SQL Editor e execute o conteúdo do arquivo. Confirme que a coluna aparece em `kanban_cards` e que o índice foi criado em Database → Indexes.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_kanban_cards_add_assignee.sql
git commit -m "feat(db): add assignee_id to kanban_cards"
```

---

## Task 2: Tipos TypeScript

**Files:**
- Modify: `src/types/index.ts:63-77`

- [ ] **Step 1: Adicionar `assignee_id` em `KanbanCard` e join `assignee` em `KanbanCardWithProject`**

Substitua o bloco das interfaces Kanban (linhas 63–81) por:

```typescript
export interface KanbanCard {
  id: string
  column_id: string
  project_id: string | null
  assignee_id: string | null
  name: string
  description: string | null
  card_number: number
  position: number
  created_at: string
  updated_at: string
}

export interface KanbanCardWithProject extends KanbanCard {
  project: ProjectWithRefs | null
  assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
}

export interface KanbanColumnWithCards extends KanbanColumn {
  cards: KanbanCardWithProject[]
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npm run build
```

Esperado: erros de tipo em `kanban-cards.ts` e nos componentes (ainda não atualizados) — isso é esperado. O que não deve aparecer: erros em `index.ts` em si.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add assignee_id and assignee join to KanbanCard types"
```

---

## Task 3: Camada de dados

**Files:**
- Modify: `src/lib/actions/users.ts`
- Modify: `src/lib/actions/kanban-cards.ts`
- Modify: `src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx`

- [ ] **Step 1: Adicionar `getAdminUsers()` em `src/lib/actions/users.ts`**

Adicione esta função ao final do arquivo (antes do último `}`):

```typescript
export async function getAdminUsers(): Promise<Pick<User, 'id' | 'name' | 'avatar_url'>[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('role', 'admin')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}
```

- [ ] **Step 2: Atualizar `getKanbanBoard()` em `src/lib/actions/kanban-cards.ts`**

Substitua o select de cards (linhas 16–26):

```typescript
  const { data: cards, error: cardErr } = await supabase
    .from('kanban_cards')
    .select(`
      *,
      project:projects(
        *,
        client:clients(*),
        project_type:project_types(*)
      ),
      assignee:users(id, name, avatar_url)
    `)
    .order('position', { ascending: true })
```

- [ ] **Step 3: Atualizar `createKanbanCard()` para aceitar `assignee_id`**

Substitua a assinatura e o insert (linhas 34–66):

```typescript
export async function createKanbanCard(payload: {
  column_id: string
  name: string
  description?: string | null
  project_id?: string | null
  assignee_id?: string | null
}): Promise<KanbanCard> {
  const supabase = createAdminClient()

  // per-project sequential card number
  let card_number = 1
  if (payload.project_id) {
    const { count } = await supabase
      .from('kanban_cards')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', payload.project_id)
    card_number = (count ?? 0) + 1
  }

  // position = end of column
  const { count: posCount } = await supabase
    .from('kanban_cards')
    .select('*', { count: 'exact', head: true })
    .eq('column_id', payload.column_id)
  const position = posCount ?? 0

  const { data, error } = await supabase
    .from('kanban_cards')
    .insert({ ...payload, card_number, position })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/kanban')
  return data
}
```

- [ ] **Step 4: Atualizar `updateKanbanCard()` para aceitar `assignee_id`**

Substitua a assinatura (linha 132–146):

```typescript
export async function updateKanbanCard(
  id: string,
  payload: Partial<{
    name: string
    description: string | null
    project_id: string | null
    assignee_id: string | null
  }>
): Promise<KanbanCard> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/kanban')
  return data
}
```

- [ ] **Step 5: Atualizar `kanban/page.tsx` para buscar e passar `adminUsers`**

Substitua o arquivo inteiro:

```typescript
import { setRequestLocale } from 'next-intl/server'
import { getKanbanBoard } from '@/lib/actions/kanban-cards'
import { getProjects } from '@/lib/actions/projects'
import { getAdminUsers } from '@/lib/actions/users'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function KanbanPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projectsWithRefs, adminUsers] = await Promise.all([
    getKanbanBoard(),
    getProjects(),
    getAdminUsers(),
  ])
  return <KanbanBoard initialBoard={board} projects={projectsWithRefs} adminUsers={adminUsers} />
}
```

- [ ] **Step 6: Verificar build**

```bash
npm run build
```

Esperado: erros de tipo em `KanbanBoard.tsx` e `CardDetailModal.tsx` (prop `adminUsers` não recebida ainda). Erros em `users.ts` e `kanban-cards.ts` não devem aparecer.

- [ ] **Step 7: Commit**

```bash
git add src/lib/actions/users.ts src/lib/actions/kanban-cards.ts src/app/[locale]/\(member\)/dashboard/admin/kanban/page.tsx
git commit -m "feat(data): add getAdminUsers, assignee join in board, update card create/update signatures"
```

---

## Task 4: UI — Avatar do responsável no card

**Files:**
- Modify: `src/components/admin/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Adicionar helper `getInitials` e atualizar Props**

No topo do arquivo, após os imports existentes, adicione o helper:

```typescript
function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
```

Substitua a interface `Props`:

```typescript
interface Props {
  initialBoard: KanbanColumnWithCards[]
  projects: Project[]
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
}
```

Atualize a assinatura da função:

```typescript
export function KanbanBoard({ initialBoard, projects, adminUsers }: Props) {
```

Adicione `User` ao import de tipos:

```typescript
import type { KanbanColumnWithCards, KanbanCardWithProject, Project, User } from '@/types'
```

- [ ] **Step 2: Adicionar avatar com iniciais no card**

Dentro do JSX do card (após o bloco `{card.description && ...}`), adicione:

```tsx
{card.assignee && (
  <div className="mt-2 flex justify-end">
    <div
      className="flex items-center justify-center rounded-full text-xs font-semibold"
      style={{
        width: 28,
        height: 28,
        background: 'rgba(57,255,20,0.15)',
        color: 'var(--color-lime)',
        flexShrink: 0,
      }}
      title={card.assignee.name}
    >
      {getInitials(card.assignee.name)}
    </div>
  </div>
)}
```

- [ ] **Step 3: Verificar no browser**

Rode `npm run dev` e abra `/pt/dashboard/admin/kanban`. Cards sem responsável não devem mostrar nenhuma alteração visual. Atribua um responsável via SQL no Supabase Studio para verificar o avatar:

```sql
UPDATE public.kanban_cards
SET assignee_id = (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
WHERE id = '<qualquer card id>';
```

Recarregue a página. O card deve mostrar uma bolinha verde com as iniciais no canto inferior direito. Hover na bolinha deve exibir o nome completo.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/kanban/KanbanBoard.tsx
git commit -m "feat(ui): show assignee avatar with initials on kanban card"
```

---

## Task 5: UI — Campo Responsável no formulário "Nova atividade"

**Files:**
- Modify: `src/components/admin/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Adicionar `assignee_id` ao estado do form**

Substitua a inicialização do estado `newCardForm`:

```typescript
const [newCardForm, setNewCardForm] = useState({ name: '', description: '', project_id: '', assignee_id: '' })
```

- [ ] **Step 2: Atualizar `handleCreateCard` para enviar `assignee_id`**

Substitua a chamada a `createKanbanCard` dentro de `handleCreateCard`:

```typescript
      await createKanbanCard({
        column_id: firstColumnId,
        name: newCardForm.name.trim(),
        description: newCardForm.description.trim() || null,
        project_id: newCardForm.project_id || null,
        assignee_id: newCardForm.assignee_id || null,
      })
      setDrawerOpen(false)
      setNewCardForm({ name: '', description: '', project_id: '', assignee_id: '' })
```

- [ ] **Step 3: Adicionar campo Responsável no Drawer (após o campo Projeto)**

No JSX do Drawer, após o bloco `<div>` que contém o select de Projeto, adicione:

```tsx
          <div>
            <label style={labelStyle}>Responsável</label>
            <select
              style={inputStyle}
              value={newCardForm.assignee_id}
              onChange={e => setNewCardForm(f => ({ ...f, assignee_id: e.target.value }))}
            >
              <option value="">— Sem responsável —</option>
              {adminUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
```

- [ ] **Step 4: Verificar no browser**

Clique em "Nova atividade". O drawer deve exibir o campo "Responsável" com o select populado com os admins do sistema (após o campo "Projeto"). Crie um card com responsável e verifique que o avatar aparece no quadro.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/kanban/KanbanBoard.tsx
git commit -m "feat(ui): add assignee select to new activity drawer form"
```

---

## Task 6: UI — Responsável na modal de detalhes

**Files:**
- Modify: `src/components/admin/kanban/CardDetailModal.tsx`
- Modify: `src/components/admin/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Atualizar Props e imports em `CardDetailModal.tsx`**

Substitua os imports e a interface Props:

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { updateKanbanCard, deleteKanbanCard } from '@/lib/actions/kanban-cards'
import type { KanbanCardWithProject, User } from '@/types'

interface Props {
  card: KanbanCardWithProject | null
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
  onClose: () => void
  onUpdate: (card: KanbanCardWithProject) => void
  onDelete: (cardId: string) => void
}

export function CardDetailModal({ card, adminUsers, onClose, onUpdate, onDelete }: Props) {
```

- [ ] **Step 2: Adicionar estado `assigneeId` e sincronizá-lo com o card**

Após `const [saving, setSaving] = useState(false)`, adicione:

```typescript
  const [assigneeId, setAssigneeId] = useState<string>('')
```

No `useEffect` que sincroniza com `card?.id`, adicione:

```typescript
    setAssigneeId(card.assignee_id ?? '')
```

O `useEffect` completo fica:

```typescript
  useEffect(() => {
    if (!card) return
    setName(card.name)
    setDescription(card.description ?? '')
    setAssigneeId(card.assignee_id ?? '')
    setEditingName(false)
  }, [card?.id])
```

- [ ] **Step 3: Adicionar função `saveAssignee`**

Após a função `saveDescription`, adicione:

```typescript
  async function saveAssignee(value: string) {
    if (!card) return
    const newAssigneeId = value || null
    if (newAssigneeId === card.assignee_id) return
    setSaving(true)
    try {
      const updated = await updateKanbanCard(card.id, { assignee_id: newAssigneeId })
      const newAssignee = adminUsers.find(u => u.id === newAssigneeId) ?? null
      onUpdate({ ...card, ...updated, assignee: newAssignee })
    } finally {
      setSaving(false)
    }
  }
```

- [ ] **Step 4: Adicionar select de Responsável no painel lateral da modal**

No painel direito (`/* right 40% — metadata */`), após o bloco do `{card.project && ...}`, adicione:

```tsx
              {/* assignee */}
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                  Responsável
                </p>
                <select
                  className="w-full rounded-lg px-2 py-1.5 text-sm"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground)',
                    outline: 'none',
                  }}
                  value={assigneeId}
                  onChange={e => { setAssigneeId(e.target.value); saveAssignee(e.target.value) }}
                >
                  <option value="">— Sem responsável —</option>
                  {adminUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
```

- [ ] **Step 5: Passar `adminUsers` para `CardDetailModal` em `KanbanBoard.tsx`**

Substitua o trecho onde `CardDetailModal` é renderizado:

```tsx
      <CardDetailModal
        card={selectedCard}
        adminUsers={adminUsers}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
      />
```

- [ ] **Step 6: Verificar build sem erros**

```bash
npm run build
```

Esperado: build sem erros de tipo.

- [ ] **Step 7: Verificar no browser**

Abra um card clicando nele. O painel lateral direito deve exibir o campo "Responsável" com o select populado. Troque o responsável — o salvamento é automático (sem botão). Recarregue a página e confirme que o valor persiste. Confirme também que o avatar no card do quadro é atualizado após `router.refresh()`.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/kanban/CardDetailModal.tsx src/components/admin/kanban/KanbanBoard.tsx
git commit -m "feat(ui): add assignee select to card detail modal"
```

---

## Task 7: Atualizar `schema.md` da skill `factory-db`

**Files:**
- Modify: `.claude/skills/factory-db/references/schema.md`

- [ ] **Step 1: Adicionar `assignee_id` na tabela `kanban_cards` e atualizar o cabeçalho**

No arquivo `.claude/skills/factory-db/references/schema.md`:

1. Altere a linha do cabeçalho de `<!-- ÚLTIMA MIGRATION APLICADA: 006 -->` para:
   ```
   <!-- ÚLTIMA MIGRATION APLICADA: 007 -->
   ```

2. Na tabela `kanban_cards`, adicione a linha após `project_id`:
   ```
   | `assignee_id` | UUID | FK → public.users(id) ON DELETE SET NULL, nullable |
   ```

3. Em Indexes, adicione:
   ```
   **Indexes:** `idx_kanban_cards_column`, `idx_kanban_cards_project`, `idx_kanban_cards_assignee`
   ```

4. Atualize o diagrama de relacionamentos para incluir a FK de assignee:
   ```
   public.kanban_cards ──(assignee_id, nullable)→ public.users
   ```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/factory-db/references/schema.md
git commit -m "docs(factory-db): sync schema.md with migration 007"
```

---

## Verificação Final

- [ ] `npm run build` sem erros
- [ ] Card sem responsável: nenhum avatar exibido, formulário mostra "— Sem responsável —"
- [ ] Criar card com responsável: avatar aparece no quadro com iniciais corretas e tooltip com nome completo
- [ ] Abrir modal do card: select mostra o responsável atual selecionado
- [ ] Trocar responsável na modal: muda imediatamente, persiste após reload
- [ ] Remover responsável (selecionar "Sem responsável"): avatar some do card após refresh
