# Schema do Banco de Dados — Factory
<!-- ÚLTIMA MIGRATION APLICADA: 012 -->
<!-- Atualize este arquivo ao detectar novas migrations. Sempre incremente o número acima. -->

Banco: PostgreSQL via Supabase  
Migrations: `supabase/migrations/`

---

## Tabela: `public.users`

Usuários da plataforma, espelhados de `auth.users`. Criados manualmente via server action — sem trigger automático.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → auth.users(id) ON DELETE CASCADE |
| `email` | TEXT | NOT NULL |
| `name` | TEXT | NOT NULL |
| `role` | TEXT | NOT NULL DEFAULT 'customer', CHECK IN ('admin','customer') |
| `avatar_url` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:**
- `users_select_own`: SELECT authenticated WHERE auth.uid() = user_id
- `users_update_own`: UPDATE authenticated WHERE auth.uid() = user_id

**Nota:** O `createAdminClient()` (service role) bypassa RLS e consegue listar todos os usuários.

---

## Tabela: `public.kanban_columns`

Colunas do quadro Kanban.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `name` | TEXT | NOT NULL |
| `position` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:** `kanban_columns_admin` — FOR ALL, apenas usuários com role='admin'  
**Trigger:** `trg_kanban_columns_updated` → `set_updated_at()`  
**Index:** `idx_kanban_columns_position`

---

## Tabela: `public.project_types`

Tipos de projeto (ex: site, app, manutenção).

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `name` | TEXT | NOT NULL |
| `is_recurring` | BOOLEAN | NOT NULL DEFAULT FALSE |
| `is_internal` | BOOLEAN | NOT NULL DEFAULT FALSE |
| `one_time_value` | NUMERIC(12,2) | nullable |
| `recurring_value` | NUMERIC(12,2) | nullable |
| `monthly_hours` | NUMERIC(8,2) | nullable — horas disponíveis/mês (banco de horas) |
| `has_monthly_bank` | BOOLEAN | NOT NULL DEFAULT false — ativa banco de horas mensal |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:** `project_types_admin` — FOR ALL, apenas role='admin'  
**Trigger:** `trg_project_types_updated`

---

## Tabela: `public.clients`

Clientes da agência.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `trade_name` | TEXT | NOT NULL |
| `cnpj` | TEXT | nullable |
| `company_name` | TEXT | nullable |
| `logo_url` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:** `clients_admin` — FOR ALL, apenas role='admin'  
**Trigger:** `trg_clients_updated`

---

## Tabela: `public.projects`

Projetos vinculados a clientes e tipos de projeto.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `client_id` | UUID | FK → public.clients(id) ON DELETE SET NULL, nullable |
| `project_type_id` | UUID | FK → public.project_types(id) ON DELETE SET NULL, nullable |
| `name` | TEXT | NOT NULL |
| `acronym` | TEXT | NOT NULL |
| `is_internal` | BOOLEAN | NOT NULL DEFAULT FALSE |
| `service_value` | NUMERIC(12,2) | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:** `projects_admin` — FOR ALL, apenas role='admin'  
**Trigger:** `trg_projects_updated`  
**Indexes:** `idx_projects_client`

---

## Tabela: `public.kanban_cards`

Cards do Kanban vinculados a colunas e projetos.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `column_id` | UUID | NOT NULL, FK → public.kanban_columns(id) ON DELETE CASCADE |
| `project_id` | UUID | FK → public.projects(id) ON DELETE SET NULL, nullable |
| `assignee_id` | UUID | FK → public.users(id) ON DELETE SET NULL, nullable |
| `name` | TEXT | NOT NULL |
| `description` | TEXT | nullable |
| `card_number` | INTEGER | NOT NULL DEFAULT 1 |
| `position` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:** `kanban_cards_admin` — FOR ALL, apenas role='admin'  
**Trigger:** `trg_kanban_cards_updated`  
**Indexes:** `idx_kanban_cards_column`, `idx_kanban_cards_project`, `idx_kanban_cards_assignee`

---

## Função e Trigger Compartilhados

```sql
-- Definida em 002_admin_tables.sql, disponível para todas as tabelas
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Para adicionar em nova tabela:
```sql
CREATE TRIGGER trg_<tabela>_updated
  BEFORE UPDATE ON public.<tabela>
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

---

## Tabela: `public.goals`

Metas estratégicas da empresa, visíveis a todos os admins.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `name` | TEXT | NOT NULL |
| `objective` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado
**Policies:** `goals_admin` — FOR ALL, apenas role='admin'
**Trigger:** `trg_goals_updated`

---

## Tabela: `public.goal_activities`

Atividades (todo list) de cada meta. Suporta sub-atividades infinitas via `parent_id`.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `goal_id` | UUID | NOT NULL, FK → public.goals(id) ON DELETE CASCADE |
| `parent_id` | UUID | nullable, FK → public.goal_activities(id) ON DELETE CASCADE |
| `title` | TEXT | NOT NULL |
| `is_completed` | BOOLEAN | NOT NULL DEFAULT false |
| `position` | INTEGER | NOT NULL DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado
**Policies:** `goal_activities_admin` — FOR ALL, apenas role='admin'
**Trigger:** `trg_goal_activities_updated`
**Indexes:** `idx_goal_activities_goal`, `idx_goal_activities_parent`

---

## Tabela: `public.user_todos`

Tarefas individuais por usuário (todo list pessoal).

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| `title` | TEXT | NOT NULL |
| `description` | TEXT | nullable |
| `due_date` | TIMESTAMPTZ | nullable |
| `is_completed` | BOOLEAN | NOT NULL DEFAULT false |
| `completed_at` | TIMESTAMPTZ | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado
**Policies:** `user_todos_own` — FOR ALL WHERE auth.uid() = user_id
**Trigger:** `trg_user_todos_updated`
**Index:** `idx_user_todos_user`

---

## Tabela: `public.user_notes`

Notas adesivas individuais por usuário, com suporte a markdown e cor.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| `content` | TEXT | NOT NULL DEFAULT '' |
| `color` | TEXT | NOT NULL DEFAULT '#2a2a1a' |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado
**Policies:** `user_notes_own` — FOR ALL WHERE auth.uid() = user_id
**Trigger:** `trg_user_notes_updated`
**Index:** `idx_user_notes_user`

---

## Tabela: `public.user_passwords`

Senhas individuais por usuário (não compartilhadas). Senha armazenada em texto.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| `service_name` | TEXT | NOT NULL |
| `username` | TEXT | nullable |
| `password` | TEXT | NOT NULL |
| `url` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado
**Policies:** `user_passwords_own` — FOR ALL WHERE auth.uid() = user_id
**Trigger:** `trg_user_passwords_updated`
**Index:** `idx_user_passwords_user`

---

---

## Tabela: `public.agenda_entries`

Registros de horas dos administradores. Vinculado a cliente, projeto ou card do kanban.

| Coluna | Tipo | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `user_id` | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| `client_id` | UUID | nullable, FK → public.clients(id) ON DELETE SET NULL |
| `project_id` | UUID | nullable, FK → public.projects(id) ON DELETE SET NULL |
| `kanban_card_id` | UUID | nullable, FK → public.kanban_cards(id) ON DELETE SET NULL |
| `date` | DATE | NOT NULL |
| `start_time` | TIME | nullable |
| `minutes` | INTEGER | NOT NULL CHECK > 0 |
| `description` | TEXT | nullable |
| `created_at` | TIMESTAMPTZ | DEFAULT utc now |
| `updated_at` | TIMESTAMPTZ | DEFAULT utc now |

**RLS:** habilitado  
**Policies:** `agenda_entries_admin` — FOR ALL, apenas role='admin'  
**Trigger:** `trg_agenda_entries_updated`  
**Indexes:** `idx_agenda_entries_user`, `idx_agenda_entries_client`, `idx_agenda_entries_project`, `idx_agenda_entries_date`

---

## Diagrama de Relacionamentos

```
auth.users
    │
    └─(user_id)→ public.users

public.clients ←──(client_id)── public.projects ──(project_type_id)→ public.project_types
                                      │
                                 (project_id, nullable)
                                      ↓
                              public.kanban_cards ──(column_id)→ public.kanban_columns
                              public.kanban_cards ──(assignee_id, nullable)→ public.users
```

---

## Clientes Supabase Disponíveis

| Cliente | Arquivo | Quando usar |
|---------|---------|-------------|
| `createAdminClient()` | `src/lib/supabase/admin.ts` | Server actions (bypassa RLS, usa service role) |
| `createClient()` (server) | `src/lib/supabase/server.ts` | Server Components, respeita RLS |
| `createClient()` (browser) | `src/lib/supabase/client.ts` | Apenas auth no client-side |
