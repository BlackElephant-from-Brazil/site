# Kanban Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add client, project, and user filters to the Kanban board with cascade behavior and 100% client-side filtering.

**Architecture:** Data is fetched at page load (server component). A new `getCurrentUserPublicId()` server action resolves the logged-in user's `public.users.id`. Filtering lives in `KanbanBoard` via `useMemo` — no extra server requests. A horizontal filter bar renders between the page header and columns.

**Tech Stack:** Next.js App Router, React (`useMemo`, `useEffect`, `useRef`), Supabase server client, TypeScript, CSS custom properties (no new dependencies).

> **Note:** This project has no automated test runner configured. TDD steps are replaced with lint + build verification and manual browser checks.

---

## File Map

| File | Change |
|------|--------|
| `src/lib/actions/users.ts` | Add `getCurrentUserPublicId()` |
| `src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx` | Add `getClients` + `getCurrentUserPublicId` to fetch; pass new props |
| `src/components/admin/kanban/KanbanBoard.tsx` | New props, filter states, `useMemo`, filter bar UI |

---

### Task 1: Add `getCurrentUserPublicId()` to users actions

**Files:**
- Modify: `src/lib/actions/users.ts`

- [ ] **Step 1: Add `createClient` import**

At the top of `src/lib/actions/users.ts`, after the existing imports, add:

```ts
import { createClient } from '@/lib/supabase/server'
```

Full imports block after change:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types'
```

- [ ] **Step 2: Add `getCurrentUserPublicId()` at the end of the file**

```ts
export async function getCurrentUserPublicId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('user_id', user.id)
    .single()
  return data?.id ?? null
}
```

- [ ] **Step 3: Verify with lint**

```bash
npm run lint
```

Expected: no errors in `src/lib/actions/users.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/users.ts
git commit -m "feat(actions): add getCurrentUserPublicId server action"
```

---

### Task 2: Update kanban page.tsx

**Files:**
- Modify: `src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx`

- [ ] **Step 1: Replace the entire file content**

```ts
import { setRequestLocale } from 'next-intl/server'
import { getKanbanBoard } from '@/lib/actions/kanban-cards'
import { getProjects } from '@/lib/actions/projects'
import { getAdminUsers, getCurrentUserPublicId } from '@/lib/actions/users'
import { getClients } from '@/lib/actions/clients'
import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string }>

export default async function KanbanPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [board, projectsWithRefs, adminUsers, clients, currentUserId] = await Promise.all([
    getKanbanBoard(),
    getProjects(),
    getAdminUsers(),
    getClients(),
    getCurrentUserPublicId(),
  ])
  return (
    <KanbanBoard
      initialBoard={board}
      projects={projectsWithRefs}
      adminUsers={adminUsers}
      clients={clients}
      currentUserId={currentUserId}
    />
  )
}
```

- [ ] **Step 2: Verify with lint**

```bash
npm run lint
```

Expected: no errors in `src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx"
git commit -m "feat(kanban): fetch clients and currentUserId in page"
```

---

### Task 3: Update KanbanBoard — props, imports, filter state, and filtering logic

**Files:**
- Modify: `src/components/admin/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Update React imports (add `useMemo`, `useEffect`)**

Replace:
```ts
import { useState, useRef, useTransition } from 'react'
```

With:
```ts
import { useState, useRef, useTransition, useMemo, useEffect } from 'react'
```

- [ ] **Step 2: Update type imports (add `Client`, `ProjectWithRefs`; remove `Project`)**

Replace:
```ts
import type { KanbanColumnWithCards, KanbanCardWithProject, Project, User } from '@/types'
```

With:
```ts
import type { KanbanColumnWithCards, KanbanCardWithProject, ProjectWithRefs, Client, User } from '@/types'
```

- [ ] **Step 3: Update `Props` interface**

Replace:
```ts
interface Props {
  initialBoard: KanbanColumnWithCards[]
  projects: Project[]
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
}
```

With:
```ts
interface Props {
  initialBoard: KanbanColumnWithCards[]
  projects: ProjectWithRefs[]
  adminUsers: Pick<User, 'id' | 'name' | 'avatar_url'>[]
  clients: Client[]
  currentUserId: string | null
}
```

- [ ] **Step 4: Update function signature**

Replace:
```ts
export function KanbanBoard({ initialBoard, projects, adminUsers }: Props) {
```

With:
```ts
export function KanbanBoard({ initialBoard, projects, adminUsers, clients, currentUserId }: Props) {
```

- [ ] **Step 5: Add filter states and dropdown ref after existing state declarations**

After the line `const [error, setError] = useState('')`, add:

```ts
  const [filterClientId, setFilterClientId] = useState('')
  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterUserIds, setFilterUserIds] = useState<string[]>([])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
```

- [ ] **Step 6: Add derived values after `const firstColumnId = board[0]?.id`**

After the line `const firstColumnId = board[0]?.id`, add:

```ts
  const availableProjects = filterClientId
    ? projects.filter(p => p.client_id === filterClientId)
    : projects

  const filteredBoard = useMemo(() => {
    const clientActive  = filterClientId !== ''
    const projectActive = filterProjectId !== ''
    const usersActive   = filterUserIds.length > 0

    if (!clientActive && !projectActive && !usersActive) return board

    return board.map(col => ({
      ...col,
      cards: col.cards.filter(card => {
        if (clientActive || projectActive) {
          if (!card.project) return false
          if (clientActive && card.project.client_id !== filterClientId) return false
          if (projectActive && card.project_id !== filterProjectId) return false
        }
        if (usersActive) {
          if (!card.assignee_id) return false
          if (!filterUserIds.includes(card.assignee_id)) return false
        }
        return true
      }),
    }))
  }, [board, filterClientId, filterProjectId, filterUserIds])
```

- [ ] **Step 7: Add useEffect to close dropdown on outside click**

After the `filteredBoard` useMemo block, add:

```ts
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])
```

- [ ] **Step 8: Add `filterControlStyle` constant alongside existing style constants**

After the `labelStyle` constant (near the bottom of the function body, before `return`), add:

```ts
  const filterControlStyle: React.CSSProperties = {
    background: 'var(--background-secondary)',
    border: '1px solid var(--card-border)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: 'var(--foreground)',
    outline: 'none',
    cursor: 'pointer',
  }
```

- [ ] **Step 9: Verify with lint**

```bash
npm run lint
```

Expected: no type errors. If TypeScript reports `Property 'client_id' does not exist on type 'Project'`, ensure the import uses `ProjectWithRefs` (not `Project`) — that's the type with `client` embedded.

- [ ] **Step 10: Commit**

```bash
git add src/components/admin/kanban/KanbanBoard.tsx
git commit -m "feat(kanban): add filter state and filtering logic"
```

---

### Task 4: Add filter bar UI and wire up `filteredBoard` in render

**Files:**
- Modify: `src/components/admin/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Replace the board render section**

In the `return` statement, find:

```tsx
      {board.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhuma coluna criada. Configure as colunas em Configurações &rarr; Colunas do Kanban.
        </p>
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {board.map(col => (
```

Replace with:

```tsx
      {board.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--foreground-muted)' }}>
          Nenhuma coluna criada. Configure as colunas em Configurações &rarr; Colunas do Kanban.
        </p>
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 py-3">
            <select
              style={filterControlStyle}
              value={filterClientId}
              onChange={e => {
                const newClientId = e.target.value
                setFilterClientId(newClientId)
                if (newClientId && filterProjectId) {
                  const proj = projects.find(p => p.id === filterProjectId)
                  if (proj?.client_id !== newClientId) setFilterProjectId('')
                }
              }}
            >
              <option value="">Todos os clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.trade_name}</option>
              ))}
            </select>

            <select
              style={{ ...filterControlStyle, opacity: availableProjects.length === 0 ? 0.5 : 1 }}
              value={filterProjectId}
              onChange={e => setFilterProjectId(e.target.value)}
              disabled={availableProjects.length === 0}
            >
              <option value="">Todos os projetos</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.acronym} — {p.name}</option>
              ))}
            </select>

            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(o => !o)}
                style={{ ...filterControlStyle, minWidth: '160px', textAlign: 'left' }}
              >
                {filterUserIds.length === 0
                  ? 'Todos os usuários'
                  : filterUserIds.length === 1
                    ? (adminUsers.find(u => u.id === filterUserIds[0])?.name ?? '1 usuário')
                    : `${filterUserIds.length} usuários`}
                {' ▾'}
              </button>
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    zIndex: 50,
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '0.5rem',
                    minWidth: '200px',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  {adminUsers.map(u => (
                    <label
                      key={u.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--foreground)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filterUserIds.includes(u.id)}
                        onChange={e => {
                          setFilterUserIds(prev =>
                            e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                          )
                        }}
                        style={{ accentColor: 'var(--color-lime)' }}
                      />
                      {u.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {currentUserId !== null && (
              <button
                type="button"
                onClick={() => {
                  const onlyMe = filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                  setFilterUserIds(onlyMe ? [] : [currentUserId])
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                    ? 'var(--color-lime)'
                    : 'var(--card-border)',
                  color: filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                    ? 'var(--color-lime)'
                    : 'var(--foreground-muted)',
                  background: filterUserIds.length === 1 && filterUserIds[0] === currentUserId
                    ? 'rgba(57,255,20,0.05)'
                    : 'transparent',
                }}
              >
                Apenas para mim
              </button>
            )}

            {(filterClientId !== '' || filterProjectId !== '' || filterUserIds.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setFilterClientId('')
                  setFilterProjectId('')
                  setFilterUserIds([])
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  background: 'transparent',
                }}
              >
                × Limpar
              </button>
            )}
          </div>

          {/* Board columns */}
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {filteredBoard.map(col => (
```

- [ ] **Step 2: Close the new fragment — find the closing of the ternary**

Find (use all 3 lines as context to ensure uniqueness — this is the end of the column list + board container + ternary):
```tsx
          ))}
        </div>
      )}
```

Replace with:
```tsx
          ))}
          </div>
        </>
      )}
```

- [ ] **Step 3: Verify full build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript or JSX errors.

- [ ] **Step 4: Manual browser test**

Start the dev server (`npm run dev`) and navigate to `/pt/dashboard/admin/kanban`.

Check:
1. Filter bar appears with three controls + "Apenas para mim" + no "Limpar" button (no active filters)
2. Selecting a client filters the project dropdown to only that client's projects
3. Selecting a project hides cards from other projects (cards without project also disappear)
4. Selecting users via checkbox filters cards; "N usuários" label updates
5. "Apenas para mim" highlights with lime border and filters to current user's cards; clicking again clears
6. "Limpar" button appears when any filter is active; clicking resets all three
7. Column card counts update to reflect filtered cards
8. Drag-and-drop still works correctly while filters are active

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/kanban/KanbanBoard.tsx
git commit -m "feat(kanban): add client, project, and user filter bar"
```
