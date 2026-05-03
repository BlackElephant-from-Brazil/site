# Padrões de Código — Factory DB

Templates e convenções para todas as tarefas de banco de dados neste projeto.

---

## Template: Migration Completa (Nova Tabela)

```sql
-- Migration: NNN_nome_descritivo
-- Uma linha descrevendo o propósito da migration.

CREATE TABLE IF NOT EXISTS public.<tabela> (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  -- campos específicos aqui
  created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.<tabela> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<tabela>_admin" ON public.<tabela>
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_<tabela>_updated
  BEFORE UPDATE ON public.<tabela>
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Índices (se necessário)
-- CREATE INDEX IF NOT EXISTS idx_<tabela>_<coluna> ON public.<tabela>(<coluna>);
```

---

## Template: Migration de Alteração (ADD COLUMN)

```sql
-- Migration: NNN_<tabela>_add_<coluna>
-- Descrição do motivo.

ALTER TABLE public.<tabela>
  ADD COLUMN IF NOT EXISTS <coluna> <TIPO> [NOT NULL DEFAULT <valor>];
```

---

## Template: Migration de Alteração (RENAME / OUTRAS)

```sql
-- Migration: NNN_<tabela>_<acao>
-- Descrição.

ALTER TABLE public.<tabela>
  RENAME COLUMN <antigo> TO <novo>;
```

---

## Template: TypeScript Interface

Em `src/types/index.ts`, adicione ao bloco correspondente:

```typescript
// ─── <Domínio> ──────────────────────────────────────────────────────────────
export interface <NomeEntidade> {
  id: string
  // campos NOT NULL → tipo direto (string, number, boolean)
  // campos nullable → tipo | null
  created_at: string
  updated_at: string
}

// Se precisar de join:
export interface <NomeEntidade>WithRefs extends <NomeEntidade> {
  <relacao>: <OutraEntidade> | null
}
```

**Mapeamento SQL → TypeScript:**
| SQL | TypeScript |
|-----|-----------|
| UUID | string |
| TEXT NOT NULL | string |
| TEXT (nullable) | string \| null |
| BOOLEAN NOT NULL | boolean |
| INTEGER NOT NULL | number |
| NUMERIC(12,2) nullable | number \| null |
| TIMESTAMPTZ | string |

---

## Template: Server Actions (CRUD Completo)

`src/lib/actions/<tabela>.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { <Entidade> } from '@/types'

export async function get<Entidades>(): Promise<<Entidade>[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('<tabela>')
    .select('*')
    .order('<coluna_ordenacao>', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function create<Entidade>(payload: {
  <campo>: string
  // campos opcionais:
  <campo_opt>?: string | null
}): Promise<<Entidade>> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('<tabela>')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/<rota>')
  return data
}

export async function update<Entidade>(
  id: string,
  payload: Partial<{
    <campo>: string
    <campo_opt>: string | null
  }>
): Promise<<Entidade>> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('<tabela>')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/<rota>')
  return data
}

export async function delete<Entidade>(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('<tabela>').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/<rota>')
}
```

---

## Template: Query com Join (Server Action)

```typescript
export async function get<Entidades>WithRefs(): Promise<<EntidadeWithRefs>[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('<tabela>')
    .select(`
      *,
      <relacao>:public.<tabela_relacionada>(*)
    `)
    .order('<coluna>', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as <EntidadeWithRefs>[]
}
```

---

## Template: Query com Filtro

```typescript
export async function get<Entidades>By<Campo>(<campo>: string): Promise<<Entidade>[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('<tabela>')
    .select('*')
    .eq('<coluna>', <campo>)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}
```

---

## Padrão: Criação de Usuário (auth + public)

Para criar usuários, sempre use `inviteUserByEmail` para enviar convite por e-mail:

```typescript
// 1. Criar em auth.users e enviar convite
const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
  email,
  { data: { name, role, avatar_url } }
)
if (authError) throw new Error(authError.message)

// 2. Espelhar em public.users
const { data, error } = await supabase
  .from('users')
  .insert({ user_id: authData.user.id, email, name, role, avatar_url })
  .select()
  .single()
```

---

## Padrão: RLS para acesso por role

**Apenas admins (padrão para tabelas admin):**
```sql
CREATE POLICY "<tabela>_admin" ON public.<tabela>
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));
```

**Usuário vê apenas seu próprio registro (padrão para users):**
```sql
CREATE POLICY "<tabela>_select_own" ON public.<tabela>
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

**Acesso público (leitura):**
```sql
CREATE POLICY "<tabela>_public_read" ON public.<tabela>
  FOR SELECT USING (true);
```

---

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabela | snake_case plural | `invoice_items` |
| Coluna | snake_case | `due_date`, `client_id` |
| FK | `<tabela_singular>_id` | `client_id`, `project_id` |
| Migration | `NNN_<tabela>_<acao>.sql` | `007_invoices_create.sql` |
| Policy | `<tabela>_<acao>` | `invoices_admin`, `invoices_select_own` |
| Trigger | `trg_<tabela>_updated` | `trg_invoices_updated` |
| Index | `idx_<tabela>_<coluna>` | `idx_invoices_client` |
| Action file | `src/lib/actions/<tabela>.ts` | `src/lib/actions/invoices.ts` |
| Type | PascalCase singular | `Invoice`, `InvoiceItem` |

---

## Checklist para nova tabela

- [ ] Migration com CREATE TABLE + IF NOT EXISTS
- [ ] RLS habilitado
- [ ] Policy de admin (ou a adequada ao contexto)
- [ ] Trigger `set_updated_at`
- [ ] Índices nas FKs e colunas de busca frequente
- [ ] Interface TypeScript em `src/types/index.ts`
- [ ] Actions file em `src/lib/actions/<tabela>.ts`
- [ ] Atualizar `references/schema.md` nesta skill

---

## Checklist para novo campo em tabela existente

- [ ] Migration com ALTER TABLE ... ADD COLUMN IF NOT EXISTS
- [ ] Atualizar interface em `src/types/index.ts`
- [ ] Atualizar `EMPTY_FORM` e `handleSubmit` em views que usam a tabela
- [ ] Atualizar `references/schema.md` nesta skill
