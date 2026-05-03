# Kanban Filters — Design Spec

**Data:** 2026-05-03  
**Status:** Aprovado

---

## Objetivo

Adicionar três filtros ao quadro Kanban: cliente (single select), projeto (single select, cascadeado pelo cliente) e usuários (multi-select com atalho "Apenas para mim"). Filtragem 100% client-side — sem novas queries de banco em tempo de navegação.

---

## Regras de negócio

- Quando filtro de **cliente** ativo: esconde cards sem projeto + cards cujo `project.client_id !== filterClientId`
- Quando filtro de **projeto** ativo: esconde cards sem projeto + cards com `project_id !== filterProjectId`
- Quando filtro de **usuários** ativo: esconde cards sem responsável + cards com `assignee_id` fora dos selecionados
- Filtros são cumulativos (cliente + projeto + usuário aplicados juntos)
- Ao trocar o cliente, se o projeto selecionado não pertencer ao novo cliente, o filtro de projeto é resetado automaticamente
- A contagem no header de cada coluna reflete os cards **após** a filtragem

---

## Camada de dados

### Nova server action: `getCurrentUserPublicId()`

Arquivo: `src/lib/actions/users.ts`

```ts
export async function getCurrentUserPublicId(): Promise<string | null> {
  const supabase = createClient() // server client, respeita RLS
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

Usa a policy `users_select_own` existente. Nenhuma migration necessária.

### Atualização em `page.tsx` (kanban)

```ts
const [board, projectsWithRefs, adminUsers, clients, currentUserId] = await Promise.all([
  getKanbanBoard(),
  getProjects(),
  getAdminUsers(),
  getClients(),
  getCurrentUserPublicId(),
])
```

Props adicionados ao `KanbanBoard`: `clients: Client[]`, `currentUserId: string | null`.

### Correção de tipo

O prop `projects` no `KanbanBoard` está tipado como `Project[]` mas recebe `ProjectWithRefs[]`. Corrigir para `ProjectWithRefs[]` para que o `client_id` dos projetos fique acessível no componente.

---

## Estado de filtros (KanbanBoard)

```ts
const [filterClientId, setFilterClientId]   = useState('')
const [filterProjectId, setFilterProjectId] = useState('')
const [filterUserIds, setFilterUserIds]     = useState<string[]>([])
```

### Projetos disponíveis no select (derivado)

```ts
const availableProjects = filterClientId
  ? projects.filter(p => p.client_id === filterClientId)
  : projects
```

### Board filtrado (useMemo)

```ts
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

---

## UI — Barra de filtros

Posicionada entre o `AdminPageHeader` e as colunas. Layout: `flex flex-wrap gap-2 py-3`.

### Controles

| Controle | Tipo | Comportamento |
|----------|------|---------------|
| Cliente | `<select>` nativo | "Todos os clientes" + lista; ao mudar, reseta projeto se necessário |
| Projeto | `<select>` nativo | "Todos os projetos" + `availableProjects`; `disabled` quando `availableProjects` vazio |
| Usuários | Dropdown customizado | Toggle abre lista de checkboxes com `adminUsers`; label: "Todos os usuários" / "1 usuário" / "N usuários" |
| Apenas para mim | Botão pill | `setFilterUserIds([currentUserId])`; borda lime quando ativo (só current user selecionado); clique em estado ativo limpa o filtro de usuários; renderizado somente quando `currentUserId !== null` |
| Limpar | Botão texto | Visível apenas quando algum filtro está ativo; reseta os três estados |

### Dropdown de usuários

- `<div>` com `position: relative`; botão toggle abre lista absoluta abaixo
- Lista: cada item é um checkbox + nome do usuário
- Fecha ao clicar fora via `useEffect` com listener `mousedown` no `document`
- Sem dependências externas

### Estilo

Consistente com o `Drawer` existente:
- Selects e botões: `background: var(--background-secondary)`, `border: 1px solid var(--card-border)`, `color: var(--foreground)`, `border-radius: 0.5rem`, `padding: 0.5rem 0.75rem`, `font-size: 0.875rem`
- Botão "Apenas para mim" inativo: borda `var(--card-border)`, texto `var(--foreground-muted)`
- Botão "Apenas para mim" ativo: borda `var(--color-lime)`, texto `var(--color-lime)`, `background: rgba(57,255,20,0.05)`
- Botão "Limpar": sem borda, texto `var(--foreground-muted)`, hover texto `var(--foreground)`

---

## Arquivos alterados

| Arquivo | Tipo de alteração |
|---------|------------------|
| `src/lib/actions/users.ts` | Adiciona `getCurrentUserPublicId()` |
| `src/app/[locale]/(member)/dashboard/admin/kanban/page.tsx` | Adiciona `getClients()` e `getCurrentUserPublicId()` ao Promise.all; passa novos props |
| `src/components/admin/kanban/KanbanBoard.tsx` | Adiciona props, estados, lógica de filtragem e barra de filtros |

Nenhuma migration. Nenhum novo arquivo de tipos necessário (`Client` já existe em `src/types/index.ts`).
