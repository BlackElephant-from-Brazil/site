# Sites Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated premium ad landing page at `/[locale]/sites-landing-pages` for landing page and multipage website sales, with Portuguese and English copy.

**Architecture:** Add one localized public route that renders a client-side campaign component. Keep the campaign copy, product data, external links, and form state local to the new component; import existing portfolio data and analytics helpers where useful. The existing `SiteShell` provides header, footer, analytics scripts, and floating mobile WhatsApp.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, next-intl locale routing.

---

## File Structure

- Create `src/app/[locale]/sites-landing-pages/page.tsx`
  - Server route entry.
  - Sets request locale.
  - Generates metadata for Portuguese and English.
  - Renders `SitesLandingPagesClient`.
- Create `src/components/sites-landing-pages/SitesLandingPagesClient.tsx`
  - Client component with all campaign sections.
  - Localized copy object for `pt` and `en`, with English fallback for other locales.
  - Constants for Stripe, WhatsApp, Calendly, and webhook URLs.
  - Contact form state and submit behavior.
  - Reuses `portfolioItems` from `src/data/portfolio.ts`.
  - Uses `reportReservarHorarioConversion` from `src/lib/analytics/google-ads.ts`.

No database, Supabase, server actions, or global i18n message files are touched.

## Verification Strategy

The repository has no automated test script. Verification for each implementation task uses:

- `npm run lint`
- `npm run build`

Final manual check:

- Open `/pt/sites-landing-pages`
- Open `/en/sites-landing-pages`
- Check desktop and mobile widths
- Check Stripe, WhatsApp, Calendly, and contact form behavior

---

### Task 1: Add The Localized Route

**Files:**
- Create: `src/app/[locale]/sites-landing-pages/page.tsx`
- Depends on: `src/components/sites-landing-pages/SitesLandingPagesClient.tsx` created in Task 2

- [ ] **Step 1: Create the route file**

Create `src/app/[locale]/sites-landing-pages/page.tsx` with this structure:

```tsx
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SitesLandingPagesClient } from '@/components/sites-landing-pages/SitesLandingPagesClient';

type Props = {
  params: Promise<{ locale: string }>;
};

const metadataByLocale = {
  pt: {
    title: 'Landing Pages e Sites que Vendem | BlackElephant',
    description:
      'Landing pages de alta conversao e sites multipagina premium para transformar trafego pago em leads, WhatsApp e vendas.',
  },
  en: {
    title: 'Landing Pages and Websites That Sell | BlackElephant',
    description:
      'High-converting landing pages and premium multipage websites built to turn paid traffic into leads, WhatsApp conversations, and sales.',
  },
};

function getMetadataCopy(locale: string) {
  return locale === 'pt' ? metadataByLocale.pt : metadataByLocale.en;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getMetadataCopy(locale);

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: 'website',
      siteName: 'BlackElephant',
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
    },
    alternates: {
      canonical: `/${locale}/sites-landing-pages`,
      languages: {
        'pt-BR': '/pt/sites-landing-pages',
        en: '/en/sites-landing-pages',
      },
    },
  };
}

export default async function SitesLandingPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SitesLandingPagesClient locale={locale} />;
}
```

- [ ] **Step 2: Run route verification**

Run:

```bash
npm run lint
```

Expected: it may fail until Task 2 creates `SitesLandingPagesClient`. If it fails only with a missing module for that component, continue to Task 2.

- [ ] **Step 3: Commit after Task 2 passes**

Do not commit Task 1 alone if the import is still missing. Commit after Task 2 produces a lint-passing route/component pair.

---

### Task 2: Create Campaign Data, Helpers, And Page Shell

**Files:**
- Create: `src/components/sites-landing-pages/SitesLandingPagesClient.tsx`
- Modify: `src/app/[locale]/sites-landing-pages/page.tsx` only if import naming needs correction

- [ ] **Step 1: Create the client component with constants and localized copy**

Create `src/components/sites-landing-pages/SitesLandingPagesClient.tsx` as a client component. Start with this shape:

```tsx
'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { portfolioItems } from '@/data/portfolio';
import { reportReservarHorarioConversion } from '@/lib/analytics/google-ads';
import { cn } from '@/lib/utils';

type LocaleKey = 'pt' | 'en';
type SitesLandingPagesClientProps = {
  locale: string;
};

const LINKS = {
  whatsapp: 'https://wa.me/5519978055531',
  calendly: 'https://calendly.com/guilherme-blackelephant/30min',
  landingCheckout: 'https://buy.stripe.com/test_7sYfZh5ZJ0Hn4TacuoenS01',
  websiteCheckout: 'https://buy.stripe.com/test_14AfZh3RB9dTgBS9icenS02',
  contactWebhook: 'https://black-elephant.app.n8n.cloud/webhook/blackelephant-contact-form',
} as const;

function getLocale(locale: string): LocaleKey {
  return locale === 'pt' ? 'pt' : 'en';
}

const COPY = {
  pt: {
    eyebrow: 'Landing pages e sites para campanhas que precisam vender',
    heroTitle: 'Seu anuncio merece uma pagina que transforma clique em cliente.',
    heroText:
      'Criamos landing pages de alta conversao e sites multipagina premium para empresas que querem vender com mais clareza, velocidade e presenca digital.',
    buyLanding: 'Comprar landing page',
    buyWebsite: 'Comprar site multipagina',
    whatsapp: 'Chamar no WhatsApp',
    calendly: 'Agendar call',
    landingName: 'Landing Page de Alta Conversao',
    websiteName: 'Site Multipagina',
    landingPrice: 'R$ 1.997',
    websitePrice: 'R$ 3.500',
    websiteScope: '8 paginas',
    formTitle: 'Fale com a BlackElephant',
    formText: 'Envie uma mensagem e conte qual pagina sua empresa precisa vender melhor.',
    name: 'Nome',
    email: 'Email',
    message: 'Mensagem',
    submit: 'Enviar mensagem',
    sending: 'Enviando...',
    success: 'Mensagem enviada. Vamos responder em breve.',
    error: 'Nao foi possivel enviar agora. Tente novamente ou chame no WhatsApp.',
  },
  en: {
    eyebrow: 'Landing pages and websites for campaigns that need to sell',
    heroTitle: 'Your ad deserves a page that turns clicks into customers.',
    heroText:
      'We build high-converting landing pages and premium multipage websites for companies that need more clarity, speed, and digital presence.',
    buyLanding: 'Buy landing page',
    buyWebsite: 'Buy multipage website',
    whatsapp: 'Message on WhatsApp',
    calendly: 'Schedule a call',
    landingName: 'High-Converting Landing Page',
    websiteName: 'Multipage Website',
    landingPrice: 'US$ 1,997',
    websitePrice: 'US$ 3,500',
    websiteScope: '8 pages',
    formTitle: 'Talk to BlackElephant',
    formText: 'Send a message and tell us what page your company needs to sell better.',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending...',
    success: 'Message sent. We will reply soon.',
    error: 'We could not send it now. Try again or message us on WhatsApp.',
  },
} as const;

export function SitesLandingPagesClient({ locale }: SitesLandingPagesClientProps) {
  const activeLocale = getLocale(locale);
  const copy = COPY[activeLocale];
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="min-h-screen overflow-hidden pt-16 lg:pt-20"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <HeroSection copy={copy} reduceMotion={reduceMotion} />
    </div>
  );
}
```

- [ ] **Step 2: Add minimal `HeroSection` placeholder that compiles**

Add this local component below `SitesLandingPagesClient`:

```tsx
function HeroSection({
  copy,
  reduceMotion,
}: {
  copy: (typeof COPY)['pt'];
  reduceMotion: boolean | null;
}) {
  return (
    <section className="relative min-h-[82vh] overflow-hidden py-16 lg:py-24">
      <div className="site-container relative z-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]">
            {copy.eyebrow}
          </p>
          <h1
            className="text-[2.75rem] font-black leading-[0.95] sm:text-[4rem] lg:text-[5.7rem]"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            {copy.heroTitle}
          </h1>
          <p className="mt-7 max-w-2xl text-[1.05rem] leading-[1.65] text-white/68 lg:text-[1.2rem]">
            {copy.heroText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS. If lint flags unused imports because later sections are not built yet, remove unused imports temporarily or implement the next task before committing.

- [ ] **Step 4: Commit route and shell**

Run:

```bash
git add src/app/[locale]/sites-landing-pages/page.tsx src/components/sites-landing-pages/SitesLandingPagesClient.tsx
git commit -m "feat: add sites landing pages route"
```

Expected: commit succeeds.

---

### Task 3: Implement Above-The-Fold Conversion Sections

**Files:**
- Modify: `src/components/sites-landing-pages/SitesLandingPagesClient.tsx`

- [ ] **Step 1: Extend localized copy for hero, marquee, problem, and products**

Add localized arrays to `COPY.pt` and `COPY.en`:

```tsx
trustChips: ['Performance', 'Responsivo', 'SEO', 'Pronto para tracking', 'Design premium'],
marqueeOne: ['ALTA CONVERSAO', 'SEO', 'PERFORMANCE', 'DESIGN PREMIUM', 'WHATSAPP', 'TRAFEGO PAGO', 'COPY ESTRATEGICA'],
problemTitle: 'Pagina fraca queima verba de trafego.',
problemText: 'Quando o clique chega em uma pagina lenta, confusa ou generica, a campanha paga pela visita e perde a venda.',
outcomes: ['Oferta clara', 'CTA visivel', 'Carregamento rapido', 'Mensagem alinhada ao anuncio'],
productsTitle: 'Escolha o formato certo para vender agora.',
productsText: 'Compra direta para quem ja decidiu. WhatsApp e call para quem quer validar o melhor caminho antes.',
landingDescription: 'Uma pagina focada para campanhas, lancamentos, captacao de leads e conversao por WhatsApp.',
websiteDescription: 'Um site profissional de 8 paginas para autoridade, SEO, servicos, prova e contato.',
productIncludes: ['Copy e estrutura', 'Design responsivo', 'Performance', 'Publicacao assistida'],
```

English equivalents:

```tsx
trustChips: ['Performance', 'Responsive', 'SEO', 'Tracking-ready', 'Premium design'],
marqueeOne: ['HIGH CONVERSION', 'SEO', 'PERFORMANCE', 'PREMIUM DESIGN', 'WHATSAPP', 'PAID TRAFFIC', 'STRATEGIC COPY'],
problemTitle: 'A weak page burns paid traffic budget.',
problemText: 'When a click lands on a slow, confusing, or generic page, the campaign pays for the visit and loses the sale.',
outcomes: ['Clear offer', 'Visible CTA', 'Fast loading', 'Message match with the ad'],
productsTitle: 'Choose the right format to sell now.',
productsText: 'Direct purchase for buyers who are ready. WhatsApp and call for buyers who want to validate the best path first.',
landingDescription: 'One focused page for campaigns, launches, lead capture, and WhatsApp conversion.',
websiteDescription: 'An 8-page professional website for authority, SEO, services, proof, and contact.',
productIncludes: ['Copy and structure', 'Responsive design', 'Performance', 'Launch support'],
```

- [ ] **Step 2: Replace the hero placeholder with full hero CTAs and animated visual**

Implement:

- Primary anchors to `LINKS.landingCheckout` and `LINKS.websiteCheckout`
- Secondary anchors to `LINKS.whatsapp` and `LINKS.calendly`
- `onClick={reportReservarHorarioConversion}` only on the Calendly anchor
- Trust chips from `copy.trustChips`
- Animated right-side conversion visual with cards for traffic, offer, lead, WhatsApp, and sale

Use classes consistent with existing public pages:

```tsx
className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95"
```

For the hero layout:

```tsx
className="grid min-h-[82vh] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20"
```

- [ ] **Step 3: Add `MarqueeBand`, `ProblemSection`, and `ProductsSection`**

Add three local components:

- `MarqueeBand({ items, variant })`
- `ProblemSection({ copy, reduceMotion })`
- `ProductsSection({ copy, reduceMotion })`

Product card requirements:

- Landing card uses `LINKS.landingCheckout`
- Website card uses `LINKS.websiteCheckout`
- Both cards include WhatsApp secondary CTA
- Portuguese prices are `R$ 1.997` and `R$ 3.500`
- English prices are `US$ 1,997` and `US$ 3,500`

- [ ] **Step 4: Wire sections into the page shell**

Update the return order:

```tsx
<HeroSection copy={copy} reduceMotion={reduceMotion} />
<MarqueeBand items={copy.marqueeOne} variant="primary" />
<ProblemSection copy={copy} reduceMotion={reduceMotion} />
<ProductsSection copy={copy} reduceMotion={reduceMotion} />
```

- [ ] **Step 5: Run lint and commit**

Run:

```bash
npm run lint
```

Expected: PASS.

Run:

```bash
git add src/components/sites-landing-pages/SitesLandingPagesClient.tsx
git commit -m "feat: build landing hero and product sections"
```

Expected: commit succeeds.

---

### Task 4: Implement Benefits, Portfolio, Second Marquee, Testimonials, And Process

**Files:**
- Modify: `src/components/sites-landing-pages/SitesLandingPagesClient.tsx`

- [ ] **Step 1: Extend localized copy for mid-page sections**

Add localized copy:

```tsx
landingBenefitsTitle: 'Por que uma landing page converte melhor em campanha',
landingBenefits: [
  'Um unico objetivo por pagina',
  'Oferta e CTA sem dispersao',
  'Estrutura pronta para trafego pago',
  'Captura de lead e WhatsApp em destaque',
  'Mensagem alinhada ao anuncio',
  'Experiencia rapida no mobile',
],
websiteBenefitsTitle: 'Por que um site multipagina aumenta autoridade',
websiteBenefits: [
  'Mais superficie para SEO',
  'Paginas para cada servico',
  'Mais contexto para visitante frio',
  'Presenca institucional forte',
  'Base para conteudo e campanhas futuras',
  'Mais espaco para prova, processo e contato',
],
portfolioTitle: 'Projetos que mostram execucao real',
portfolioText: 'Selecionamos cases de sites e plataformas para mostrar a qualidade visual e tecnica da entrega.',
portfolioCta: 'Ver portfolio completo',
marqueeTwo: ['SEU ANUNCIO MERECE UMA PAGINA QUE VENDA'],
testimonialsTitle: 'Prova social para reduzir o risco da decisao',
processTitle: 'Como tiramos sua pagina do briefing para o ar',
process: [
  ['Briefing', 'Entendemos negocio, oferta, publico e objetivo de conversao.'],
  ['Estrutura', 'Organizamos copy, secoes, fluxo e chamadas para acao.'],
  ['Design e desenvolvimento', 'Criamos uma experiencia responsiva, rapida e premium.'],
  ['Lancamento', 'Publicamos e deixamos a estrutura pronta para CTAs e tracking.'],
],
```

Add this English copy with the same array lengths:

```tsx
landingBenefitsTitle: 'Why a landing page converts better for campaigns',
landingBenefits: [
  'One objective per page',
  'Offer and CTA without distraction',
  'Structure built for paid traffic',
  'Lead capture and WhatsApp in focus',
  'Message aligned with the ad',
  'Fast mobile experience',
],
websiteBenefitsTitle: 'Why a multipage website builds authority',
websiteBenefits: [
  'More surface for SEO',
  'Pages for each service',
  'More context for cold visitors',
  'Stronger institutional presence',
  'Base for future content and campaigns',
  'More room for proof, process, and contact',
],
portfolioTitle: 'Projects that show real execution',
portfolioText: 'Selected website and platform cases that show the visual and technical quality of the delivery.',
portfolioCta: 'View full portfolio',
marqueeTwo: ['YOUR AD DESERVES A PAGE THAT SELLS'],
testimonialsTitle: 'Social proof to reduce decision risk',
processTitle: 'How we take your page from briefing to launch',
process: [
  ['Briefing', 'We understand the business, offer, audience, and conversion goal.'],
  ['Structure', 'We organize copy, sections, flow, and calls to action.'],
  ['Design and development', 'We create a responsive, fast, premium experience.'],
  ['Launch', 'We publish and prepare the structure for CTAs and tracking.'],
],
```

- [ ] **Step 2: Add `BenefitsSection`**

Implement one reusable section:

```tsx
function BenefitsSection({
  title,
  items,
  accent,
  reduceMotion,
}: {
  title: string;
  items: readonly string[];
  accent: 'lime' | 'cyan' | 'pink';
  reduceMotion: boolean | null;
}) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <h2 className="max-w-3xl text-[2.25rem] font-black leading-[1] lg:text-[4rem]" style={{ fontFamily: 'var(--font-title)' }}>
          {title}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.article
              key={item}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
            >
              <span className="text-sm font-black text-[var(--color-lime)]">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-5 text-lg font-semibold leading-snug text-white">{item}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Render it twice:

- Landing benefits with `accent="lime"`
- Website benefits with `accent="cyan"`

- [ ] **Step 3: Add `PortfolioSection` using existing portfolio data**

Use:

```tsx
const featuredPortfolio = useMemo(
  () => portfolioItems.filter((item) => item.category === 'sites').slice(0, 3),
  []
);
```

If a thumbnail is present, render it with `next/image`. Link each card to `/portfolio/${item.slug}` using `Link` from `@/i18n/navigation`.

- [ ] **Step 4: Add compact testimonials**

Add a local `TESTIMONIALS` object keyed by `pt` and `en` with three compact reviews. Use general review text that does not claim hard metrics unless already present in the existing review component.

Render cards with initials, five star icons, name/role, and short text.

- [ ] **Step 5: Add `ProcessSection`**

Render the four process steps from copy. On desktop, use four columns. On mobile, stack cards vertically.

- [ ] **Step 6: Add the second marquee**

Render:

```tsx
<MarqueeBand items={copy.marqueeTwo} variant="secondary" />
```

Place it between portfolio and testimonials.

- [ ] **Step 7: Wire the full mid-page order**

After `ProductsSection`, render:

```tsx
<BenefitsSection title={copy.landingBenefitsTitle} items={copy.landingBenefits} accent="lime" reduceMotion={reduceMotion} />
<BenefitsSection title={copy.websiteBenefitsTitle} items={copy.websiteBenefits} accent="cyan" reduceMotion={reduceMotion} />
<PortfolioSection copy={copy} locale={activeLocale} reduceMotion={reduceMotion} />
<MarqueeBand items={copy.marqueeTwo} variant="secondary" />
<TestimonialsSection locale={activeLocale} copy={copy} reduceMotion={reduceMotion} />
<ProcessSection copy={copy} reduceMotion={reduceMotion} />
```

- [ ] **Step 8: Run lint and commit**

Run:

```bash
npm run lint
```

Expected: PASS.

Run:

```bash
git add src/components/sites-landing-pages/SitesLandingPagesClient.tsx
git commit -m "feat: add landing proof and benefit sections"
```

Expected: commit succeeds.

---

### Task 5: Implement Contact CTA, FAQ, And Final Polish

**Files:**
- Modify: `src/components/sites-landing-pages/SitesLandingPagesClient.tsx`

- [ ] **Step 1: Add localized FAQ and final CTA copy**

Add copy:

```tsx
faqTitle: 'Duvidas antes de comprar',
faqs: [
  ['Qual a diferenca entre landing page e site multipagina?', 'A landing page foca em uma oferta e uma conversao. O site multipagina cria autoridade, SEO e paginas para diferentes servicos.'],
  ['Posso comprar direto?', 'Sim. Use os botoes de compra direta. Se quiser validar o melhor formato antes, chame no WhatsApp ou agende uma call.'],
  ['O que preciso enviar?', 'Oferta, referencias, identidade visual se existir, textos ou informacoes do negocio e acesso aos canais que serao usados nos CTAs.'],
  ['Funciona no celular?', 'Sim. A pagina sera responsiva e pensada para a experiencia mobile.'],
  ['Da para usar WhatsApp e Calendly?', 'Sim. Os CTAs podem direcionar para WhatsApp, Calendly, formulario ou checkout, conforme a estrategia.'],
],
contactPanelTitle: 'Prefere falar antes?',
contactPanelText: 'Use WhatsApp, call ou mensagem. O caminho mais rapido e escolher como voce quer vender.',
```

Add this English FAQ and final CTA copy:

```tsx
faqTitle: 'Questions before buying',
faqs: [
  ['What is the difference between a landing page and a multipage website?', 'A landing page focuses on one offer and one conversion. A multipage website builds authority, SEO, and pages for different services.'],
  ['Can I buy directly?', 'Yes. Use the direct purchase buttons. If you want to validate the best format first, message us on WhatsApp or schedule a call.'],
  ['What do I need to send?', 'Offer details, references, visual identity if available, business information, and access to the channels used in the CTAs.'],
  ['Does it work on mobile?', 'Yes. The page will be responsive and designed for the mobile experience.'],
  ['Can we use WhatsApp and Calendly?', 'Yes. CTAs can point to WhatsApp, Calendly, a form, or checkout depending on the strategy.'],
],
contactPanelTitle: 'Prefer to talk first?',
contactPanelText: 'Use WhatsApp, a call, or a message. The fastest path is choosing how you want to sell.',
```

- [ ] **Step 2: Add contact form state to the main component**

Add state:

```tsx
const [formData, setFormData] = useState({ nome: '', email: '', mensagem: '' });
const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
const [isSubmitting, setIsSubmitting] = useState(false);
```

Add handlers:

```tsx
const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = event.target;
  setFormData((current) => ({ ...current, [name]: value }));
};

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setIsSubmitting(true);
  setSubmitStatus('idle');

  try {
    const response = await fetch(LINKS.contactWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        origem: 'sites-landing-pages',
        locale: activeLocale,
      }),
    });

    if (!response.ok) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('success');
    setFormData({ nome: '', email: '', mensagem: '' });
  } catch {
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};
```

- [ ] **Step 3: Add `ContactSection`**

Implement a section that receives:

```tsx
function ContactSection({
  copy,
  formData,
  submitStatus,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  copy: (typeof COPY)['pt'];
  formData: { nome: string; email: string; mensagem: string };
  submitStatus: 'idle' | 'success' | 'error';
  isSubmitting: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container grid gap-8 lg:grid-cols-[1fr_0.72fr]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 lg:p-8">
          <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-title)' }}>{copy.formTitle}</h2>
          <p className="mt-3 text-white/60">{copy.formText}</p>
          {submitStatus === 'success' && <p className="mt-5 rounded-xl border border-[var(--color-lime)]/30 bg-[var(--color-lime)]/10 p-4 text-sm text-[var(--color-lime)]">{copy.success}</p>}
          {submitStatus === 'error' && <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">{copy.error}</p>}
          <div className="mt-7 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-white">
              {copy.name}
              <input name="nome" required value={formData.nome} onChange={onChange} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--color-lime)]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white">
              {copy.email}
              <input name="email" type="email" required value={formData.email} onChange={onChange} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--color-lime)]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-white">
              {copy.message}
              <textarea name="mensagem" required rows={5} value={formData.mensagem} onChange={onChange} className="resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--color-lime)]" />
            </label>
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-[var(--color-lime)] px-7 py-4 font-black text-black disabled:opacity-60">
              {isSubmitting ? copy.sending : copy.submit}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
```

Requirements:

- Inputs have `label` and `required`.
- Submit button shows `copy.sending` while loading.
- Success and error messages render below the form title.
- Side panel includes WhatsApp, Calendly, landing checkout, and website checkout anchors.
- Calendly anchor calls `reportReservarHorarioConversion`.

- [ ] **Step 4: Add `FaqSection`**

Render `copy.faqs` in a two-column responsive grid or stacked list. Keep answers visible without an accordion to avoid unnecessary state.

- [ ] **Step 5: Wire final sections**

After `ProcessSection`, render:

```tsx
<ContactSection
  copy={copy}
  formData={formData}
  submitStatus={submitStatus}
  isSubmitting={isSubmitting}
  onChange={handleChange}
  onSubmit={handleSubmit}
/>
<FaqSection copy={copy} reduceMotion={reduceMotion} />
```

- [ ] **Step 6: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit completed landing page**

Run:

```bash
git add src/components/sites-landing-pages/SitesLandingPagesClient.tsx
git commit -m "feat: complete sites landing page conversion flow"
```

Expected: commit succeeds.

---

### Task 6: Manual Browser Verification

**Files:**
- No code changes unless issues are found

- [ ] **Step 1: Start the development server**

Run:

```bash
npm run dev
```

Expected: Next.js dev server starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Check Portuguese page**

Open:

```text
http://localhost:3000/pt/sites-landing-pages
```

Verify:

- Page renders with header and footer.
- Prices show `R$ 1.997` and `R$ 3.500`.
- There are exactly two marquee sections.
- Landing checkout opens `https://buy.stripe.com/test_7sYfZh5ZJ0Hn4TacuoenS01`.
- Website checkout opens `https://buy.stripe.com/test_14AfZh3RB9dTgBS9icenS02`.
- WhatsApp buttons open `https://wa.me/5519978055531`.
- Calendly buttons open `https://calendly.com/guilherme-blackelephant/30min`.

- [ ] **Step 3: Check English page**

Open:

```text
http://localhost:3000/en/sites-landing-pages
```

Verify:

- Page renders in English.
- Prices show `US$ 1,997` and `US$ 3,500`.
- Portfolio links use localized routing.
- Header and footer still work.

- [ ] **Step 4: Check responsive layout**

Use browser device tools or Playwright screenshot checks for:

- Desktop width around `1440px`
- Mobile width around `390px`

Verify:

- No horizontal overflow.
- Button text does not overflow.
- Hero visual does not cover text.
- Contact form remains usable on mobile.

- [ ] **Step 5: Fix any browser issues and commit**

If manual verification reveals layout or runtime issues, patch the relevant component, then run:

```bash
npm run lint
npm run build
```

Expected: both PASS.

Commit fixes:

```bash
git add src/components/sites-landing-pages/SitesLandingPagesClient.tsx src/app/[locale]/sites-landing-pages/page.tsx
git commit -m "fix: polish sites landing page responsiveness"
```

Skip this commit if no issues are found.
