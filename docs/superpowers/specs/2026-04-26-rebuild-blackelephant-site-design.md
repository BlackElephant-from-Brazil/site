# Rebuild do site BlackElephant — Design Spec

**Data**: 2026-04-26
**Autor**: Guilherme Kodenvis (com brainstorming colaborativo)
**Status**: Aprovado, pendente revisão final do usuário antes do plano de implementação

---

## 1. Objetivo

Reconstruir do zero o site institucional da BlackElephant. O site atual está abaixo do nível desejado. O novo site precisa:

- Comunicar com clareza o que a Black faz: sites, apps, sistemas web e softwares de gestão com automação.
- Ter estética cyberpunk/futurista alinhada com a identidade existente (preto + verde neon `#39FF14`).
- Vender com persuasão sem ser genérico — em especial a página "Quem somos".
- Servir como base de páginas de produto que viram landing de anúncio no futuro.
- Estar pronto em pt/en/es, com SEO completo e responsividade total.
- Sem formulário de contato — toda conversão passa por WhatsApp.

## 2. Decisões de escopo

### Manter
- Stack: Next.js 16 (App Router) · React 19 · Tailwind 4 · Framer Motion · next-intl · Three.js (uso pontual) · `yet-another-react-lightbox`.
- Tokens de design existentes em `src/styles/design-tokens.css` (paleta cyberpunk preto + verde neon, fontes Sora/Inter).
- Logo em `public/logo.png`.
- Pasta `portifolio/` (renomeada e movida para `public/portfolio/`).

### Remover
- Toda a infraestrutura de auth: `src/app/[locale]/(auth)`, `src/app/[locale]/(member)`, `src/app/auth/callback`, `src/lib/auth/`, `src/lib/supabase/` (não há mais formulário nem login).
- Idiomas `de`, `fr`, `it` (mantém apenas `pt`, `en`, `es`).
- Tudo o que não pertence ao novo escopo (componentes, dados, hooks, páginas obsoletas).
- Dependências `@supabase/ssr` e `@supabase/supabase-js` do `package.json`.

### Adicionar
- Botão flutuante de WhatsApp persistente (`+55 19 97805-5531`).
- Páginas `/quem-somos`, `/portfolio` (lista + detalhe), `/produtos` (lista + detalhe), `/contato` estático.
- Conjunto de ícones 3D em PNG (`public/icons-3d/`).
- Componentes de marketing: `<HeroBento>`, `<Marquee>`, `<StatCounter>`, `<TestimonialCard>`, `<ProductCard>`, `<PortfolioCard>`, `<PricingTable>`, `<FAQAccordion>`, `<TrustBadges>`, `<WhatsAppCTA>`, `<HeroOrb>` (Three.js, lazy).

## 3. Arquitetura

### 3.1 Mapa de páginas

| Rota | Descrição |
|---|---|
| `/` | Home com 8 seções (ver §4.1) |
| `/quem-somos` | História + manifesto (ver §4.2) |
| `/portfolio` | Lista de 12 entregas com filtros |
| `/portfolio/[slug]` | Detalhe de cada entrega (12 páginas) |
| `/produtos` | Lista de 7 produtos com filtros por categoria |
| `/produtos/[slug]` | Landing de conversão por produto (7 páginas) |
| `/contato` | Página estática com WhatsApp + dados |

Todas as rotas vivem dentro de `src/app/[locale]/...` com `next-intl`.

### 3.2 i18n

- 3 arquivos de mensagens em `src/i18n/messages/`: `pt.json`, `en.json`, `es.json`.
- Apagar `de.json`, `fr.json`, `it.json`.
- `routing.ts` lista apenas `['pt', 'en', 'es']` com `defaultLocale: 'pt'`.
- Slugs localizados via `next-intl` para portfolio e produtos (PT vs EN vs ES podem ter slugs diferentes; exemplo: `software-de-gestao-empresarial-com-automacao` em pt, `business-management-software-with-automation` em en).
- `hreflang` cruzado entre as 3 línguas em todas as rotas.

### 3.3 Stack: papel de cada peça

| Lib | Uso |
|---|---|
| Next.js App Router | RSC por padrão; `'use client'` só onde animação/lightbox/marquee/sticky exigir. |
| Tailwind 4 | Utilitários básicos + tokens via CSS vars. |
| Framer Motion | Reveal, stagger, counter, parallax leve, transições de rota. `LazyMotion` + `domAnimation`. |
| next-intl | Mensagens, locales, slugs localizados. |
| Three.js | Único orbe decorativo na hero (lazy + desativado em `<768px`). |
| `yet-another-react-lightbox` | Galeria nas páginas de detalhe do portfólio. |
| `next/image` | Todas as imagens com AVIF/WebP. |
| `next/font` | Sora + Inter com `display: swap`. |

### 3.4 SEO

- `<title>` + `<meta description>` por rota e por idioma via `generateMetadata`.
- OpenGraph + Twitter Card com imagem dinâmica em `app/opengraph-image.tsx` (dark + neon + título da página).
- JSON-LD por rota:
  - Layout root: `Organization`.
  - Footer: `LocalBusiness` (endereço SP, telefone, e-mail, openingHours, geo).
  - `/produtos/[slug]`: `Service` + `Offer` + `FAQPage` + `BreadcrumbList`.
  - `/portfolio/[slug]`: `CreativeWork` + `BreadcrumbList`.
  - `/contato`: `LocalBusiness` completo.
- `sitemap.xml` e `robots.txt` via route handlers do App Router.
- `<link rel="canonical">` em todas as páginas.
- `hreflang` cruzado.

### 3.5 Performance

- Lighthouse alvo: 95+ em todas as métricas em todas as páginas.
- Bundle JS first-load alvo na home: `<150kb`.
- Server Components por padrão.
- Three.js dynamic import + lazy + desativado em mobile (`<768px`).
- Framer Motion com `LazyMotion`.
- Imagens com `priority` apenas na hero da home.
- Counter, lightbox, marquee, header sticky são os únicos pontos onde se justifica `'use client'`.

### 3.6 Acessibilidade

- WCAG AA mínimo.
- `prefers-reduced-motion` desativa todas as animações não essenciais (pulse, marquee, float, parallax, counter).
- Focus rings verdes neon visíveis em todos os elementos interativos.
- Um único `<h1>` por rota; `<main>`, `<nav>`, `<footer>`, `<section>` semânticos.
- `aria-current` na nav, `aria-label` em links sem texto, `lang` correto por locale.

## 4. Conteúdo & layout por página

### 4.1 Home — 8 seções verticais

1. **Hero** — 2 colunas no desktop, empilhada no mobile.
   - Esquerda: eyebrow com pulse "SOFTWARE · SITES · AUTOMAÇÕES" → H1 (Sora 700, gradient lime→branco) → subtítulo de prova → CTA primário "Falar no WhatsApp" + secundário "Ver portfólio" → trust line `300+ projetos · 8 anos · 100% satisfação · R$100k+/ano economizados`.
   - Direita (bento): card grande com mockup de dashboard real (default: HubFive — usar `public/portfolio/hubfive/1.png` ou imagem mais polida da pasta) + 3 cards flutuantes menores (ícone 3D + número/feature) com animação float fora de fase.
   - Background: `gradient-mesh` + grade de pontos + orbe Three.js opacity baixa (lazy, mobile-off).
2. **Marquee de clientes** — scroll infinito horizontal com wordmarks dos 6 clientes (BHG, HubFive, KZ Serviços, Sabas, Solumart, Vérité). Grayscale → cor on hover. Fade nas bordas.
3. **Depoimentos** — 3 cards lado-a-lado (swiper no mobile). Glassmorphism, aspas grandes verdes, foto/iniciais. Conteúdo placeholder com `// TODO: substituir por depoimento real` no código.
4. **Portfólio destaque** — 4 cards: Banco BHG (Software), KZ Serviços (App Cliente), HubFive (Software), Vérité (Site). Cada card: capa + tag de tipo + nome + cliente + (no hover) stack + "Ver detalhes →". Botão "Ver todos os projetos →" abaixo.
5. **Dados reais** — faixa full-width com counter animado:
   - R$ 100k+ economizados/ano por cliente
   - 300+ projetos entregues
   - 8 anos de mercado
   - 100% satisfação
   - Linha persuasiva: "Não somos só um número. Somos o time por trás dos números dos nossos clientes."
6. **Produtos destaque** — 3 cards: Landing Page, Site (com badge "MAIS ESCOLHIDO"), Software de Gestão Completo. Cada card com ícone 3D + preço-âncora + 4 bullets + CTA "Saber mais". Botão "Ver todos os produtos →" abaixo.
7. **Stacks que usamos** — faixa com 4 logos (React Native, n8n, Next.js, Supabase) com glow sutil. Copy: "Tecnologias que escolhemos por velocidade, segurança e escala."
8. **CTA final** — faixa neon saturada antes do footer: "Pronto pra acelerar?" + "Conversa direta no WhatsApp. Sem formulário. Sem espera de orçamento." + botão grande WhatsApp.

### 4.2 Quem somos — arco narrativo em 7 blocos

1. **Hero**: H1 "A gente existe pra fazer uma coisa: democratizar tecnologia de verdade no Brasil." + subtítulo de visão.
2. **A faísca (2017, software de pizzaria)** — bloco em 2 colunas: ilustração estilizada + texto narrando a origem.
3. **No que a gente acredita** — grid de 4 cards-manifesto:
   - "Velocidade não é inimiga da qualidade"
   - "Preço justo é estratégia, não desconto"
   - "Software só importa se gera resultado"
   - "Não atendemos todo mundo" (não trabalhamos com empresas com mais de 100 colaboradores)
4. **Divisor de águas (BHG)** — timeline visual + texto. Marcador `// TODO: confirmar ano do contrato BHG`.
5. **Time** — diagrama orbital: núcleo (Design · Programação · Marketing) + parceiros em órbita (Jurídico · Contábil · Financeiro · RH · Administrativo). Persuasão: "Você não contrata 'um dev'. Você contrata um sistema de operação completo."
6. **Visão** — bloco grande com glow: "A meta declarada: ser a maior empresa de tecnologia do Brasil."
7. **CTA**: WhatsApp + link discreto pra `/portfolio`.

**Tom**: direto, com personalidade, sem corporatês. Frases curtas. Crenças contrastantes como ponto de identidade.

### 4.3 Portfólio

#### 4.3.1 Reorganização das imagens

```
portifolio/                         →   public/portfolio/
  Banco BHG/                        →     banco-bhg/
  Full Finance HubFive/             →     hubfive/
  KZ Serviços/                      →     kz-servicos/
  Solumart Serviços/                →     solumart/
  Transportadora Sabas/             →     transportadora-sabas/
  Vérité Perícias Judiciais/        →     verite/
```

Os arquivos `descrição.txt` e `branding.pdf` migram junto. Não são servidos como rota pública (apenas referência de conteúdo).

#### 4.3.2 Modelo de dados

Cada uma das 12 entregas é uma entrada em `src/data/portfolio.ts`. Schema:

```ts
type PortfolioItem = {
  slug: string;                     // único global
  client: string;                   // ex: "Banco BHG"
  clientSlug: string;               // ex: "banco-bhg"
  type: 'site' | 'app' | 'web-app' | 'software';
  title: { pt: string; en: string; es: string };
  description: { pt: string; en: string; es: string };
  stack: string[];                  // ex: ['Next.js', 'Supabase', 'n8n']
  liveUrl: string;
  cover: string;                    // /portfolio/{clientSlug}/1.png
  gallery: string[];                // arquivos curados
  featuredOnHome: boolean;
  deliverables: string[];           // bullets do que foi entregue
};
```

#### 4.3.3 As 12 entregas

| Slug | Cliente | Tipo | Stack | Live | Home |
|---|---|---|---|---|---|
| `kz-servicos-app-cliente` | KZ Serviços | app | Next.js, Supabase, n8n | https://kz-serviços.netlify.app/ | ⭐ |
| `kz-servicos-app-prestador` | KZ Serviços | app | Next.js, Supabase, n8n | https://kz-serviços.netlify.app/ | |
| `kz-servicos-web-app-de-gestao` | KZ Serviços | web-app | Next.js, Supabase, n8n | https://kz-serviços.netlify.app/ | |
| `transportadora-sabas-site-institucional` | Transportadora Sabas | site | Next.js, Bubble, n8n | https://sabas.com.br/ | |
| `transportadora-sabas-software-de-gestao` | Transportadora Sabas | software | Next.js, Bubble, n8n | https://sabas.com.br/ | |
| `banco-bhg-site-institucional` | Banco BHG | site | Next.js, Supabase, n8n | https://bhgconsultoria.com | |
| `banco-bhg-software-de-gestao` | Banco BHG | software | Next.js, Supabase, n8n | https://bhgconsultoria.com | ⭐ |
| `hubfive-site-institucional` | HubFive | site | Next.js, Supabase, n8n | https://hubfive.com.br/ | |
| `hubfive-software-de-gestao` | HubFive | software | Next.js, Supabase, n8n | https://hubfive.com.br/ | ⭐ |
| `solumart-software-de-gestao` | Solumart Serviços | software | Bubble, Make | https://solumart.bubbleapps.io/ | |
| `solumart-app-prestador` | Solumart Serviços | app | Bubble, Make | https://solumart.bubbleapps.io/ | |
| `verite-pericias-judiciais-site-institucional` | Vérité Perícias Judiciais | site | Next.js, Supabase, n8n | https://institutoverite.com.br/ | ⭐ |

**Imagens por entrega no v1**: cada deliverable do mesmo cliente compartilha o conjunto completo de imagens da pasta do cliente. Marcador `// TODO: curar imagens por entrega` em `portfolio.ts` para refinamento futuro.

#### 4.3.4 Página `/portfolio`

- Hero curto: H1 "Projetos que entregamos" + subtítulo "12 entregas. 6 clientes. Cada um virou case porque o resultado virou método."
- Filtros em chips no topo (sticky):
  - Tipo: `Todos · Sites · Apps · Web Apps · Softwares`
  - Stack: `Next.js · Supabase · n8n · React Native · Bubble · Make`
  - Filtros somam (state local; URL state fica pra v2).
- Grid 3 colunas (desktop) / 2 (tablet) / 1 (mobile).
- 12 cards com animação reveal stagger.
- CTA final WhatsApp.

#### 4.3.5 Página `/portfolio/[slug]`

1. Breadcrumb: `Início / Portfólio / [Cliente] / [Entrega]`.
2. Hero: eyebrow (cliente) + H1 (entrega) + tags (tipo + stacks) + 2 CTAs ("Visitar projeto ↗" target=_blank rel=noopener + "Falar no WhatsApp" com mensagem pré-preenchida).
3. Imagem cover grande com border glow + parallax sutil.
4. Bloco descrição: 2 colunas (esquerda metadata estruturada · direita texto descritivo traduzido das `descrição.txt`).
5. Galeria com lightbox (3 colunas masonry-like).
6. "O que entregamos": bullets visuais com check verde, derivados de `deliverables`.
7. "Outras entregas pra esse cliente" (se aplicável): grid horizontal mostrando os outros deliverables com mesmo `clientSlug`.
8. "Outros projetos relacionados": 3 cards por similaridade (mesmo tipo OU mesma stack), excluindo o atual e os do mesmo cliente.
9. CTA final WhatsApp.

**SEO**: `<title>` `[Cliente] - [Entrega] · Portfólio BlackElephant`, descrição = primeiros 155 chars da descrição traduzida, JSON-LD `CreativeWork` + `BreadcrumbList`, OG image = cover.

### 4.4 Produtos

#### 4.4.1 Modelo de dados

`src/data/products.ts`:

```ts
type Product = {
  slug: string;                     // localizado por idioma
  category: 'sites' | 'landing-pages' | 'apps-e-sistemas' | 'operacao-digital';
  name: { pt; en; es };
  shortDescription: { pt; en; es };
  longDescription: { pt; en; es };
  icon: string;                     // chave do PNG em /public/icons-3d/
  pricing: {
    setup?: number;                 // R$
    monthly?: number;
    purchase?: number;
    deadline: { pt; en; es };
  };
  features: { pt: string[]; en: string[]; es: string[] };
  includes: { pt: string[]; en: string[]; es: string[] };
  forWho: { pt: string[]; en: string[]; es: string[] };
  process: Array<{ title; description }>;
  faq: Array<{ q; a }>;
  hasABVariant: boolean;
  abComparisonTarget?: string;      // slug do produto base (Site para Site A/B, etc)
  featuredOnHome: boolean;
};
```

#### 4.4.2 Os 7 produtos

| Slug PT | Categoria | Setup | Mensal | Compra | Prazo | Home |
|---|---|---|---|---|---|---|
| `desenvolvimento-de-landing-page-de-alta-conversao` | Landing Pages | R$ 148 | R$ 148 | R$ 798 | 72h | ⭐ |
| `desenvolvimento-de-landing-page-com-teste-ab` | Landing Pages | R$ 248 | R$ 248 | R$ 1.298 | 72h | |
| `desenvolvimento-de-site-profissional` | Sites | R$ 198 | R$ 198 | R$ 1.198 | 72h | ⭐ |
| `desenvolvimento-de-site-com-teste-ab` | Sites | R$ 248 | R$ 248 | R$ 1.998 | 72h | |
| `desenvolvimento-de-app-mobile-e-sistema-web` | Apps & Sistemas | R$ 4.000 | R$ 700 | R$ 12.000 | 15 dias | |
| `software-de-gestao-empresarial-com-automacao` | Apps & Sistemas | R$ 20.000 | R$ 6.000 | R$ 50.000 | 4 meses | ⭐ |
| `gerenciamento-de-emails-corporativos-google-workspace-office365` | Operação digital | — | R$ 99 (até 5) | — | 48h |  |

Cada produto tem suporte mensal incluso (hospedagem + domínio + ambiente seguro + atualizações por mês conforme catálogo). Detalhes na §7 do brief original e replicados em `products.ts`.

#### 4.4.3 Página `/produtos`

- Hero: H1 "Tudo que a gente faz, com preço claro." + subtítulo persuasivo.
- Tabs/chips de categoria: `Tudo · Sites · Landing Pages · Apps & Sistemas · Operação digital`.
- Grid 7 cards (3 cols / 2 / 1).
- Cada card: ícone 3D + categoria pill + nome + 1 frase + box de preço + prazo badge + 3 bullets + "Ver detalhes →".
- Faixa de comparação `<ProductComparison>` ao final: tabela com prazo, hospedagem, A/B, atualizações, preço de aquisição.
- CTA final WhatsApp.

#### 4.4.4 Página `/produtos/[slug]` — template de landing de conversão

1. **Hero**: breadcrumb + eyebrow categoria + H1 (com keyword principal) + subtítulo de resultado + box pricing visível + 2 CTAs (WhatsApp + scroll-down) + visual à direita.
2. **Strip de credibilidade**: clientes + 3 números (300+, 8 anos, 100%).
3. **Pra quem é**: 3-5 bullets visuais com check verde.
4. **O que está incluído**: grid de cards com features.
5. **Como funciona**: stepper horizontal 4 etapas (WhatsApp → briefing → desenvolvimento → entrega + suporte).
6. **Planos / Pricing**: tabela com colunas pra cada modalidade (Setup, Suporte mensal, Compra), botão WhatsApp em cada coluna.
7. **Comparativo A/B vs base** (apenas para os 2 produtos com variante A/B): tabela comparando.
8. **Cases relacionados**: 2-3 portfolio cards alinhados com o produto.
9. **FAQ**: 8-10 perguntas em accordion com schema `FAQPage`.
10. **Trust**: selos (8 anos, hospedagem inclusa, sem fidelidade, pagamento seguro).
11. **CTA final** WhatsApp.

**SEO**: title com keyword + marca, meta description focada em benefício, JSON-LD `Service` + `Offer` + `FAQPage` + `BreadcrumbList`, OG dinâmica, hreflang.

### 4.5 Contato — `/contato`

1. Hero: H1 "Sem formulário. Sem espera. Conversa direta." + subtítulo.
2. CTA WhatsApp gigante: card glassmorphism centralizado, headline + número + botão verde grande pulse → `wa.me/5519978055531?text=Olá, vim pelo site e quero conversar.`
3. 3 cards menores: E-mail (`guilherme@blackelephant.com.br`, com botão copiar e mailto) · Telefone (`+55 19 97805-5531`, botão `tel:`) · Endereço completo (Av. Yojiro Takaoka, 4384, Sala 701, Alphaville, Santana de Parnaíba — SP, 06541-038, com botão "Abrir no Google Maps").
4. Horário de atendimento: "Segunda a sexta, das 9h às 18h (horário de Brasília). Fora desse horário a gente lê e responde no próximo dia útil." Marcador `// TODO: confirmar horário`.
5. Mini-faixa de selos: resposta em minutos · 8 anos · sem orçamento de 30 dias · sigilo total.
6. Embed leve de Google Maps (lazy-loaded, com placeholder dark + glow enquanto carrega).
7. CTA final WhatsApp.

**SEO**: title "Contato · BlackElephant — WhatsApp, e-mail e endereço", JSON-LD `LocalBusiness` completo (address, telephone, email, openingHours, geo).

## 5. Elementos persistentes

### 5.1 Header

- Glassmorphism (`--glass-background` + `backdrop-blur`), border bottom verde sutil que aparece no scroll > 50px.
- Esquerda: logo + "BlackElephant" (Sora bold).
- Centro: nav (`Início`, `Quem somos`, `Portfólio`, `Produtos` com mega-menu, `Contato`). O mega-menu de Produtos lista os 7 produtos com link direto para cada `/produtos/[slug]` (agrupados visualmente pelas 4 categorias). A própria label "Produtos" é clicável e leva para `/produtos`. Sem dependência de filtros via URL state.
- Direita: seletor de idioma (PT · EN · ES) + botão CTA WhatsApp.
- Mobile: burger → drawer lateral com nav vertical + idiomas + CTA.
- Item ativo da rota com underline neon. `aria-current="page"`.

### 5.2 Footer

4 colunas (empilha no mobile):

1. **Marca**: logo + tagline + endereço.
2. **Site**: Início · Quem somos · Portfólio · Produtos · Contato.
3. **Produtos**: 7 links diretos.
4. **Contato direto**: WhatsApp pulse + e-mail + telefone.

Faixa inferior: copyright `© 2017–2026 BlackElephant Brasil LTDA · CNPJ XX.XXX.XXX/0001-XX` (`// TODO: confirmar CNPJ`), links `Política de Privacidade` (`// TODO: criar`), `Termos de Uso` (`// TODO: criar`), seletor de idioma redundante.

Visual: `--background-secondary`, border top verde sutil, grid pattern com opacity baixa.

### 5.3 Botão flutuante WhatsApp

- `fixed`, `bottom: 24px`, `right: 24px`, `z-index: var(--z-toast)`.
- 60×60 desktop / 56×56 mobile, verde lime, ícone branco.
- Pulse animation infinita (anel expandindo), respeitando `prefers-reduced-motion`.
- Tooltip "Fale com a gente" no hover desktop.
- Mensagem dinâmica por contexto (passa por prop): home, página de produto X, página de portfolio X, contato.
- Aparece com delay de 1.5s (Framer Motion `scale 0 → 1`) pra não competir com LCP.
- `aria-label` claro, `role="link"`, contraste AA+.

### 5.4 Loading & transições

- Loading inicial: dark + logo + linha pulsante verde, fade out em ~600ms.
- Transições de rota: `template.tsx` com `<motion.div>` fade leve + slide-up de 8px no novo conteúdo.
- `prefers-reduced-motion` desativa transições não essenciais.

### 5.5 Padrões cross-cutting

- Container: `max-w-[1400px] mx-auto px-6 lg:px-12`.
- Sections: `py-20 lg:py-32` desktop, `py-14` mobile.
- Reveal: hook `useScrollReveal` (componente `<ScrollReveal>` já existe e será mantido/adaptado).
- Imagens: `next/image` com `priority` apenas na hero da home.

## 6. Linguagem visual

### 6.1 Paleta

Mantém os tokens existentes em `src/styles/design-tokens.css`. Adições:

- `--color-lime-deep: #1a8a08`
- `--color-purple-accent: #b388ff` (uso pontual em ícones 3D)
- `--shadow-ink-md` / `--shadow-ink-lg` (cards no fundo claro do mockup de dashboard)
- `--ease-out-quint`, `--ease-spring` (timing curves para Framer Motion)

`[data-theme="light"]` permanece no CSS mas não é exposto na UI.

### 6.2 Tipografia

Sora (títulos) + Inter (body). Escala fluida com `clamp()`:

```css
--text-display: clamp(2.5rem, 5vw + 1rem, 4.5rem);
--text-h2:      clamp(2rem, 3vw + 1rem, 3rem);
--text-h3:      clamp(1.5rem, 2vw + 1rem, 2rem);
--text-lead:    clamp(1.125rem, 1vw + 0.875rem, 1.25rem);
```

Tracking H1 `-0.02em`. Line-height: `1.1` em display, `1.5` em corpo.

### 6.3 Catálogo de efeitos

| Efeito | Onde | Implementação |
|---|---|---|
| Glow neon | Cards destacados, CTAs primários, mockup hero | `box-shadow` com tokens `--shadow-glow*` |
| Pulse | Botão WhatsApp, eyebrows, badges | `@keyframes pulse-ring` |
| Grid de pontos | Backgrounds de seção | `background-image` repetida |
| Mesh gradient | Hero, CTA final | `--gradient-mesh` (existente) |
| Marquee | Logos clientes, stacks | `<Marquee>` CSS-only `@keyframes scroll` |
| Glassmorphism | Header, depoimentos, cards flutuantes | `backdrop-filter: blur(20px)` |
| Float | Cards menores da hero | Framer Motion `y: [0, -10, 0]` loop |
| Counter | Stats reais | `useInView` + tween |
| Reveal stagger | Listas e grids | `<ScrollReveal>` com delay incremental |
| Parallax leve | Hero, alguns cards | `useScroll` + `useTransform` |
| Three.js orbe | Hero (1 elemento) | Component `<HeroOrb>`, dynamic, mobile-off |

Política: tudo respeita `prefers-reduced-motion`; animação infinita só onde tem propósito; apenas `transform` + `opacity`.

### 6.4 Ícones 3D

- Pasta `public/icons-3d/`.
- Estética: low-poly, material brilhoso (verde lime, branco, roxo accent), fundo transparente.
- Conjunto inicial: gráfico subindo, engrenagem, raio, escudo, foguete, cifrão, sino, cubo, dashboard, smartphone, globo, e-mail (~12 ícones).
- Origem v1: conjunto open com licença permissiva (ex: 3dicons.co), com `// TODO: substituir por arte custom da Black` em `products.ts`.

### 6.5 Tom de copy

- Voz: direta, confiante, sem rodeio. Frases curtas. Zero corporatês.
- Vocabulário a usar: "em tempo recorde", "sem enrolação", "sem espera", "do jeito certo", "no horário", "resultado", "impacto", "operação", "automação".
- Vocabulário a evitar: "soluções", "transformação digital", "ecossistema", "sinergia", "ponta a ponta", "solução robusta", "expertise comprovada", adjetivo + adjetivo + adjetivo em sequência.
- Estrutura: H1 = afirmação + benefício; subtítulo = prova; body = parágrafos curtos ou bullets.

EN/ES seguem o mesmo espírito traduzidos de forma idiomática (não literal).

## 7. Dependências

### Adicionar
- Nenhuma nova além das já existentes — Framer Motion, Three.js, next-intl, lightbox e Tailwind 4 já estão.
- (Possível) `clsx` ou `tailwind-merge` se ainda não estiverem no projeto e forem úteis.

### Remover
- `@supabase/ssr`
- `@supabase/supabase-js`

### Manter
- `@types/three`
- `framer-motion`
- `next` 16.1.5
- `next-intl`
- `react` 19, `react-dom` 19
- `three`
- `yet-another-react-lightbox`

## 8. Arquivos / pastas (alvo final)

```
public/
  logo.png
  icons-3d/
    {chart, gear, bolt, shield, rocket, dollar, bell, cube, dashboard, phone, globe, envelope}.png
  portfolio/
    banco-bhg/, hubfive/, kz-servicos/, solumart/, transportadora-sabas/, verite/
src/
  app/
    [locale]/
      layout.tsx
      page.tsx                            # Home
      quem-somos/page.tsx
      portfolio/page.tsx
      portfolio/[slug]/page.tsx
      produtos/page.tsx
      produtos/[slug]/page.tsx
      contato/page.tsx
    opengraph-image.tsx
    sitemap.ts
    robots.ts
    globals.css
  components/
    layout/
      Header.tsx, Footer.tsx, LanguageSwitcher.tsx, MobileNav.tsx
    ui/
      Button.tsx, Marquee.tsx, ScrollReveal.tsx, AnimatedSection.tsx,
      HeroBg.tsx, HeroOrb.tsx, FloatCard.tsx, Glow.tsx, FAQAccordion.tsx,
      PriceTag.tsx, StatCounter.tsx, TrustBadges.tsx, WhatsAppButton.tsx,
      WhatsAppFloating.tsx, Lightbox.tsx, LoadingScreen.tsx, Logo.tsx
    providers/
      LoadingProvider.tsx
    sections/
      home/{Hero, ClientMarquee, Testimonials, FeaturedPortfolio, RealStats, FeaturedProducts, StackStrip, FinalCTA}.tsx
      portfolio/{PortfolioGrid, PortfolioCard, PortfolioFilters, PortfolioDetail, RelatedProjects, ClientOtherWork}.tsx
      products/{ProductGrid, ProductCard, ProductFilters, ProductDetail, ProductPricing, ProductFAQ, ProductComparison}.tsx
      about/{Origin, Manifesto, TurningPoint, TeamOrbit, Vision}.tsx
      contact/{ContactHero, WhatsAppHero, ContactCards, BusinessHours, MapEmbed}.tsx
  data/
    portfolio.ts                          # 12 entregas
    products.ts                           # 7 produtos
    testimonials.ts                       # placeholders com TODO
    stack.ts                              # 4 stacks da home
  i18n/
    routing.ts                            # ['pt','en','es']
    request.ts
    navigation.ts
    messages/{pt,en,es}.json
  lib/
    metadata.ts                           # helpers de generateMetadata
    schema.ts                             # geradores JSON-LD
    whatsapp.ts                           # gerador de URL com mensagem por contexto
    utils/index.ts
  styles/
    design-tokens.css                     # mantém + adições da §6.1
  types/
    index.ts
  middleware.ts                           # next-intl
```

Tudo que não está acima e existe hoje será apagado (incluindo subpastas `(auth)`, `(member)`, `auth/callback`, `lib/auth`, `lib/supabase`, `app/favicon.ico` (já está no git como deletado), `src/components/features/HomeClient.tsx` legacy, `src/components/ui/LiquidGlass.tsx` legacy, etc).

## 9. TODOs marcados explicitamente no código

Itens que não bloqueiam o lançamento mas precisam ser preenchidos por humano depois:

- `// TODO: substituir por depoimento real` — em `src/data/testimonials.ts` (3 entradas)
- `// TODO: curar imagens por entrega` — em `src/data/portfolio.ts` (cabeçalho)
- `// TODO: confirmar ano do contrato BHG` — na página Quem Somos
- `// TODO: confirmar horário de atendimento` — na página Contato
- `// TODO: confirmar CNPJ` — no footer
- `// TODO: criar Política de Privacidade` — link no footer
- `// TODO: criar Termos de Uso` — link no footer
- `// TODO: substituir ícones 3D por arte custom da Black` — em `src/data/products.ts` (cabeçalho)

## 10. O que está fora de escopo

- Tema light/dark exposto na UI.
- Formulário de contato.
- Área de membros / dashboard / login.
- URL state nos filtros do portfólio (fica para v2).
- Páginas Política de Privacidade e Termos de Uso (TODO no footer).
- Blog ou área de conteúdo editorial.
- Integração com analytics/ads (ficará separado).
- Tradução real de pt para en/es: o spec assume que será feita junto da implementação com qualidade idiomática (não Google Translate); revisão humana das traduções pode ser feita após o lançamento.
