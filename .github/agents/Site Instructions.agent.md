---
description: 'Agente de criação do site e sistema interno da BlackElephant'
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'agent', 'todo']
---

## Princípios Gerais
- **Mobile First**: Todas as implementações devem começar pelo mobile, depois adaptar para desktop
- **Server Components por padrão**: Use "use client" apenas quando necessário (interatividade, hooks de estado)
- **TypeScript Strict**: Nunca use `any`, sempre tipar corretamente

## Design System & UI
- Componentes UI ficam em `@/components/ui/` - são genéricos e reutilizáveis
- Use as variáveis CSS definidas em `@/styles/design-tokens.css` para cores, espaçamentos e tipografia
- Componentes de features específicas ficam em `@/components/features/`
- Sempre exporte componentes com suas Props tipadas

## Internacionalização (i18n)
- Todas as strings visíveis ao usuário devem usar `next-intl`
- Mensagens ficam em `@/i18n/messages/{locale}.json`
- Locales suportados: pt, es, en, de, fr, it
- O locale padrão é `pt`

## Supabase & Backend
- **NUNCA** exponha queries Supabase no cliente
- Use apenas Server Components ou Server Actions para queries
- Clientes Supabase ficam em `@/lib/supabase/`
- Queries organizadas por domínio em `@/lib/supabase/queries/`
- Variáveis de ambiente: `SUPABASE_URL` e `SUPABASE_ANON_KEY` (server-only)

## Autenticação
- Use Supabase Auth com `@supabase/ssr`
- Rotas protegidas ficam no grupo `(member)`
- Rotas públicas de auth ficam no grupo `(auth)`
- Middleware em `middleware.ts` valida sessão para rotas protegidas

## Estrutura de Imports
- Use sempre o alias `@/` para imports (já configurado no tsconfig)
- Ordem de imports: React > Next > libs externas > @/lib > @/components > @/hooks > tipos

## Estrutura de Pastas
```
src/
├── app/
│   ├── [locale]/                    # Rotas internacionalizadas
│   │   ├── (auth)/                  # Login, signup, forgot-password
│   │   ├── (member)/                # Dashboard, profile, settings
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── auth/callback/               # OAuth callback
├── components/
│   ├── ui/                          # Button, Input, Card, Modal...
│   ├── layout/                      # Header, Footer, Sidebar
│   └── features/                    # Componentes de features
├── lib/
│   ├── supabase/                    # Clientes e queries
│   │   ├── server.ts                # Server client
│   │   ├── client.ts                # Browser client (só auth)
│   │   └── queries/                 # Queries por domínio
│   ├── auth/                        # Server actions de auth
│   └── utils/                       # Funções utilitárias
├── hooks/                           # Custom hooks
├── types/                           # TypeScript types
├── styles/                          # Design tokens CSS
└── i18n/                            # Configuração e mensagens
```

## Criação de Componentes UI
Ao criar componentes em `@/components/ui/`:
1. Sempre tipar Props com interface exportada
2. Usar variáveis CSS de `@/styles/design-tokens.css`
3. Suportar className para customização
4. Usar `cn()` de `@/lib/utils` para merge de classes

## Rotas e Navegação
- Use `Link` de `@/i18n/navigation` ao invés de `next/link`
- Use `redirect` de `@/i18n/navigation` ao invés de `next/navigation`
- O locale atual é passado automaticamente pelo middleware