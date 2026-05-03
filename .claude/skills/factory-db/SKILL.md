---
name: factory-db
description: >
  Especialista em banco de dados do sistema Factory (Next.js + Supabase + PostgreSQL).
  Use esta skill SEMPRE que qualquer tarefa envolver banco de dados neste projeto — incluindo
  criar migrations SQL, implementar server actions (CRUD, queries), atualizar tipos TypeScript,
  definir políticas RLS, criar novas tabelas, adicionar colunas, relacionamentos ou índices.
  Dispare também quando o usuário pedir para "adicionar campo", "criar tabela", "implementar API
  de X", "buscar dados de Y", "fazer query de Z", ou qualquer variação dessas expressões num
  contexto de backend/banco de dados. Em caso de dúvida, use a skill — ela nunca atrapalha.
---

# Factory DB Expert

Esta skill te dá conhecimento completo e atualizado do banco de dados do projeto e define como
executar qualquer tarefa relacionada a ele. Siga o processo abaixo toda vez que for ativada.

---

## 1. Sincronize o schema antes de qualquer coisa

O schema documentado em `references/schema.md` desta skill é o snapshot do banco. Antes de agir:

1. Leia `references/schema.md` para ter o estado atual do banco em contexto.
2. Liste o diretório de migrations do projeto: `supabase/migrations/`
3. Se houver migrations com número maior do que o registrado em `references/schema.md`,
   leia-as e aplique mentalmente as alterações ao schema que você conhece.
4. **Atualize `references/schema.md`** para refletir o estado atual (aplique o diff das novas
   migrations). Isso mantém a skill sincronizada para a próxima ativação.

Esse mecanismo garante que a skill se auto-atualize a cada alteração feita no banco.

---

## 2. Identifique o tipo de tarefa

| Tarefa | O que fazer |
|--------|-------------|
| Nova tabela | Migration completa (CREATE TABLE + RLS + trigger) |
| Alterar coluna / adicionar campo | Migration ALTER TABLE |
| CRUD de uma tabela | Criar `src/lib/actions/<tabela>.ts` + atualizar `src/types/index.ts` |
| Query específica | Adicionar função ao arquivo de actions correspondente |
| Apenas tipos TypeScript | Atualizar `src/types/index.ts` |
| Dúvida sobre schema | Responder a partir do schema sincronizado |

---

## 3. Padrões do projeto

Leia `references/patterns.md` para os templates exatos de código. Resumo:

**Caminhos importantes:**
```
supabase/migrations/          ← migrations SQL (numeradas NNN_descricao.sql)
src/lib/actions/              ← server actions ('use server')
src/lib/supabase/admin.ts     ← createAdminClient() — bypassa RLS
src/lib/supabase/server.ts    ← createClient() — respeita RLS
src/lib/supabase/queries/     ← queries para Server Components
src/types/index.ts            ← todas as interfaces TypeScript
```

**Regras invioláveis:**
- Migrations usam `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`
- Toda tabela nova tem RLS habilitado + policy de admin + trigger `set_updated_at`
- Server actions usam sempre `createAdminClient()` (service role bypassa RLS)
- Todo server action começa com `'use server'` e chama `revalidatePath` após mutações
- Novos tipos TypeScript em `src/types/index.ts`, nunca em arquivos separados
- Nomenclatura: tabelas em snake_case plural, colunas em snake_case

---

## 4. Numeração de migrations

A próxima migration é sempre `NNN` onde `NNN = último número existente + 1`, com zero-padding
de 3 dígitos. Nunca pule números. Sempre verifique o último arquivo antes de nomear.

---

## 5. Referências

- `references/schema.md` — schema completo e atualizado (mantenha sincronizado)
- `references/patterns.md` — templates de código para cada tipo de tarefa
