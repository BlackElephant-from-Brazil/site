# Design: Responsável por Card no Kanban

**Data:** 2026-05-03  
**Status:** Aprovado

---

## Objetivo

Permitir atribuir um responsável (usuário admin) a cada card do Kanban. O responsável deve ser visível no card do quadro (avatar com iniciais + tooltip), selecionável no formulário de criação e editável na modal de detalhes.

---

## Regras de Negócio

- O campo `responsável` é opcional — cards podem existir sem responsável.
- Somente usuários com `role = 'admin'` podem ser selecionados como responsáveis.
- Ao excluir um usuário, os cards que ele era responsável ficam sem responsável (`ON DELETE SET NULL`).
- Não há filtro por responsável na tela nesta versão.

---

## Banco de Dados

### Migration `007_kanban_cards_add_assignee.sql`

```sql
ALTER TABLE public.kanban_cards
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kanban_cards_assignee ON public.kanban_cards(assignee_id);
```

- Nenhuma alteração de RLS necessária — a policy `kanban_cards_admin` existente cobre a nova coluna.
- `schema.md` da skill `factory-db` deve ser atualizado após a migration.

---

## Tipos TypeScript — `src/types/index.ts`

```typescript
// KanbanCard — adicionar:
assignee_id: string | null

// KanbanCardWithProject — adicionar:
assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
```

---

## Camada de Dados

### `src/lib/actions/users.ts` — nova função

```typescript
export async function getAdminUsers(): Promise<User[]>
```

- Usa `createAdminClient()` (RLS impediria ver outros usuários com client normal).
- Filtra `role = 'admin'`, ordena por `name` ascending.

### `src/lib/actions/kanban-cards.ts` — alterações

**`getKanbanBoard()`:** adiciona join no select de cards:
```
assignee:users(id, name, avatar_url)
```

**`createKanbanCard(payload)`:** payload aceita `assignee_id?: string | null`.

**`updateKanbanCard(id, payload)`:** payload aceita `assignee_id?: string | null`.

### `kanban/page.tsx` — alteração

Busca `adminUsers` via `getAdminUsers()` em paralelo com board e projects. Passa como prop para `KanbanBoard`.

---

## UI

### Card no quadro (`KanbanBoard` / componente de card)

- Se `card.assignee !== null`: renderiza uma bolinha de 28px no canto inferior direito do card.
- Conteúdo da bolinha: iniciais do nome (máx. 2 letras, ex: "GK" para "Guilherme Kodenvis").
- Estilo: `bg-[var(--color-lime)]/15 text-[var(--color-lime)]`, texto `text-xs font-semibold`.
- Tooltip: atributo `title` nativo com o nome completo do responsável.
- Se `card.assignee === null`: nada é renderizado.

### Formulário "Nova atividade" (Drawer)

- Novo campo `Responsável` posicionado após o campo `Projeto`.
- Elemento: `<select>` com opção default `— Sem responsável —` (value `""`).
- Demais opções: `adminUsers.map(u => <option value={u.id}>{u.name}</option>)`.
- Ao submeter, envia `assignee_id: value || null` para `createKanbanCard`.

### Modal de detalhes (`CardDetailModal`)

- Novo campo `Responsável` na seção de metadados, mesmo estilo do campo `Projeto` existente.
- Elemento: `<select>` com as mesmas opções do formulário de criação.
- Ao trocar a seleção: chama `updateKanbanCard(card.id, { assignee_id: value || null })` e atualiza estado local via `onUpdate`.
- `adminUsers` chega como prop para o modal (vem do `KanbanBoard`, que recebe da page).

---

## Fluxo de Props

```
kanban/page.tsx
  └─ busca: board, projects, adminUsers
  └─ KanbanBoard (props: columns, projects, adminUsers)
       └─ KanbanCard (props: card, ...) — exibe avatar do assignee
       └─ Drawer / NewCardForm (props: projects, adminUsers) — campo no form
       └─ CardDetailModal (props: card, adminUsers, ...) — campo no modal
```

---

## Fora do escopo desta versão

- Filtro do quadro por responsável.
- Notificação ao responsável ao ser atribuído.
- Múltiplos responsáveis por card.
