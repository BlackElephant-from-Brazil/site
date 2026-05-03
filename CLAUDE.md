# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⛔ REGRA INVIOLÁVEL: Skill `factory-db` para Banco de Dados

**NUNCA escreva código, proponha design, crie migration, ou faça qualquer ação relacionada a banco de dados sem antes invocar a skill `factory-db`.** Isso inclui a fase de brainstorming e design — se a tarefa *pode* envolver banco, invoque antes de raciocinar sobre ela.

```
Skill("factory-db")
```

**Gatilhos obrigatórios** (qualquer um destes = invocar imediatamente):
- Criar ou alterar tabela, coluna, índice, trigger ou policy
- Escrever ou modificar server action (`src/lib/actions/`)
- Escrever ou modificar query (`src/lib/supabase/queries/`)
- Adicionar ou alterar tipo TypeScript relacionado a dados (`src/types/index.ts`)
- Qualquer menção a migration, schema, RLS, Supabase, banco de dados
- Brainstorming ou design que envolva persistência de dados

**Não há exceções.** Nem tarefas "simples". Nem quando você "já sabe" o que fazer.

---

## Comandos

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run lint     # lint (ESLint flat config v9)
npm run start    # servidor de produção
```

Não há testes automatizados configurados. Não há script de migração automático — as migrations SQL são aplicadas manualmente no Supabase Studio ou via CLI do Supabase.

---

## Stack

- **Next.js 16** com App Router (React 19)
- **Supabase** — PostgreSQL + Auth + RLS
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **Framer Motion** — animações e transições
- **next-intl** — i18n com 6 idiomas (pt, en, es, de, fr, it)
- **TypeScript** em strict mode, path alias `@/*` → `src/*`

---

## Arquitetura

### Estrutura de rotas (App Router)

```
src/app/[locale]/
├── (public)         → Home, Portfólio, Planos, Sobre, Contato
├── (auth)/          → /login, /signup — sem proteção
└── (member)/        → layout.tsx verifica auth; redireciona se !user
    └── dashboard/
        ├── page.tsx → router: admin → /admin, customer → /customer
        ├── admin/   → layout.tsx verifica role='admin'
        └── customer/
```

**Localização sempre como prefixo:** `/pt/dashboard/admin/kanban`, `/en/plans`, etc.

### Dois sistemas dentro do dashboard

**Sistema Admin** (`/dashboard/admin/`) — acesso completo:
- `kanban` — quadro Kanban com drag-and-drop entre colunas
- `projetos` — CRUD de projetos (vinculados a clientes e tipos)
- `clientes` — CRUD de clientes (trade_name, cnpj, logo)
- `usuarios` — gerenciamento de usuários (convite por email, exclusão)
- `financeiro` — em construção
- `configuracoes/kanban` — gerenciar colunas do Kanban
- `configuracoes/tipos-projeto` — gerenciar tipos de projeto com precificação
- Navegação: `AdminSidebar` com accordion para "Desenvolvimento"

**Sistema Customer** (`/dashboard/customer/`) — acesso limitado:
- Área exclusiva do cliente para acompanhar projetos
- Ainda em construção (placeholder)

### Camadas de dados

```
src/lib/actions/<tabela>.ts    ← mutações ('use server' + createAdminClient)
src/lib/supabase/queries/      ← leitura para Server Components (respeita RLS)
src/lib/supabase/admin.ts      ← service role, bypassa RLS
src/lib/supabase/server.ts     ← anon key + cookies, respeita RLS
src/lib/supabase/client.ts     ← browser, apenas auth
```

Regra: **server actions sempre usam `createAdminClient()`**. O cliente browser (`createBrowserClient`) é exclusivo para `signIn`/`signOut`.

### Tipos TypeScript

Todos em `src/types/index.ts`. Nunca criar arquivos separados de tipos. Padrão:
- Entidade base: `User`, `Project`, `Client`, `KanbanCard`
- Com relacionamentos: `ProjectWithRefs`, `KanbanCardWithProject`, `KanbanColumnWithCards`

---

## Regras de Negócio

### Autenticação e papéis

- Dois roles: `admin` e `customer`
- Usuários são **criados manualmente por admins** via convite (`inviteUserByEmail`) — não há auto-registro
- Todo usuário em `auth.users` deve ter espelho em `public.users`; isso é feito manualmente na action de criação
- Deletar usuário: remove de `public.users` + `auth.users` via admin API

### Kanban

- `card_number` é sequencial **por projeto** (não global). Cards sem projeto têm sempre `card_number = 1`
- `position` controla ordem dentro da coluna; é inteiro reordenado em `Promise.all()`
- Excluir uma coluna que tem cards é proibido — a action lança erro com mensagem de orientação
- Reordenar colunas revalida dois paths: `/dashboard/admin/kanban` e `.../configuracoes/kanban`

### Projetos e precificação

- Projeto pode ser `is_internal` (sem billing) ou ter `service_value` próprio
- `ProjectType` define o modelo de cobrança: `is_recurring` (mensal via `recurring_value`) ou one-time (`one_time_value`)
- `client_id` e `project_type_id` são opcionais (ON DELETE SET NULL)

### RLS

- `admin`-only: `kanban_columns`, `kanban_cards`, `project_types`, `clients`, `projects`
- Usuário vê apenas seu próprio perfil: `users` (SELECT/UPDATE WHERE auth.uid() = user_id)
- Policy de admin: `EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')`

---

## Design System — Site Público

**Estética:** Cyberpunk / Futurista / Dark. Nunca tema claro no site público.

**Variáveis CSS** em `src/styles/design-tokens.css` — usar sempre em vez de valores hardcoded:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-lime` | `#39FF14` | Cor primária, CTAs, destaques, ícones ativos |
| `--background` | `#0a0a0a` | Fundo principal |
| `--background-secondary` | `#111111` | Seções alternadas |
| `--foreground` | `#f0f0f0` | Texto principal |
| `--foreground-muted` | `#888888` | Texto secundário |
| `--font-primary` | Inter | Corpo de texto |
| `--font-title` | Sora | Títulos e headings |
| `--glass-background` | `rgba(17,17,17,0.6)` | Cards com glassmorphism |
| `--glass-border` | `rgba(255,255,255,0.1)` | Bordas de cards glass |

**Padrões visuais recorrentes:**

- Cards com `backdrop-blur + border border-white/[0.08]`
- Seções com `--color-lime` blur orbs no fundo (`blur-[150px]`, opacidade 0.05–0.15)
- Badges de seção: pill com `border border-[var(--color-lime)]/20 text-[var(--color-lime)] bg-[var(--color-lime)]/5`
- Botão primário: `bg-[var(--color-lime)] text-black` com `hover:shadow-[0_0_30px_rgba(57,255,20,0.3)]`
- Botão secundário: `border-2 border-[var(--card-border)]` com hover para lime
- Header fixo: glassmorphism que encolhe ao scroll (`backdrop-filter: blur(20px) saturate(180%)`)
- Animações via Framer Motion: `ScrollReveal`, `AnimatedSection`/`AnimatedItem`, `FloatingElement`, `GlowPulse`

**Componentes UI reutilizáveis** em `src/components/ui/`:
`AnimatedSection`, `AnimatedItem`, `ScrollReveal`, `Button`, `FloatingElement`, `GlowPulse`, `GradientText`, `ParallaxContainer`, `LoadingScreen`, `Logo`

**Páginas públicas:** Home, Portfólio (com `[slug]`), Planos (com `[slug]`), Sobre, Contato. Dados estáticos em `src/data/`.

---

## Internacionalização

- `next-intl` com prefix sempre presente na URL
- Configuração em `src/i18n/request.ts`, consumida em `next.config.ts`
- Traduções em `src/i18n/` (mensagens por locale)
- `useTranslations('namespace')` nos componentes; `getTranslations` nas Server Pages
- `Link` e `useRouter` de `@/i18n/navigation` (não de `next/link` diretamente)

---

## Middleware

`src/middleware.ts` executa em toda rota não-estática:
1. Atualiza sessão Supabase (refresh de cookies)
2. Aplica routing de i18n
3. Merge dos cookies Supabase no response do next-intl

---

## Convenções de Código

- Novas rotas admin: `src/app/[locale]/(member)/dashboard/admin/<rota>/page.tsx` com `export const dynamic = 'force-dynamic'`
- Views de CRUD: `src/components/admin/views/<Entidade>View.tsx` (client component)
- Após criar nova rota admin: adicionar link em `src/components/admin/AdminSidebar.tsx`
- Utilitário `cn()` de `@/lib/utils` para merge de classes Tailwind
