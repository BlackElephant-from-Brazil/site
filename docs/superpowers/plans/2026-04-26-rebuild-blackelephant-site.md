# Rebuild do site BlackElephant — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild from scratch the BlackElephant institutional site as a Next.js 16 multilingual (pt/en/es) marketing site with cyberpunk neon aesthetic, 7 product landing pages, 12 portfolio detail pages, no contact form (WhatsApp-only conversion), and Lighthouse 95+ across all metrics.

**Architecture:** Next.js 16 App Router with React Server Components by default; `'use client'` reserved for animations, marquees, lightbox, sticky header. next-intl for i18n with localized slugs. Design tokens in CSS vars (preserve existing palette `#39FF14` lime + black). Framer Motion for reveal/parallax/counter, Three.js for one decorative hero orb. Marketing data lives in typed `.ts` files with multilingual fields (pt/en/es) — no CMS. SEO via `generateMetadata` + JSON-LD per route.

**Tech Stack:** Next.js 16.1.5 · React 19.2 · Tailwind 4 · next-intl 4.7 · Framer Motion 12 · Three.js 0.183 · yet-another-react-lightbox 3.28 · Vitest + Testing Library (added in Task 3).

**Test strategy:** Strict TDD on pure logic units (WhatsApp URL builder, JSON-LD schema generators, slug helpers, filter logic, data shape validation). Visual UI components are validated by a smoke test (renders without crashing + key text present) and manual browser QA against the design spec. Final gate: Lighthouse 95+ + a11y axe scan + responsive check at 360/768/1280/1920.

**Reference spec:** `docs/superpowers/specs/2026-04-26-rebuild-blackelephant-site-design.md` — read sections referenced from each task.

**Working directory:** Project root `c:/Users/guilh/OneDrive/Documents/BlackElephant/Projetos/site`. All paths in tasks are repo-relative.

**Convention notes:**
- Branch: work directly on `main` (this is a rebuild, not a feature). Frequent commits at task boundaries.
- Whenever a task changes `src/data/*` or `src/lib/whatsapp.ts` interface, run all related tests before commit.
- Every commit message follows: `type: short subject` where type ∈ `chore | feat | fix | refactor | test | style | docs`. Body optional.
- The development server (`npm run dev`) should remain runnable after every task. If a task leaves it broken, the task is not done.

---

## Phase 1 — Cleanup & Foundation

Remove old code that conflicts with the new design. Set up testing. Update tokens. After Phase 1, the project builds (even if pages are empty).

### Task 1: Remove obsolete code

**Files:**
- Delete: `src/app/[locale]/(auth)/` (entire folder)
- Delete: `src/app/[locale]/(member)/` (entire folder)
- Delete: `src/app/auth/` (entire folder)
- Delete: `src/lib/auth/` (entire folder)
- Delete: `src/lib/supabase/` (entire folder)
- Delete: `src/app/[locale]/about/`, `src/app/[locale]/contact/`, `src/app/[locale]/plans/`, `src/app/[locale]/portfolio/`, `src/app/[locale]/services/` (will be rebuilt with new structure)
- Delete: `src/components/features/HomeClient.tsx`, `src/components/features/ImageGallery.tsx`, `src/components/features/PortfolioCard.tsx`, `src/components/features/PortfolioGrid.tsx`, `src/components/features/PricingCard.tsx`, `src/components/features/PricingGrid.tsx`, `src/components/features/index.ts`
- Delete: `src/components/ui/LiquidGlass.tsx`, `src/components/ui/HeroBg.tsx` (will be rebuilt aligned with new spec)
- Delete: `src/components/ui/TextAnimations.tsx`, `src/components/ui/ParallaxContainer.tsx` (replaced by Framer Motion primitives)
- Delete: `src/data/plans.ts`, `src/data/portfolio.ts`, `src/data/index.ts` (rebuilt later with new schema)
- Delete: `src/i18n/messages/de.json`, `src/i18n/messages/fr.json`, `src/i18n/messages/it.json`
- Keep: `src/components/ui/Button.tsx`, `src/components/ui/Logo.tsx`, `src/components/ui/AnimatedSection.tsx`, `src/components/ui/ScrollReveal.tsx`, `src/components/ui/LoadingScreen.tsx`, `src/components/ui/index.ts`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/index.ts`, `src/components/providers/LoadingProvider.tsx`, `src/styles/design-tokens.css`, `src/i18n/messages/{pt,en,es}.json`, `src/i18n/{routing,request,navigation}.ts`, `src/middleware.ts`, `src/types/index.ts`, `src/lib/utils/index.ts` — these will be modified later.

- [ ] **Step 1: Delete folders/files in bulk**

```bash
rm -rf "src/app/[locale]/(auth)" "src/app/[locale]/(member)" "src/app/auth" "src/lib/auth" "src/lib/supabase" "src/app/[locale]/about" "src/app/[locale]/contact" "src/app/[locale]/plans" "src/app/[locale]/portfolio" "src/app/[locale]/services"
rm -f src/components/features/HomeClient.tsx src/components/features/ImageGallery.tsx src/components/features/PortfolioCard.tsx src/components/features/PortfolioGrid.tsx src/components/features/PricingCard.tsx src/components/features/PricingGrid.tsx src/components/features/index.ts
rmdir src/components/features 2>/dev/null || true
rm -f src/components/ui/LiquidGlass.tsx src/components/ui/HeroBg.tsx src/components/ui/TextAnimations.tsx src/components/ui/ParallaxContainer.tsx
rm -f src/data/plans.ts src/data/portfolio.ts src/data/index.ts
rm -f src/i18n/messages/de.json src/i18n/messages/fr.json src/i18n/messages/it.json
```

- [ ] **Step 2: Replace `src/app/[locale]/page.tsx` with a temporary stub**

```tsx
// src/app/[locale]/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center text-foreground">
      <p>Site em reconstrução</p>
    </main>
  );
}
```

- [ ] **Step 3: Strip Supabase imports from `src/app/[locale]/layout.tsx`**

Open the file, remove any `import` referencing `@/lib/supabase`, `@/lib/auth`, `LoadingProvider` if it pulls Supabase, and any provider tags wrapping the children that referenced auth. Keep only: `next/font`, `next-intl`, `LoadingProvider` (keep, it's UI-only), `<html>`, `<body>`, `<NextIntlClientProvider>`, children.

Resulting file (replace existing content):

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import "../globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: { default: t("defaultTitle"), template: `%s · ${t("brand")}` },
    description: t("defaultDescription"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as typeof routing.locales[number])) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LoadingProvider>{children}</LoadingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Strip Supabase from `src/components/providers/LoadingProvider.tsx` if present**

Read the file. If it imports anything from `@/lib/supabase` or `@/lib/auth`, remove those imports and any logic that depended on them. Keep only the loading-screen state machine (mounted/loading flags + `<LoadingScreen>` render). If the file is too coupled to delete cleanly, replace with this minimal version:

```tsx
"use client";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {!ready && <LoadingScreen />}
      <div style={{ opacity: ready ? 1 : 0, transition: "opacity 300ms ease" }}>{children}</div>
    </>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds. If errors mention deleted modules, follow the error trail and clean stale imports until it passes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete auth/supabase code and legacy components"
```

---

### Task 2: Update package.json — drop Supabase, add testing

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove Supabase deps**

Edit `package.json` `dependencies` block: delete `"@supabase/ssr"` and `"@supabase/supabase-js"` lines.

- [ ] **Step 2: Add dev deps for testing**

Add to `devDependencies`:

```json
"vitest": "^2.1.8",
"@vitest/ui": "^2.1.8",
"@testing-library/react": "^16.1.0",
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/user-event": "^14.5.2",
"jsdom": "^25.0.1",
"@vitejs/plugin-react": "^4.3.4"
```

- [ ] **Step 3: Add test scripts**

In `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Install**

Run: `npm install`
Expected: clean install, no peer-dep errors. If a peer warning fires for React 19, ignore — RTL 16 supports it.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: drop supabase deps, add vitest + testing-library"
```

---

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `tsconfig.json` (add `vitest/globals` types)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 3: Add `vitest/globals` to `tsconfig.json` `compilerOptions.types`**

Open `tsconfig.json`, add (or merge) into `compilerOptions`:

```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```

- [ ] **Step 4: Add a smoke test to verify wiring**

Create `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/test tsconfig.json
git commit -m "chore: configure vitest with jsdom and testing-library"
```

---

### Task 4: Update i18n routing to pt/en/es

**Files:**
- Modify: `src/i18n/routing.ts`
- Modify: `src/i18n/request.ts` (only if needed)
- Modify: `src/i18n/navigation.ts` (only if needed)
- Modify: `src/middleware.ts` (only if hardcodes locales)

- [ ] **Step 1: Replace `src/i18n/routing.ts` content**

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "es"] as const,
  defaultLocale: "pt",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Reconcile `request.ts`, `navigation.ts`, `middleware.ts`**

Open each file. If any references `de`, `fr`, `it` or hardcodes the full list, replace with `routing.locales`. The standard `request.ts` body should be:

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

`navigation.ts`:

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

`middleware.ts` should match (do NOT add a forced locale list — it picks from `routing`):

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 3: Build to verify**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Run dev briefly**

Run: `npm run dev` (background). Open `http://localhost:3000/` — see "Site em reconstrução". Open `/en/` — same page. `/de/` should 404 or redirect.

Stop the dev server after verification.

- [ ] **Step 5: Commit**

```bash
git add src/i18n src/middleware.ts
git commit -m "feat(i18n): reduce locales to pt/en/es"
```

---

### Task 5: Extend design tokens

**Files:**
- Modify: `src/styles/design-tokens.css`

- [ ] **Step 1: Add new color tokens after existing lime block (around line 44)**

Insert after the `--color-lime-dark` line, inside `:root`:

```css
  --color-lime-deep: #1a8a08;
  --color-purple-accent: #b388ff;
  --color-purple-soft: rgba(179, 136, 255, 0.18);
```

- [ ] **Step 2: Add fluid typography tokens (after `--text-7xl`)**

Insert after `--text-7xl: 4.5rem;`:

```css
  --text-display: clamp(2.5rem, 5vw + 1rem, 4.5rem);
  --text-h2: clamp(2rem, 3vw + 1rem, 3rem);
  --text-h3: clamp(1.5rem, 2vw + 1rem, 2rem);
  --text-lead: clamp(1.125rem, 1vw + 0.875rem, 1.25rem);
```

- [ ] **Step 3: Add ink shadows (after `--shadow-glow-xl`)**

```css
  --shadow-ink-md: 0 12px 32px -8px rgba(0, 0, 0, 0.6);
  --shadow-ink-lg: 0 24px 60px -12px rgba(0, 0, 0, 0.7);
```

- [ ] **Step 4: Add easing curves (after `--transition-bounce`)**

```css
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/styles/design-tokens.css
git commit -m "feat(tokens): add lime-deep, purple-accent, fluid type, ink shadows, easing"
```

---

## Phase 2 — Types, utilities, data layer

Pure logic with TDD. After Phase 2, every WhatsApp link, every JSON-LD object, every product/portfolio entry can be tested without a browser.

### Task 6: Define shared types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Replace file with the canonical types**

```ts
export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export type Localized<T = string> = Record<Locale, T>;

export type DeliverableType = "site" | "app" | "web-app" | "software";

export type ProductCategory =
  | "sites"
  | "landing-pages"
  | "apps-e-sistemas"
  | "operacao-digital";

export type StackName =
  | "Next.js"
  | "Supabase"
  | "n8n"
  | "React Native"
  | "Bubble"
  | "Make"
  | "Tailwind"
  | "TypeScript";

export type PortfolioItem = {
  slug: string;
  client: string;
  clientSlug: string;
  type: DeliverableType;
  title: Localized<string>;
  description: Localized<string>;
  stack: StackName[];
  liveUrl: string;
  cover: string;
  gallery: string[];
  featuredOnHome: boolean;
  deliverables: Localized<string[]>;
};

export type Pricing = {
  setup?: number;
  monthly?: number;
  purchase?: number;
  deadline: Localized<string>;
};

export type ProcessStep = { title: Localized<string>; description: Localized<string> };
export type FAQItem = { q: Localized<string>; a: Localized<string> };

export type Product = {
  slugs: Localized<string>;
  category: ProductCategory;
  name: Localized<string>;
  shortDescription: Localized<string>;
  longDescription: Localized<string>;
  icon: string;
  pricing: Pricing;
  features: Localized<string[]>;
  includes: Localized<string[]>;
  forWho: Localized<string[]>;
  process: ProcessStep[];
  faq: FAQItem[];
  hasABVariant: boolean;
  abComparisonTarget?: string;
  featuredOnHome: boolean;
  relatedPortfolio: string[];
};

export type Testimonial = {
  id: string;
  quote: Localized<string>;
  author: string;
  role: Localized<string>;
  company: string;
  avatarInitials: string;
};

export type StackEntry = {
  name: StackName;
  iconPath: string;
  blurb: Localized<string>;
};

export type WhatsAppContext =
  | { kind: "home" }
  | { kind: "portfolio"; client: string; deliverable: string }
  | { kind: "product"; productName: string }
  | { kind: "contact" }
  | { kind: "generic" };
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: passes (no errors yet because no consumers).

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): define canonical types for content, products, portfolio, stack"
```

---

### Task 7: WhatsApp URL builder (TDD)

**Files:**
- Create: `src/lib/whatsapp.ts`
- Create: `src/lib/whatsapp.test.ts`

- [ ] **Step 1: Write tests first**

```ts
// src/lib/whatsapp.test.ts
import { describe, it, expect } from "vitest";
import { whatsappUrl, WHATSAPP_PHONE } from "./whatsapp";

describe("whatsappUrl", () => {
  it("uses the canonical phone", () => {
    expect(WHATSAPP_PHONE).toBe("5519978055531");
  });

  it("returns base url for home context", () => {
    const url = whatsappUrl({ kind: "home" }, "pt");
    expect(url).toMatch(/^https:\/\/wa\.me\/5519978055531\?text=/);
    expect(decodeURIComponent(url)).toContain("vim pelo site");
  });

  it("includes product name in product context", () => {
    const url = whatsappUrl({ kind: "product", productName: "Software de Gestão" }, "pt");
    expect(decodeURIComponent(url)).toContain("Software de Gestão");
  });

  it("includes client + deliverable in portfolio context", () => {
    const url = whatsappUrl(
      { kind: "portfolio", client: "Banco BHG", deliverable: "Software" },
      "pt"
    );
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Banco BHG");
    expect(decoded).toContain("Software");
  });

  it("translates message to en", () => {
    const url = whatsappUrl({ kind: "home" }, "en");
    expect(decodeURIComponent(url).toLowerCase()).toContain("came from your website");
  });

  it("translates message to es", () => {
    const url = whatsappUrl({ kind: "home" }, "es");
    expect(decodeURIComponent(url).toLowerCase()).toContain("vine por el sitio");
  });
});
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test src/lib/whatsapp.test.ts`
Expected: FAIL ("Cannot find module").

- [ ] **Step 3: Implement**

```ts
// src/lib/whatsapp.ts
import type { Locale, WhatsAppContext } from "@/types";

export const WHATSAPP_PHONE = "5519978055531";
const BASE = `https://wa.me/${WHATSAPP_PHONE}`;

const messages: Record<Locale, {
  home: string;
  contact: string;
  generic: string;
  product: (name: string) => string;
  portfolio: (client: string, deliverable: string) => string;
}> = {
  pt: {
    home: "Olá! Vim pelo site e quero conversar sobre um projeto.",
    contact: "Olá! Vim pela página de contato e quero conversar.",
    generic: "Olá! Quero conversar sobre um projeto.",
    product: (name) => `Olá! Tenho interesse em ${name} e gostaria de saber mais.`,
    portfolio: (client, deliverable) =>
      `Olá! Vi o case ${client} (${deliverable}) no site e quero algo similar.`,
  },
  en: {
    home: "Hi! I came from your website and want to discuss a project.",
    contact: "Hi! I came from your contact page and want to chat.",
    generic: "Hi! I'd like to talk about a project.",
    product: (name) => `Hi! I'm interested in ${name} and want to know more.`,
    portfolio: (client, deliverable) =>
      `Hi! I saw the ${client} (${deliverable}) case on your site and want something similar.`,
  },
  es: {
    home: "¡Hola! Vine por el sitio y quiero hablar sobre un proyecto.",
    contact: "¡Hola! Vine por la página de contacto y quiero conversar.",
    generic: "¡Hola! Quiero hablar sobre un proyecto.",
    product: (name) => `¡Hola! Me interesa ${name} y quiero saber más.`,
    portfolio: (client, deliverable) =>
      `¡Hola! Vi el case ${client} (${deliverable}) en el sitio y quiero algo similar.`,
  },
};

export function whatsappUrl(ctx: WhatsAppContext, locale: Locale): string {
  const m = messages[locale];
  let text: string;
  switch (ctx.kind) {
    case "home": text = m.home; break;
    case "contact": text = m.contact; break;
    case "product": text = m.product(ctx.productName); break;
    case "portfolio": text = m.portfolio(ctx.client, ctx.deliverable); break;
    case "generic": text = m.generic; break;
  }
  return `${BASE}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 4: Run — expect pass**

Run: `npm test src/lib/whatsapp.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp.ts src/lib/whatsapp.test.ts
git commit -m "feat(lib): WhatsApp URL builder with localized messages and context"
```

---

### Task 8: JSON-LD schema generators (TDD)

**Files:**
- Create: `src/lib/schema.ts`
- Create: `src/lib/schema.test.ts`

- [ ] **Step 1: Write tests**

```ts
// src/lib/schema.test.ts
import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  localBusinessSchema,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
  creativeWorkSchema,
} from "./schema";

describe("organizationSchema", () => {
  it("has @context and @type", () => {
    const s = organizationSchema();
    expect(s["@context"]).toBe("https://schema.org");
    expect(s["@type"]).toBe("Organization");
    expect(s.name).toBe("BlackElephant");
  });
});

describe("localBusinessSchema", () => {
  it("contains the SP address", () => {
    const s = localBusinessSchema();
    expect(s.address.addressRegion).toBe("SP");
    expect(s.address.streetAddress).toContain("Yojiro Takaoka");
    expect(s.telephone).toBe("+5519978055531");
  });
});

describe("serviceSchema", () => {
  it("includes offer with price", () => {
    const s = serviceSchema({
      name: "Test Product",
      description: "desc",
      url: "https://x/y",
      price: 1198,
      currency: "BRL",
    });
    expect(s.offers.price).toBe(1198);
    expect(s.offers.priceCurrency).toBe("BRL");
  });
});

describe("faqSchema", () => {
  it("emits a Question per item", () => {
    const s = faqSchema([
      { q: "Q1?", a: "A1" },
      { q: "Q2?", a: "A2" },
    ]);
    expect(s.mainEntity).toHaveLength(2);
    expect(s.mainEntity[0]["@type"]).toBe("Question");
  });
});

describe("breadcrumbSchema", () => {
  it("emits ListItem entries with positions starting at 1", () => {
    const s = breadcrumbSchema([
      { name: "Home", url: "https://x/" },
      { name: "Portfolio", url: "https://x/portfolio" },
    ]);
    expect(s.itemListElement[0].position).toBe(1);
    expect(s.itemListElement[1].position).toBe(2);
  });
});

describe("creativeWorkSchema", () => {
  it("includes name and url", () => {
    const s = creativeWorkSchema({
      name: "Project X",
      description: "d",
      url: "https://x/y",
      image: "https://x/img.png",
    });
    expect(s["@type"]).toBe("CreativeWork");
    expect(s.url).toBe("https://x/y");
  });
});
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test src/lib/schema.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/lib/schema.ts
const SITE_URL = "https://blackelephant.com.br";
const BRAND = "BlackElephant";
const PHONE = "+5519978055531";
const EMAIL = "guilherme@blackelephant.com.br";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE,
      contactType: "sales",
      email: EMAIL,
      availableLanguage: ["pt", "en", "es"],
    },
  } as const;
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "BlackElephant Brasil LTDA",
    image: `${SITE_URL}/logo.png`,
    url: SITE_URL,
    telephone: PHONE,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Avenida Yojiro Takaoka, 4384, Sala 701, Alphaville",
      addressLocality: "Santana de Parnaíba",
      addressRegion: "SP",
      postalCode: "06541-038",
      addressCountry: "BR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  price?: number;
  currency?: string;
}) {
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: opts.url,
    availability: "https://schema.org/InStock",
  };
  if (opts.price != null) {
    offer.price = opts.price;
    offer.priceCurrency = opts.currency ?? "BRL";
  }
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    provider: { "@type": "Organization", name: BRAND, url: SITE_URL },
    url: opts.url,
    offers: offer as { price: number; priceCurrency: string },
  };
}

export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function breadcrumbSchema(crumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function creativeWorkSchema(opts: {
  name: string;
  description: string;
  url: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    creator: { "@type": "Organization", name: BRAND, url: SITE_URL },
  };
}

export const SITE = { url: SITE_URL, brand: BRAND, phone: PHONE, email: EMAIL };
```

- [ ] **Step 4: Run — expect pass**

Run: `npm test src/lib/schema.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts src/lib/schema.test.ts
git commit -m "feat(lib): JSON-LD schema generators with tests"
```

---

### Task 9: Metadata helpers

**Files:**
- Create: `src/lib/metadata.ts`

- [ ] **Step 1: Implement**

```ts
// src/lib/metadata.ts
import type { Metadata } from "next";
import type { Locale } from "@/types";
import { SITE } from "./schema";

const ALT_LOCALES: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

export function makeMetadata(opts: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  image?: string;
  alternatePaths?: Partial<Record<Locale, string>>;
}): Metadata {
  const url = `${SITE.url}${opts.path}`;
  const ogImage = opts.image ?? `${SITE.url}/opengraph-image`;
  const languages: Record<string, string> = {};
  if (opts.alternatePaths) {
    for (const [loc, p] of Object.entries(opts.alternatePaths)) {
      if (p) languages[ALT_LOCALES[loc as Locale]] = `${SITE.url}${p}`;
    }
  }
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.brand,
      images: [{ url: ogImage, width: 1200, height: 630, alt: opts.title }],
      locale: ALT_LOCALES[opts.locale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [ogImage],
    },
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/lib/metadata.ts
git commit -m "feat(lib): metadata helper for canonical+og+twitter+hreflang"
```

---

### Task 10: Stack data + testimonials placeholder

**Files:**
- Create: `src/data/stack.ts`
- Create: `src/data/testimonials.ts`

- [ ] **Step 1: `src/data/stack.ts`**

```ts
import type { StackEntry } from "@/types";

export const HOME_STACK: StackEntry[] = [
  {
    name: "Next.js",
    iconPath: "/stack/nextjs.svg",
    blurb: {
      pt: "Performance e SEO de fábrica.",
      en: "Performance and SEO out of the box.",
      es: "Rendimiento y SEO de fábrica.",
    },
  },
  {
    name: "Supabase",
    iconPath: "/stack/supabase.svg",
    blurb: {
      pt: "Banco, auth e storage seguros.",
      en: "Secure database, auth and storage.",
      es: "Base, auth y storage seguros.",
    },
  },
  {
    name: "n8n",
    iconPath: "/stack/n8n.svg",
    blurb: {
      pt: "Automação de processos sem limites.",
      en: "Limitless workflow automation.",
      es: "Automatización sin límites.",
    },
  },
  {
    name: "React Native",
    iconPath: "/stack/react-native.svg",
    blurb: {
      pt: "Apps mobile multiplataforma.",
      en: "Cross-platform mobile apps.",
      es: "Apps móviles multiplataforma.",
    },
  },
];
```

- [ ] **Step 2: `src/data/testimonials.ts`**

```ts
import type { Testimonial } from "@/types";

// TODO: substituir por depoimentos reais — placeholders verossímeis baseados em clientes reais.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "bhg",
    quote: {
      pt: "Substituímos planilhas por um software feito sob medida e cortamos mais de 30 horas semanais de trabalho manual. A entrega foi cirúrgica.",
      en: "We replaced spreadsheets with a tailored software and cut 30+ weekly hours of manual work. The delivery was surgical.",
      es: "Reemplazamos planillas por un software hecho a medida y recortamos más de 30 horas semanales de trabajo manual. La entrega fue quirúrgica.",
    },
    author: "[NOME]",
    role: { pt: "Diretor de Operações", en: "Operations Director", es: "Director de Operaciones" },
    company: "Banco BHG",
    avatarInitials: "BB",
  },
  {
    id: "kz",
    quote: {
      pt: "Nosso atendimento ficou em outro patamar depois do app. Cliente solicita serviço, prestador recebe na hora, tudo rastreado. Faturamos mais com menos atrito.",
      en: "Our service jumped to another level after the app. Clients request, providers get it instantly, everything tracked. We bill more with less friction.",
      es: "Nuestro servicio cambió de nivel con la app. El cliente pide, el prestador recibe al instante, todo trazado. Facturamos más con menos fricción.",
    },
    author: "[NOME]",
    role: { pt: "Sócio-fundador", en: "Co-founder", es: "Cofundador" },
    company: "KZ Serviços",
    avatarInitials: "KZ",
  },
  {
    id: "hubfive",
    quote: {
      pt: "Eles entenderam o nosso negócio e devolveram em produto. Hoje exportamos relatório, integramos WhatsApp e dormimos tranquilos.",
      en: "They understood our business and turned it into product. Today we export reports, integrate WhatsApp and sleep peacefully.",
      es: "Entendieron el negocio y lo devolvieron como producto. Hoy exportamos reportes, integramos WhatsApp y dormimos tranquilos.",
    },
    author: "[NOME]",
    role: { pt: "CEO", en: "CEO", es: "CEO" },
    company: "HubFive",
    avatarInitials: "HF",
  },
];
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/data/stack.ts src/data/testimonials.ts
git commit -m "feat(data): home stack list and placeholder testimonials"
```

---

### Task 11: Portfolio data (12 entregas)

**Files:**
- Create: `src/data/portfolio.ts`
- Create: `src/data/portfolio.test.ts`

- [ ] **Step 1: Write tests first**

```ts
// src/data/portfolio.test.ts
import { describe, it, expect } from "vitest";
import { PORTFOLIO, getPortfolio, getPortfolioBySlug, getRelatedPortfolio, getOtherDeliverablesForClient } from "./portfolio";

describe("PORTFOLIO", () => {
  it("has 12 unique entries", () => {
    expect(PORTFOLIO).toHaveLength(12);
    const slugs = new Set(PORTFOLIO.map((p) => p.slug));
    expect(slugs.size).toBe(12);
  });
  it("has exactly 4 featured items", () => {
    expect(PORTFOLIO.filter((p) => p.featuredOnHome)).toHaveLength(4);
  });
  it("each entry has all 3 locales filled", () => {
    for (const p of PORTFOLIO) {
      expect(p.title.pt).toBeTruthy();
      expect(p.title.en).toBeTruthy();
      expect(p.title.es).toBeTruthy();
      expect(p.description.pt).toBeTruthy();
      expect(p.description.en).toBeTruthy();
      expect(p.description.es).toBeTruthy();
    }
  });
  it("each entry has stack and liveUrl", () => {
    for (const p of PORTFOLIO) {
      expect(p.stack.length).toBeGreaterThan(0);
      expect(p.liveUrl).toMatch(/^https?:\/\//);
    }
  });
  it("getPortfolioBySlug returns the right item", () => {
    const item = getPortfolioBySlug("banco-bhg-software-de-gestao");
    expect(item?.client).toBe("Banco BHG");
  });
  it("getOtherDeliverablesForClient excludes self", () => {
    const others = getOtherDeliverablesForClient("kz-servicos", "kz-servicos-app-cliente");
    expect(others).toHaveLength(2);
    expect(others.find((o) => o.slug === "kz-servicos-app-cliente")).toBeUndefined();
  });
  it("getRelatedPortfolio returns up to 3 by type/stack", () => {
    const related = getRelatedPortfolio("banco-bhg-software-de-gestao");
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.find((r) => r.slug === "banco-bhg-software-de-gestao")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test src/data/portfolio.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/data/portfolio.ts`**

```ts
import type { PortfolioItem } from "@/types";

const galleryFor = (clientSlug: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `/portfolio/${clientSlug}/${i + 1}.png`);

// TODO: curar imagens por entrega — hoje cada deliverable do mesmo cliente compartilha a pasta.
export const PORTFOLIO: PortfolioItem[] = [
  {
    slug: "banco-bhg-software-de-gestao",
    client: "Banco BHG",
    clientSlug: "banco-bhg",
    type: "software",
    title: {
      pt: "Software de Gestão Completo",
      en: "Complete Management Software",
      es: "Software de Gestión Completo",
    },
    description: {
      pt: "Software de gestão sob medida para a operação completa do Banco BHG: financeiro, contratos, clientes, parceiros e movimentação de impostos. Envia relatórios automáticos via WhatsApp e e-mail, exporta em XLSX e PDF, mantém qualidade gráfica fiel à identidade visual da marca.",
      en: "Tailored management software for the entire Banco BHG operation: finance, contracts, clients, partners and tax movements. Sends automated reports via WhatsApp and email, exports XLSX and PDF, with graphic quality faithful to the brand identity.",
      es: "Software de gestión a medida para toda la operación del Banco BHG: finanzas, contratos, clientes, socios y movimiento de impuestos. Envía reportes automáticos por WhatsApp y email, exporta en XLSX y PDF, manteniendo fidelidad gráfica con la marca.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://bhgconsultoria.com",
    cover: "/portfolio/banco-bhg/1.png",
    gallery: galleryFor("banco-bhg", 9),
    featuredOnHome: true,
    deliverables: {
      pt: ["Software de gestão financeira", "Cadastro de contratos e clientes", "Automação de envio de relatórios", "Exportação XLSX/PDF", "Integração com WhatsApp"],
      en: ["Financial management software", "Contracts and clients registry", "Automated report dispatch", "XLSX/PDF export", "WhatsApp integration"],
      es: ["Software de gestión financiera", "Registro de contratos y clientes", "Envío automatizado de reportes", "Exportación XLSX/PDF", "Integración con WhatsApp"],
    },
  },
  {
    slug: "banco-bhg-site-institucional",
    client: "Banco BHG",
    clientSlug: "banco-bhg",
    type: "site",
    title: { pt: "Site Institucional", en: "Institutional Website", es: "Sitio Institucional" },
    description: {
      pt: "Site institucional do Banco BHG com identidade visual fiel à marca, foco em apresentação dos serviços de consultoria e captação de leads via WhatsApp.",
      en: "Banco BHG institutional site with brand-faithful identity, focused on services presentation and WhatsApp lead capture.",
      es: "Sitio institucional del Banco BHG con identidad visual fiel a la marca, enfoque en servicios y captación de leads por WhatsApp.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://bhgconsultoria.com",
    cover: "/portfolio/banco-bhg/2.png",
    gallery: galleryFor("banco-bhg", 9),
    featuredOnHome: false,
    deliverables: {
      pt: ["Páginas Home, Sobre, Serviços, Contato", "SEO completo", "Responsivo total", "Hospedagem e domínio inclusos"],
      en: ["Home, About, Services, Contact pages", "Complete SEO", "Fully responsive", "Hosting and domain included"],
      es: ["Páginas Home, Sobre, Servicios, Contacto", "SEO completo", "Totalmente responsivo", "Hosting y dominio incluidos"],
    },
  },
  {
    slug: "hubfive-software-de-gestao",
    client: "HubFive",
    clientSlug: "hubfive",
    type: "software",
    title: { pt: "Software de Gestão Completo", en: "Complete Management Software", es: "Software de Gestión Completo" },
    description: {
      pt: "Software de gestão para toda a operação da HubFive: RH, financeiro, vendas e administrativo/estratégico. Envia relatórios via WhatsApp e e-mail, exporta XLSX/PDF, automatiza fluxos com n8n.",
      en: "Management software for HubFive's full operation: HR, finance, sales and admin/strategy. WhatsApp/email reports, XLSX/PDF export, n8n-powered automation.",
      es: "Software de gestión para toda la operación de HubFive: RR.HH., finanzas, ventas y administración/estrategia. Reportes por WhatsApp/email, exportación XLSX/PDF, automatización con n8n.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://hubfive.com.br/",
    cover: "/portfolio/hubfive/1.png",
    gallery: galleryFor("hubfive", 11),
    featuredOnHome: true,
    deliverables: {
      pt: ["Módulo de RH", "Módulo financeiro", "Módulo de vendas", "Painel estratégico", "Automação n8n", "Exportação XLSX/PDF"],
      en: ["HR module", "Finance module", "Sales module", "Strategic dashboard", "n8n automation", "XLSX/PDF export"],
      es: ["Módulo de RR.HH.", "Módulo financiero", "Módulo de ventas", "Panel estratégico", "Automatización n8n", "Exportación XLSX/PDF"],
    },
  },
  {
    slug: "hubfive-site-institucional",
    client: "HubFive",
    clientSlug: "hubfive",
    type: "site",
    title: { pt: "Site Institucional", en: "Institutional Website", es: "Sitio Institucional" },
    description: {
      pt: "Site institucional da HubFive integrado ao software de gestão, com captação de leads e apresentação dos serviços.",
      en: "HubFive institutional website integrated with the management software, capturing leads and showcasing services.",
      es: "Sitio institucional de HubFive integrado con el software de gestión, captando leads y mostrando los servicios.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://hubfive.com.br/",
    cover: "/portfolio/hubfive/2.png",
    gallery: galleryFor("hubfive", 11),
    featuredOnHome: false,
    deliverables: {
      pt: ["Site institucional completo", "SEO completo", "Integração com o software de gestão", "Hospedagem e domínio inclusos"],
      en: ["Complete institutional site", "Full SEO", "Integration with management software", "Hosting and domain included"],
      es: ["Sitio institucional completo", "SEO completo", "Integración con el software de gestión", "Hosting y dominio incluidos"],
    },
  },
  {
    slug: "kz-servicos-app-cliente",
    client: "KZ Serviços",
    clientSlug: "kz-servicos",
    type: "app",
    title: { pt: "App Cliente — Solicitação de Serviços", en: "Client App — Service Requests", es: "App Cliente — Solicitud de Servicios" },
    description: {
      pt: "App mobile para os clientes da KZ Serviços solicitarem serviços e viagens em poucos toques, com acompanhamento em tempo real.",
      en: "Mobile app for KZ clients to request services and rides in a few taps, with real-time tracking.",
      es: "App móvil para clientes de KZ que solicitan servicios y viajes en pocos toques, con seguimiento en tiempo real.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://kz-serviços.netlify.app/",
    cover: "/portfolio/kz-servicos/1.png",
    gallery: galleryFor("kz-servicos", 26),
    featuredOnHome: true,
    deliverables: {
      pt: ["Cadastro e login do cliente", "Solicitação de serviço/viagem", "Acompanhamento em tempo real", "Histórico de pedidos"],
      en: ["Client signup and login", "Service/ride request", "Real-time tracking", "Order history"],
      es: ["Registro y login del cliente", "Solicitud de servicio/viaje", "Seguimiento en tiempo real", "Historial de pedidos"],
    },
  },
  {
    slug: "kz-servicos-app-prestador",
    client: "KZ Serviços",
    clientSlug: "kz-servicos",
    type: "app",
    title: { pt: "App Prestador — Agenda e Atividades", en: "Provider App — Schedule and Activities", es: "App Prestador — Agenda y Actividades" },
    description: {
      pt: "App para os prestadores de serviço da KZ visualizarem suas atividades futuras, escalas e ganhos.",
      en: "App for KZ service providers to view upcoming activities, schedules and earnings.",
      es: "App para prestadores de KZ visualizar sus actividades futuras, escalas y ingresos.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://kz-serviços.netlify.app/",
    cover: "/portfolio/kz-servicos/2.png",
    gallery: galleryFor("kz-servicos", 26),
    featuredOnHome: false,
    deliverables: {
      pt: ["Agenda do prestador", "Aceite e recusa de atividades", "Visão de ganhos", "Notificações em tempo real"],
      en: ["Provider schedule", "Accept/decline activities", "Earnings view", "Real-time notifications"],
      es: ["Agenda del prestador", "Aceptar/rechazar actividades", "Vista de ingresos", "Notificaciones en tiempo real"],
    },
  },
  {
    slug: "kz-servicos-web-app-de-gestao",
    client: "KZ Serviços",
    clientSlug: "kz-servicos",
    type: "web-app",
    title: { pt: "Web App de Gestão", en: "Management Web App", es: "Web App de Gestión" },
    description: {
      pt: "Web app para gestão de toda a operação da KZ Serviços: solicitações, agendamento de prestadores, gestão financeira, escala de motoristas, envio de relatórios.",
      en: "Web app to manage the full KZ operation: requests, provider scheduling, finance, driver shifts, report dispatch.",
      es: "Web app para gestión integral de KZ: solicitudes, agenda de prestadores, finanzas, escalas de conductores, envío de reportes.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://kz-serviços.netlify.app/",
    cover: "/portfolio/kz-servicos/3.png",
    gallery: galleryFor("kz-servicos", 26),
    featuredOnHome: false,
    deliverables: {
      pt: ["Painel de solicitações", "Agendamento de prestadores e motoristas", "Gestão financeira", "Relatórios automáticos", "Exportação XLSX/PDF"],
      en: ["Requests dashboard", "Provider/driver scheduling", "Financial management", "Automated reports", "XLSX/PDF export"],
      es: ["Panel de solicitudes", "Agenda de prestadores/conductores", "Gestión financiera", "Reportes automáticos", "Exportación XLSX/PDF"],
    },
  },
  {
    slug: "transportadora-sabas-site-institucional",
    client: "Transportadora Sabas",
    clientSlug: "transportadora-sabas",
    type: "site",
    title: { pt: "Site Institucional", en: "Institutional Website", es: "Sitio Institucional" },
    description: {
      pt: "Site institucional da Transportadora Sabas com home, veículos, categorias, quem somos e contato. Identidade visual fiel à marca, SEO e responsividade completos.",
      en: "Transportadora Sabas institutional site with home, vehicles, categories, about and contact. Brand-faithful identity, full SEO and responsiveness.",
      es: "Sitio institucional de Transportadora Sabas con home, vehículos, categorías, sobre y contacto. Identidad fiel a la marca, SEO y responsividad completos.",
    },
    stack: ["Next.js", "Bubble", "n8n"],
    liveUrl: "https://sabas.com.br/",
    cover: "/portfolio/transportadora-sabas/1.png",
    gallery: galleryFor("transportadora-sabas", 12),
    featuredOnHome: false,
    deliverables: {
      pt: ["Página Home", "Página Veículos e Categorias", "Quem Somos e Contato", "SEO completo", "Hospedagem e domínio"],
      en: ["Home page", "Vehicles and Categories", "About and Contact", "Full SEO", "Hosting and domain"],
      es: ["Página Home", "Vehículos y Categorías", "Sobre y Contacto", "SEO completo", "Hosting y dominio"],
    },
  },
  {
    slug: "transportadora-sabas-software-de-gestao",
    client: "Transportadora Sabas",
    clientSlug: "transportadora-sabas",
    type: "software",
    title: { pt: "Software de Gestão de Operações", en: "Operations Management Software", es: "Software de Gestión de Operaciones" },
    description: {
      pt: "Gerenciador completo da operação interna: solicitações de viagem, escala de motoristas, gestão financeira de pagamentos e relatórios automáticos via WhatsApp e e-mail.",
      en: "Complete internal operations manager: trip requests, driver shifts, financial payment management and automated reports via WhatsApp and email.",
      es: "Gestor integral de operación interna: solicitudes de viaje, escalas de conductores, gestión financiera de pagos y reportes automáticos por WhatsApp y email.",
    },
    stack: ["Next.js", "Bubble", "n8n"],
    liveUrl: "https://sabas.com.br/",
    cover: "/portfolio/transportadora-sabas/2.png",
    gallery: galleryFor("transportadora-sabas", 12),
    featuredOnHome: false,
    deliverables: {
      pt: ["Solicitações de viagem", "Escala de motoristas", "Gestão financeira", "Relatórios automáticos", "Exportação XLSX/PDF"],
      en: ["Trip requests", "Driver shifts", "Financial management", "Automated reports", "XLSX/PDF export"],
      es: ["Solicitudes de viaje", "Escalas de conductores", "Gestión financiera", "Reportes automáticos", "Exportación XLSX/PDF"],
    },
  },
  {
    slug: "solumart-software-de-gestao",
    client: "Solumart Serviços",
    clientSlug: "solumart",
    type: "software",
    title: { pt: "Software de Gestão de Serviços", en: "Service Management Software", es: "Software de Gestión de Servicios" },
    description: {
      pt: "Software de gestão para o agendamento de prestadores da Solumart, com solicitações, financeiro de pagamentos e relatórios automatizados.",
      en: "Solumart provider scheduling software, with requests, payments finance and automated reports.",
      es: "Software de gestión para agenda de prestadores de Solumart, con solicitudes, finanzas de pagos y reportes automatizados.",
    },
    stack: ["Bubble", "Make"],
    liveUrl: "https://solumart.bubbleapps.io/",
    cover: "/portfolio/solumart/1.png",
    gallery: galleryFor("solumart", 11),
    featuredOnHome: false,
    deliverables: {
      pt: ["Solicitações de serviço", "Escala de prestadores", "Gestão financeira", "Relatórios via WhatsApp e e-mail"],
      en: ["Service requests", "Provider shifts", "Financial management", "WhatsApp/email reports"],
      es: ["Solicitudes de servicio", "Escala de prestadores", "Gestión financiera", "Reportes por WhatsApp/email"],
    },
  },
  {
    slug: "solumart-app-prestador",
    client: "Solumart Serviços",
    clientSlug: "solumart",
    type: "app",
    title: { pt: "App Prestador", en: "Provider App", es: "App Prestador" },
    description: {
      pt: "App para os prestadores da Solumart visualizarem atividades futuras e gerirem a agenda.",
      en: "App for Solumart providers to view upcoming activities and manage their schedule.",
      es: "App para prestadores de Solumart visualizar actividades futuras y gestionar su agenda.",
    },
    stack: ["Bubble", "Make"],
    liveUrl: "https://solumart.bubbleapps.io/",
    cover: "/portfolio/solumart/2.png",
    gallery: galleryFor("solumart", 11),
    featuredOnHome: false,
    deliverables: {
      pt: ["Agenda do prestador", "Visualização de atividades", "Notificações"],
      en: ["Provider schedule", "Activity view", "Notifications"],
      es: ["Agenda del prestador", "Vista de actividades", "Notificaciones"],
    },
  },
  {
    slug: "verite-pericias-judiciais-site-institucional",
    client: "Vérité Perícias Judiciais",
    clientSlug: "verite",
    type: "site",
    title: { pt: "Site Institucional", en: "Institutional Website", es: "Sitio Institucional" },
    description: {
      pt: "Site institucional do Instituto Vérité com home, sobre nós, serviços (página própria por serviço), página da fundadora, contato e envio de e-mail. Identidade visual fiel à marca, SEO e responsividade completos.",
      en: "Instituto Vérité institutional site with home, about, services (one page per service), founder page, contact and email dispatch. Brand-faithful identity, full SEO and responsiveness.",
      es: "Sitio institucional del Instituto Vérité con home, sobre, servicios (página individual por servicio), página de la fundadora, contacto y envío de email. Identidad fiel, SEO y responsividad completos.",
    },
    stack: ["Next.js", "Supabase", "n8n"],
    liveUrl: "https://institutoverite.com.br/",
    cover: "/portfolio/verite/1.png",
    gallery: galleryFor("verite", 8),
    featuredOnHome: true,
    deliverables: {
      pt: ["Páginas Home, Sobre, Serviços, Fundadora, Contato", "Uma página por serviço", "Envio de e-mail integrado", "SEO completo", "Hospedagem e domínio"],
      en: ["Home, About, Services, Founder, Contact pages", "One page per service", "Integrated email dispatch", "Full SEO", "Hosting and domain"],
      es: ["Home, Sobre, Servicios, Fundadora, Contacto", "Una página por servicio", "Envío de email integrado", "SEO completo", "Hosting y dominio"],
    },
  },
];

export function getPortfolio(): PortfolioItem[] { return PORTFOLIO; }

export function getPortfolioBySlug(slug: string): PortfolioItem | undefined {
  return PORTFOLIO.find((p) => p.slug === slug);
}

export function getOtherDeliverablesForClient(clientSlug: string, currentSlug: string): PortfolioItem[] {
  return PORTFOLIO.filter((p) => p.clientSlug === clientSlug && p.slug !== currentSlug);
}

export function getRelatedPortfolio(currentSlug: string, max = 3): PortfolioItem[] {
  const current = getPortfolioBySlug(currentSlug);
  if (!current) return [];
  const score = (p: PortfolioItem): number => {
    if (p.slug === current.slug) return -1;
    if (p.clientSlug === current.clientSlug) return -1;
    let s = 0;
    if (p.type === current.type) s += 2;
    s += p.stack.filter((st) => current.stack.includes(st)).length;
    return s;
  };
  return [...PORTFOLIO]
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map((x) => x.p);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test src/data/portfolio.test.ts`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/portfolio.ts src/data/portfolio.test.ts
git commit -m "feat(data): 12 portfolio entries with i18n + helper queries"
```

---

### Task 12: Products data (7 produtos)

**Files:**
- Create: `src/data/products.ts`
- Create: `src/data/products.test.ts`

- [ ] **Step 1: Write tests first**

```ts
// src/data/products.test.ts
import { describe, it, expect } from "vitest";
import { PRODUCTS, getProductBySlug, getProductsByCategory, getFeaturedProducts } from "./products";

describe("PRODUCTS", () => {
  it("has 7 entries", () => { expect(PRODUCTS).toHaveLength(7); });
  it("has 3 featured", () => { expect(getFeaturedProducts()).toHaveLength(3); });
  it("each has 3 locales filled in name + slugs + descriptions", () => {
    for (const p of PRODUCTS) {
      expect(p.slugs.pt).toBeTruthy();
      expect(p.slugs.en).toBeTruthy();
      expect(p.slugs.es).toBeTruthy();
      expect(p.name.pt).toBeTruthy();
      expect(p.name.en).toBeTruthy();
      expect(p.name.es).toBeTruthy();
      expect(p.shortDescription.pt).toBeTruthy();
      expect(p.longDescription.pt).toBeTruthy();
    }
  });
  it("slugs are unique per locale", () => {
    for (const loc of ["pt", "en", "es"] as const) {
      const slugs = PRODUCTS.map((p) => p.slugs[loc]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
  it("getProductBySlug works in any locale", () => {
    expect(getProductBySlug("desenvolvimento-de-site-profissional", "pt")?.category).toBe("sites");
    expect(getProductBySlug("professional-website-development", "en")?.category).toBe("sites");
  });
  it("AB variants reference an existing target", () => {
    for (const p of PRODUCTS) {
      if (p.hasABVariant && p.abComparisonTarget) {
        expect(PRODUCTS.find((q) => q.slugs.pt === p.abComparisonTarget)).toBeTruthy();
      }
    }
  });
  it("getProductsByCategory filters correctly", () => {
    expect(getProductsByCategory("sites")).toHaveLength(2);
    expect(getProductsByCategory("landing-pages")).toHaveLength(2);
    expect(getProductsByCategory("apps-e-sistemas")).toHaveLength(2);
    expect(getProductsByCategory("operacao-digital")).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run — expect fail**

Run: `npm test src/data/products.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `src/data/products.ts`**

```ts
import type { Product, Locale, ProductCategory } from "@/types";

export const PRODUCTS: Product[] = [
  // ----- Landing Page (high conversion) -----
  {
    slugs: {
      pt: "desenvolvimento-de-landing-page-de-alta-conversao",
      en: "high-conversion-landing-page-development",
      es: "desarrollo-de-landing-page-de-alta-conversion",
    },
    category: "landing-pages",
    name: {
      pt: "Landing Page de Alta Conversão",
      en: "High-Conversion Landing Page",
      es: "Landing Page de Alta Conversión",
    },
    shortDescription: {
      pt: "Página única, focada em conversão, no ar em 72h.",
      en: "Single page, conversion-focused, live in 72 hours.",
      es: "Página única, enfocada en conversión, online en 72 horas.",
    },
    longDescription: {
      pt: "Landing page profissional, otimizada para tráfego pago e SEO, pronta em 72 horas. Hospedagem, domínio e ambiente seguro inclusos. Atualizações mensais. Ideal para campanhas, captação de leads e validação de oferta.",
      en: "Professional landing page, optimized for paid traffic and SEO, ready in 72 hours. Hosting, domain and secure environment included. Monthly updates. Ideal for campaigns, lead capture and offer validation.",
      es: "Landing page profesional, optimizada para tráfico pago y SEO, lista en 72 horas. Hosting, dominio y entorno seguro incluidos. Actualizaciones mensuales. Ideal para campañas, captación de leads y validación de oferta.",
    },
    icon: "rocket",
    pricing: {
      setup: 148,
      monthly: 148,
      purchase: 798,
      deadline: { pt: "72 horas", en: "72 hours", es: "72 horas" },
    },
    features: {
      pt: ["100% responsiva", "SEO técnico completo", "Tempo de carregamento otimizado", "Integração com WhatsApp", "Pixel de tracking pronto"],
      en: ["Fully responsive", "Complete technical SEO", "Optimized load time", "WhatsApp integration", "Tracking pixel ready"],
      es: ["100% responsiva", "SEO técnico completo", "Tiempo de carga optimizado", "Integración con WhatsApp", "Pixel de tracking listo"],
    },
    includes: {
      pt: ["Hospedagem inclusa", "Domínio incluso", "Ambiente seguro (SSL)", "4 atualizações por mês", "Atualizações extras a R$ 50 cada"],
      en: ["Hosting included", "Domain included", "Secure environment (SSL)", "4 monthly updates", "Extra updates at R$ 50 each"],
      es: ["Hosting incluido", "Dominio incluido", "Entorno seguro (SSL)", "4 actualizaciones mensuales", "Actualizaciones extras a R$ 50 c/u"],
    },
    forWho: {
      pt: ["Quem vai rodar tráfego pago e precisa de página focada", "Quem quer validar uma oferta rapidamente", "Quem está cansado de esperar 30 dias por orçamento"],
      en: ["Anyone running paid traffic that needs a focused page", "Anyone validating an offer fast", "Anyone tired of 30-day quotes"],
      es: ["Quien hace tráfico pago y necesita página enfocada", "Quien quiere validar una oferta rápido", "Quien está cansado de esperar 30 días por presupuesto"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Você fala com a gente e contextualiza a oferta.", en: "You message us and frame the offer.", es: "Nos hablas y contextualizas la oferta." } },
      { title: { pt: "Briefing rápido", en: "Quick brief", es: "Briefing rápido" }, description: { pt: "Alinhamos copy, identidade e CTA.", en: "We align copy, identity and CTA.", es: "Alineamos copy, identidad y CTA." } },
      { title: { pt: "Desenvolvimento", en: "Development", es: "Desarrollo" }, description: { pt: "Em 72h sua landing está pronta.", en: "In 72h your landing is ready.", es: "En 72h tu landing está lista." } },
      { title: { pt: "Entrega + suporte", en: "Delivery + support", es: "Entrega + soporte" }, description: { pt: "Lançamos no ar e seguimos com atualizações.", en: "We go live and keep updates flowing.", es: "Salimos al aire y seguimos con actualizaciones." } },
    ],
    faq: [
      { q: { pt: "Quanto tempo leva?", en: "How long does it take?", es: "¿Cuánto tiempo lleva?" }, a: { pt: "72 horas após o briefing.", en: "72 hours after briefing.", es: "72 horas tras el briefing." } },
      { q: { pt: "A hospedagem está inclusa?", en: "Is hosting included?", es: "¿El hosting está incluido?" }, a: { pt: "Sim, hospedagem e domínio fazem parte do pacote.", en: "Yes, hosting and domain are part of the package.", es: "Sí, hosting y dominio están incluidos." } },
      { q: { pt: "Posso comprar o código?", en: "Can I buy the source code?", es: "¿Puedo comprar el código?" }, a: { pt: "Sim, por R$ 798 você adquire o código completo.", en: "Yes, for R$ 798 you acquire the full source.", es: "Sí, por R$ 798 obtienes el código completo." } },
      { q: { pt: "E se eu quiser cancelar?", en: "What if I want to cancel?", es: "¿Y si quiero cancelar?" }, a: { pt: "Sem fidelidade. Você pode cancelar a qualquer momento.", en: "No lock-in. Cancel any time.", es: "Sin fidelización. Cancelas cuando quieras." } },
      { q: { pt: "Os arquivos são meus?", en: "Are the files mine?", es: "¿Los archivos son míos?" }, a: { pt: "Você adquire o código ao comprar a aquisição. Antes disso, a entrega é em formato de serviço gerenciado.", en: "You own the code once you purchase it; before that it's a managed service.", es: "Obtienes el código al comprarlo; antes es servicio gestionado." } },
      { q: { pt: "Vocês fazem alterações urgentes?", en: "Do you do urgent changes?", es: "¿Hacen cambios urgentes?" }, a: { pt: "Sim, mediante combinação. Atualizações extras saem por R$ 50 cada.", en: "Yes, on agreement. Extra updates at R$ 50 each.", es: "Sí, según acuerdo. Actualizaciones extras a R$ 50 c/u." } },
      { q: { pt: "Atende SEO?", en: "Does it cover SEO?", es: "¿Cubre SEO?" }, a: { pt: "SEO técnico completo: meta tags, sitemap, robots, schema, performance.", en: "Full technical SEO: meta, sitemap, robots, schema, performance.", es: "SEO técnico completo: meta, sitemap, robots, schema, performance." } },
      { q: { pt: "É responsiva?", en: "Is it responsive?", es: "¿Es responsiva?" }, a: { pt: "100% responsiva, testada em todos os tamanhos.", en: "100% responsive, tested across sizes.", es: "100% responsiva, probada en todos los tamaños." } },
    ],
    hasABVariant: true,
    abComparisonTarget: "desenvolvimento-de-landing-page-com-teste-ab",
    featuredOnHome: true,
    relatedPortfolio: ["banco-bhg-site-institucional", "verite-pericias-judiciais-site-institucional"],
  },
  // ----- Landing Page com A/B -----
  {
    slugs: {
      pt: "desenvolvimento-de-landing-page-com-teste-ab",
      en: "landing-page-development-with-ab-testing",
      es: "desarrollo-de-landing-page-con-test-ab",
    },
    category: "landing-pages",
    name: {
      pt: "Landing Page com Teste A/B",
      en: "Landing Page with A/B Testing",
      es: "Landing Page con Test A/B",
    },
    shortDescription: {
      pt: "Duas variações da sua landing rodando ao mesmo tempo, métricas claras.",
      en: "Two landing variants running side by side, clear metrics.",
      es: "Dos variaciones corriendo en paralelo, métricas claras.",
    },
    longDescription: {
      pt: "Sua landing page em duas versões competindo simultaneamente. A gente configura o split de tráfego, mede conversão de cada uma e te entrega a vencedora. Ideal para escalar campanha sem chutar.",
      en: "Your landing in two competing versions at the same time. We split traffic, measure conversion and hand you the winner. Ideal to scale campaigns without guessing.",
      es: "Tu landing en dos versiones compitiendo al mismo tiempo. Dividimos tráfico, medimos conversión y entregamos la ganadora. Ideal para escalar campañas sin adivinar.",
    },
    icon: "chart",
    pricing: {
      setup: 248,
      monthly: 248,
      purchase: 1298,
      deadline: { pt: "72 horas", en: "72 hours", es: "72 horas" },
    },
    features: {
      pt: ["Duas versões em produção", "Split de tráfego configurado", "Dashboard de métricas", "Tudo da Landing Page padrão"],
      en: ["Two live versions", "Traffic split configured", "Metrics dashboard", "Everything from the base Landing Page"],
      es: ["Dos versiones en producción", "Split de tráfico configurado", "Dashboard de métricas", "Todo lo de la Landing Page base"],
    },
    includes: {
      pt: ["Hospedagem inclusa", "Domínio incluso", "Ambiente seguro (SSL)", "4 atualizações por mês por página", "Atualizações extras a R$ 50 cada"],
      en: ["Hosting included", "Domain included", "Secure environment (SSL)", "4 monthly updates per page", "Extra updates at R$ 50 each"],
      es: ["Hosting incluido", "Dominio incluido", "Entorno seguro (SSL)", "4 actualizaciones mensuales por página", "Actualizaciones extras a R$ 50 c/u"],
    },
    forWho: {
      pt: ["Quem investe em tráfego e quer otimizar conversão", "Quem precisa testar 2 hipóteses de oferta", "Times que tomam decisão por dado"],
      en: ["Anyone investing in paid traffic and optimizing conversion", "Anyone testing 2 offer hypotheses", "Data-driven teams"],
      es: ["Quien invierte en tráfico y optimiza conversión", "Quien prueba 2 hipótesis de oferta", "Equipos guiados por datos"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Você fala com a gente.", en: "You message us.", es: "Nos hablas." } },
      { title: { pt: "Briefing duplo", en: "Double brief", es: "Briefing doble" }, description: { pt: "Alinhamos as 2 hipóteses.", en: "We align both hypotheses.", es: "Alineamos las 2 hipótesis." } },
      { title: { pt: "Desenvolvimento", en: "Development", es: "Desarrollo" }, description: { pt: "Em 72h as 2 versões estão prontas.", en: "In 72h both versions are ready.", es: "En 72h las 2 versiones están listas." } },
      { title: { pt: "Tracking + suporte", en: "Tracking + support", es: "Tracking + soporte" }, description: { pt: "Configuramos o split e medimos a vencedora.", en: "We configure the split and measure the winner.", es: "Configuramos el split y medimos la ganadora." } },
    ],
    faq: [
      { q: { pt: "Por que rodar A/B?", en: "Why run A/B?", es: "¿Por qué hacer A/B?" }, a: { pt: "Porque palpite custa caro. Teste te dá a decisão certa por dado.", en: "Because guessing is expensive. Testing gives data-driven decisions.", es: "Porque adivinar es caro. El test da decisiones por datos." } },
      { q: { pt: "Qual ferramenta de tracking?", en: "Which tracking tool?", es: "¿Qué herramienta de tracking?" }, a: { pt: "Configuramos com Google Analytics 4, Meta Pixel e ferramentas equivalentes.", en: "We set it up with GA4, Meta Pixel and equivalents.", es: "Configuramos con GA4, Meta Pixel y equivalentes." } },
      { q: { pt: "Posso adicionar uma 3ª versão depois?", en: "Can I add a 3rd version later?", es: "¿Puedo agregar una 3ª versión después?" }, a: { pt: "Sim, mediante combinação adicional.", en: "Yes, with an additional agreement.", es: "Sí, mediante acuerdo adicional." } },
      { q: { pt: "E se eu quiser parar o teste?", en: "What if I want to stop the test?", es: "¿Y si quiero parar el test?" }, a: { pt: "Você decide a qualquer momento. A gente mantém só a vencedora no ar.", en: "Up to you any time. We keep only the winner live.", es: "Tú decides cuando quieras. Dejamos solo la ganadora." } },
      { q: { pt: "A hospedagem está inclusa?", en: "Is hosting included?", es: "¿El hosting está incluido?" }, a: { pt: "Sim, hospedagem e domínio fazem parte.", en: "Yes, hosting and domain are included.", es: "Sí, hosting y dominio incluidos." } },
      { q: { pt: "Quanto tempo até resultado?", en: "How long until results?", es: "¿Cuánto hasta resultados?" }, a: { pt: "Depende do volume de tráfego. A gente acompanha junto.", en: "Depends on traffic volume — we track it with you.", es: "Depende del volumen de tráfico — lo seguimos contigo." } },
      { q: { pt: "Sem fidelidade?", en: "No lock-in?", es: "¿Sin fidelización?" }, a: { pt: "Sem fidelidade.", en: "No lock-in.", es: "Sin fidelización." } },
      { q: { pt: "Posso comprar o código?", en: "Can I buy the source code?", es: "¿Puedo comprar el código?" }, a: { pt: "Sim, por R$ 1.298 você adquire as 2 versões.", en: "Yes, for R$ 1,298 you get both versions.", es: "Sí, por R$ 1.298 obtienes ambas versiones." } },
    ],
    hasABVariant: true,
    abComparisonTarget: "desenvolvimento-de-landing-page-de-alta-conversao",
    featuredOnHome: false,
    relatedPortfolio: ["banco-bhg-site-institucional"],
  },
  // ----- Site profissional -----
  {
    slugs: {
      pt: "desenvolvimento-de-site-profissional",
      en: "professional-website-development",
      es: "desarrollo-de-sitio-web-profesional",
    },
    category: "sites",
    name: {
      pt: "Site Profissional",
      en: "Professional Website",
      es: "Sitio Web Profesional",
    },
    shortDescription: {
      pt: "Site institucional completo, no ar em 72h, com SEO e responsividade total.",
      en: "Complete institutional website, live in 72h, with full SEO and responsiveness.",
      es: "Sitio institucional completo, online en 72h, con SEO y responsividad total.",
    },
    longDescription: {
      pt: "Site institucional sob medida com até 6 páginas (Home, Sobre, Serviços, Portfólio, Blog ou Contato), identidade visual fiel, SEO técnico completo, hospedagem e domínio inclusos, ambiente seguro com SSL e 2 atualizações mensais. Ideal para negócios que precisam de presença digital de qualidade sem dor de cabeça.",
      en: "Tailored institutional website with up to 6 pages (Home, About, Services, Portfolio, Blog or Contact), brand-faithful identity, full technical SEO, hosting and domain included, secure SSL environment and 2 monthly updates. Ideal for businesses that want quality digital presence without headaches.",
      es: "Sitio institucional a medida con hasta 6 páginas (Home, Sobre, Servicios, Portafolio, Blog o Contacto), identidad fiel, SEO técnico completo, hosting y dominio incluidos, entorno seguro con SSL y 2 actualizaciones mensuales. Ideal para negocios que quieren presencia digital de calidad sin dolor de cabeza.",
    },
    icon: "globe",
    pricing: {
      setup: 198,
      monthly: 198,
      purchase: 1198,
      deadline: { pt: "72 horas", en: "72 hours", es: "72 horas" },
    },
    features: {
      pt: ["Até 6 páginas institucionais", "100% responsivo", "SEO técnico completo", "Integração WhatsApp", "Performance otimizada (Lighthouse 90+)"],
      en: ["Up to 6 institutional pages", "Fully responsive", "Complete technical SEO", "WhatsApp integration", "Optimized performance (Lighthouse 90+)"],
      es: ["Hasta 6 páginas institucionales", "Totalmente responsivo", "SEO técnico completo", "Integración WhatsApp", "Rendimiento optimizado (Lighthouse 90+)"],
    },
    includes: {
      pt: ["Hospedagem inclusa", "Domínio incluso", "Ambiente seguro (SSL)", "2 atualizações por mês", "Atualizações extras a R$ 150 cada"],
      en: ["Hosting included", "Domain included", "Secure environment (SSL)", "2 monthly updates", "Extra updates at R$ 150 each"],
      es: ["Hosting incluido", "Dominio incluido", "Entorno seguro (SSL)", "2 actualizaciones mensuales", "Actualizaciones extras a R$ 150 c/u"],
    },
    forWho: {
      pt: ["Negócios que querem presença digital de qualidade", "Profissionais liberais que precisam de autoridade", "Empresas cansadas de site mal feito"],
      en: ["Businesses that want quality digital presence", "Independent professionals needing authority", "Companies tired of poorly built sites"],
      es: ["Negocios que quieren presencia digital de calidad", "Profesionales independientes que necesitan autoridad", "Empresas cansadas de un sitio mal hecho"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Conta seu negócio.", en: "Tell us your business.", es: "Nos cuentas tu negocio." } },
      { title: { pt: "Briefing", en: "Brief", es: "Briefing" }, description: { pt: "Mapeamos páginas, identidade e funções.", en: "We map pages, identity and functions.", es: "Mapeamos páginas, identidad y funciones." } },
      { title: { pt: "Desenvolvimento", en: "Development", es: "Desarrollo" }, description: { pt: "Em 72h o site está no ar.", en: "In 72h the site is live.", es: "En 72h el sitio está online." } },
      { title: { pt: "Entrega + suporte", en: "Delivery + support", es: "Entrega + soporte" }, description: { pt: "Operamos a manutenção mensal.", en: "We run monthly maintenance.", es: "Operamos el mantenimiento mensual." } },
    ],
    faq: [
      { q: { pt: "72h pra um site completo?", en: "72h for a full site?", es: "¿72h para un sitio completo?" }, a: { pt: "Sim. Time experiente + processo enxuto = entrega em 72h após briefing aprovado.", en: "Yes. Experienced team + lean process = delivery in 72h after brief approval.", es: "Sí. Equipo con experiencia + proceso ágil = entrega en 72h tras briefing aprobado." } },
      { q: { pt: "Quantas páginas posso ter?", en: "How many pages?", es: "¿Cuántas páginas?" }, a: { pt: "Até 6 páginas no plano padrão. Páginas extras sob combinação.", en: "Up to 6 in the base plan. Extra pages on agreement.", es: "Hasta 6 en el plan base. Páginas extras bajo acuerdo." } },
      { q: { pt: "Hospedagem inclusa?", en: "Hosting included?", es: "¿Hosting incluido?" }, a: { pt: "Sim, hospedagem e domínio inclusos no suporte mensal.", en: "Yes, hosting and domain are part of the monthly plan.", es: "Sí, hosting y dominio en el soporte mensual." } },
      { q: { pt: "Quero comprar o código.", en: "I want the source code.", es: "Quiero el código." }, a: { pt: "R$ 1.198 e o site é seu.", en: "R$ 1,198 and the site is yours.", es: "R$ 1.198 y el sitio es tuyo." } },
      { q: { pt: "Atualizações extras?", en: "Extra updates?", es: "¿Actualizaciones extras?" }, a: { pt: "R$ 150 por atualização extra após as 2 inclusas no mês.", en: "R$ 150 per extra update after the 2 included.", es: "R$ 150 por extra después de las 2 incluidas." } },
      { q: { pt: "Tem fidelidade?", en: "Lock-in?", es: "¿Fidelización?" }, a: { pt: "Sem fidelidade.", en: "No lock-in.", es: "Sin fidelización." } },
      { q: { pt: "SEO funciona mesmo?", en: "Does SEO actually work?", es: "¿El SEO funciona?" }, a: { pt: "SEO técnico completo. Resultado depende também de conteúdo e tempo, mas a base está pronta.", en: "Full technical SEO. Results also depend on content and time, but the foundation is in place.", es: "SEO técnico completo. El resultado depende también de contenido y tiempo, pero la base está lista." } },
      { q: { pt: "Vocês fazem o conteúdo?", en: "Do you do the copy?", es: "¿Hacen el contenido?" }, a: { pt: "A gente ajuda na estrutura. Texto fino fica com você ou cobramos à parte.", en: "We help structure. Fine copy comes from you or we charge separately.", es: "Ayudamos con la estructura. El copy fino lo haces tú o cobramos aparte." } },
    ],
    hasABVariant: true,
    abComparisonTarget: "desenvolvimento-de-site-com-teste-ab",
    featuredOnHome: true,
    relatedPortfolio: ["transportadora-sabas-site-institucional", "verite-pericias-judiciais-site-institucional", "hubfive-site-institucional"],
  },
  // ----- Site com A/B -----
  {
    slugs: {
      pt: "desenvolvimento-de-site-com-teste-ab",
      en: "website-development-with-ab-testing",
      es: "desarrollo-de-sitio-web-con-test-ab",
    },
    category: "sites",
    name: {
      pt: "Site com Teste A/B",
      en: "Website with A/B Testing",
      es: "Sitio Web con Test A/B",
    },
    shortDescription: {
      pt: "Seu site em duas versões competindo, com métricas claras.",
      en: "Your website in two competing versions, with clear metrics.",
      es: "Tu sitio en dos versiones compitiendo, con métricas claras.",
    },
    longDescription: {
      pt: "Site institucional em duas versões rodando em paralelo, com split de tráfego e dashboard de conversão. Tudo do plano Site Profissional, mais a competição entre versões pra você descobrir o que funciona melhor.",
      en: "Institutional site in two parallel versions, with traffic split and conversion dashboard. Everything from Professional Website plus the head-to-head between versions.",
      es: "Sitio institucional en dos versiones paralelas, con split de tráfico y dashboard de conversión. Todo del plan Profesional más la competencia entre versiones.",
    },
    icon: "chart",
    pricing: {
      setup: 248,
      monthly: 248,
      purchase: 1998,
      deadline: { pt: "72 horas", en: "72 hours", es: "72 horas" },
    },
    features: {
      pt: ["Duas versões do site em produção", "Split de tráfego", "Dashboard de conversão", "Tudo do Site Profissional"],
      en: ["Two live site versions", "Traffic split", "Conversion dashboard", "Everything from Professional Website"],
      es: ["Dos versiones en producción", "Split de tráfico", "Dashboard de conversión", "Todo del Sitio Profesional"],
    },
    includes: {
      pt: ["Hospedagem inclusa", "Domínio incluso", "Ambiente seguro (SSL)", "2 atualizações por mês por site", "Atualizações extras a R$ 150 cada por site"],
      en: ["Hosting included", "Domain included", "Secure environment (SSL)", "2 monthly updates per site", "Extra updates at R$ 150 each per site"],
      es: ["Hosting incluido", "Dominio incluido", "Entorno seguro (SSL)", "2 actualizaciones mensuales por sitio", "Actualizaciones extras a R$ 150 c/u por sitio"],
    },
    forWho: {
      pt: ["Empresas com tráfego orgânico/pago consistente", "Quem quer otimizar conversão por dado", "Times de marketing que decidem por experimento"],
      en: ["Companies with consistent organic/paid traffic", "Anyone optimizing conversion by data", "Marketing teams that decide by experiment"],
      es: ["Empresas con tráfico orgánico/pago consistente", "Quien optimiza por datos", "Equipos de marketing que deciden por experimento"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Você fala com a gente.", en: "You message us.", es: "Nos hablas." } },
      { title: { pt: "Briefing duplo", en: "Double brief", es: "Briefing doble" }, description: { pt: "Alinhamos as 2 hipóteses.", en: "We align both hypotheses.", es: "Alineamos las 2 hipótesis." } },
      { title: { pt: "Desenvolvimento", en: "Development", es: "Desarrollo" }, description: { pt: "Em 72h os 2 sites estão no ar.", en: "In 72h both sites are live.", es: "En 72h ambos sitios están online." } },
      { title: { pt: "Tracking + suporte", en: "Tracking + support", es: "Tracking + soporte" }, description: { pt: "Configuramos o split e acompanhamos.", en: "We configure the split and track it.", es: "Configuramos el split y lo seguimos." } },
    ],
    faq: [
      { q: { pt: "Por que A/B no site institucional?", en: "Why A/B for institutional?", es: "¿Por qué A/B en sitio institucional?" }, a: { pt: "Porque até institucional converte. Bate-pronto entre 2 versões mostra qual estrutura/copy gera mais lead.", en: "Because institutional sites convert too. Two versions show which structure/copy yields more leads.", es: "Porque hasta el institucional convierte. Dos versiones muestran qué estructura/copy genera más leads." } },
      { q: { pt: "Quais ferramentas de tracking?", en: "Which tracking tools?", es: "¿Qué herramientas de tracking?" }, a: { pt: "GA4, Meta Pixel e equivalentes.", en: "GA4, Meta Pixel and equivalents.", es: "GA4, Meta Pixel y equivalentes." } },
      { q: { pt: "E se eu quiser parar o teste?", en: "What if I stop the test?", es: "¿Y si paro el test?" }, a: { pt: "A gente mantém só a vencedora no ar.", en: "We keep only the winner live.", es: "Dejamos solo la ganadora online." } },
      { q: { pt: "Posso comprar o código?", en: "Can I buy the source?", es: "¿Puedo comprar el código?" }, a: { pt: "Sim, R$ 1.998 pelas 2 versões.", en: "Yes, R$ 1,998 for both versions.", es: "Sí, R$ 1.998 por ambas versiones." } },
      { q: { pt: "Hospedagem inclusa?", en: "Hosting included?", es: "¿Hosting incluido?" }, a: { pt: "Sim.", en: "Yes.", es: "Sí." } },
      { q: { pt: "Quanto até ter resultado?", en: "How long until results?", es: "¿Cuánto hasta tener resultados?" }, a: { pt: "Depende do tráfego — geralmente 2-4 semanas.", en: "Traffic-dependent — usually 2-4 weeks.", es: "Depende del tráfico — usualmente 2-4 semanas." } },
      { q: { pt: "Sem fidelidade?", en: "No lock-in?", es: "¿Sin fidelización?" }, a: { pt: "Sem fidelidade.", en: "No lock-in.", es: "Sin fidelización." } },
      { q: { pt: "Eu acompanho as métricas?", en: "Do I see the metrics?", es: "¿Veo las métricas?" }, a: { pt: "Sim, dashboard compartilhado.", en: "Yes, shared dashboard.", es: "Sí, dashboard compartido." } },
    ],
    hasABVariant: true,
    abComparisonTarget: "desenvolvimento-de-site-profissional",
    featuredOnHome: false,
    relatedPortfolio: ["hubfive-site-institucional"],
  },
  // ----- App e Sistema Web -----
  {
    slugs: {
      pt: "desenvolvimento-de-app-mobile-e-sistema-web",
      en: "mobile-app-and-web-system-development",
      es: "desarrollo-de-app-movil-y-sistema-web",
    },
    category: "apps-e-sistemas",
    name: {
      pt: "App Mobile e Sistema Web",
      en: "Mobile App and Web System",
      es: "App Móvil y Sistema Web",
    },
    shortDescription: {
      pt: "App mobile (iOS/Android) ou sistema web sob medida — CMS, agendamento, blog, CRM ou e-commerce.",
      en: "Custom mobile app (iOS/Android) or web system — CMS, scheduling, blog, CRM or e-commerce.",
      es: "App móvil (iOS/Android) o sistema web a medida — CMS, agenda, blog, CRM o e-commerce.",
    },
    longDescription: {
      pt: "Desenvolvimento de app mobile multiplataforma (React Native) ou sistema web custom: CMS, agendamento, blog, CRM, e-commerce ou portal de cliente. Implementação em 15 dias, suporte mensal de 16 horas inclusas (depois R$ 50/hora). Aquisição do código por R$ 12.000.",
      en: "Cross-platform mobile app (React Native) or custom web system development: CMS, scheduling, blog, CRM, e-commerce or client portal. Implemented in 15 days, monthly support with 16 included hours (then R$ 50/hour). Source code acquisition at R$ 12,000.",
      es: "Desarrollo de app móvil multiplataforma (React Native) o sistema web a medida: CMS, agenda, blog, CRM, e-commerce o portal de cliente. Implementación en 15 días, soporte mensual con 16 horas incluidas (luego R$ 50/hora). Adquisición del código por R$ 12.000.",
    },
    icon: "phone",
    pricing: {
      setup: 4000,
      monthly: 700,
      purchase: 12000,
      deadline: { pt: "15 dias", en: "15 days", es: "15 días" },
    },
    features: {
      pt: ["Apps iOS e Android (React Native)", "Sistemas web sob medida", "Painel de administração", "Banco de dados Supabase", "Integrações via n8n", "Notificações e e-mails automáticos"],
      en: ["iOS and Android apps (React Native)", "Custom web systems", "Admin panel", "Supabase database", "n8n integrations", "Automatic notifications and emails"],
      es: ["Apps iOS y Android (React Native)", "Sistemas web a medida", "Panel administrativo", "Base de datos Supabase", "Integraciones con n8n", "Notificaciones y emails automáticos"],
    },
    includes: {
      pt: ["Implementação completa", "16 horas mensais de suporte", "Hospedagem inclusa", "Ambiente seguro", "Horas extras a R$ 50 cada"],
      en: ["Full implementation", "16 monthly support hours", "Hosting included", "Secure environment", "Extra hours at R$ 50 each"],
      es: ["Implementación completa", "16 horas mensuales de soporte", "Hosting incluido", "Entorno seguro", "Horas extras a R$ 50 c/u"],
    },
    forWho: {
      pt: ["Quem precisa de app mobile pro negócio", "Negócios que precisam de CMS, blog, agenda ou CRM", "Operações que querem app de cliente ou prestador"],
      en: ["Anyone needing a business mobile app", "Businesses needing CMS, blog, scheduling or CRM", "Operations needing client/provider apps"],
      es: ["Quien necesita app móvil para negocio", "Negocios que necesitan CMS, blog, agenda o CRM", "Operaciones con apps cliente/prestador"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Conte o que precisa.", en: "Tell us what you need.", es: "Cuéntanos qué necesitas." } },
      { title: { pt: "Discovery + escopo", en: "Discovery + scope", es: "Discovery + alcance" }, description: { pt: "Mapeamos funcionalidades, telas e dados.", en: "We map features, screens and data.", es: "Mapeamos funciones, pantallas y datos." } },
      { title: { pt: "Desenvolvimento (15 dias)", en: "Development (15 days)", es: "Desarrollo (15 días)" }, description: { pt: "Construímos o app/sistema completo.", en: "We build the full app/system.", es: "Construimos el app/sistema completo." } },
      { title: { pt: "Entrega + suporte", en: "Delivery + support", es: "Entrega + soporte" }, description: { pt: "Lançamos e seguimos com 16h/mês de suporte.", en: "We ship and stay with 16h/month support.", es: "Lanzamos y seguimos con 16h/mes de soporte." } },
    ],
    faq: [
      { q: { pt: "Que tipo de app/sistema vocês fazem?", en: "What type of app/system?", es: "¿Qué tipo de app/sistema?" }, a: { pt: "CMS, agendamento, blog, CRM, e-commerce, portal de cliente, app de operação. Se cabe em 15 dias, fazemos.", en: "CMS, scheduling, blog, CRM, e-commerce, client portal, operations app. If it fits in 15 days, we build it.", es: "CMS, agenda, blog, CRM, e-commerce, portal de cliente, app de operación. Si entra en 15 días, lo hacemos." } },
      { q: { pt: "iOS e Android?", en: "iOS and Android?", es: "¿iOS y Android?" }, a: { pt: "Sim, React Native cobre ambos com uma base de código.", en: "Yes, React Native covers both from one codebase.", es: "Sí, React Native cubre ambos desde una base." } },
      { q: { pt: "Publicação nas lojas?", en: "Store publishing?", es: "¿Publicación en tiendas?" }, a: { pt: "Apoio na publicação. Custos da loja (Apple/Google) são à parte.", en: "We help with publishing. Store fees (Apple/Google) are separate.", es: "Apoyo en publicación. Las tarifas de tienda son aparte." } },
      { q: { pt: "16h de suporte é o quê?", en: "What does 16h support cover?", es: "¿Qué cubre 16h de soporte?" }, a: { pt: "Ajustes, melhorias incrementais, manutenção, suporte ao usuário.", en: "Tweaks, incremental improvements, maintenance, user support.", es: "Ajustes, mejoras incrementales, mantenimiento, soporte al usuario." } },
      { q: { pt: "E se precisar de mais hora?", en: "What if I need more hours?", es: "¿Y si necesito más horas?" }, a: { pt: "R$ 50 a hora extra.", en: "R$ 50 per extra hour.", es: "R$ 50 por hora extra." } },
      { q: { pt: "Posso comprar o código?", en: "Can I buy the source?", es: "¿Puedo comprar el código?" }, a: { pt: "R$ 12.000 e o código é seu.", en: "R$ 12,000 and the code is yours.", es: "R$ 12.000 y el código es tuyo." } },
      { q: { pt: "Hospedagem é inclusa?", en: "Hosting included?", es: "¿Hosting incluido?" }, a: { pt: "Sim, hospedagem do back-end e ambiente seguro.", en: "Yes, back-end hosting and secure environment.", es: "Sí, hosting del back-end y entorno seguro." } },
      { q: { pt: "Tem fidelidade?", en: "Lock-in?", es: "¿Fidelización?" }, a: { pt: "Sem fidelidade.", en: "No lock-in.", es: "Sin fidelización." } },
    ],
    hasABVariant: false,
    featuredOnHome: false,
    relatedPortfolio: ["kz-servicos-app-cliente", "kz-servicos-app-prestador", "solumart-app-prestador"],
  },
  // ----- Software de Gestão Completo -----
  {
    slugs: {
      pt: "software-de-gestao-empresarial-com-automacao",
      en: "business-management-software-with-automation",
      es: "software-de-gestion-empresarial-con-automatizacion",
    },
    category: "apps-e-sistemas",
    name: {
      pt: "Software de Gestão Empresarial com Automação",
      en: "Business Management Software with Automation",
      es: "Software de Gestión Empresarial con Automatización",
    },
    shortDescription: {
      pt: "Software completo pra gerir financeiro, operação, clientes e processos — com automação.",
      en: "Complete software to manage finance, operations, clients and processes — with automation.",
      es: "Software completo para gestionar finanzas, operación, clientes y procesos — con automatización.",
    },
    longDescription: {
      pt: "Software de gestão completo, sob medida, integrando financeiro, operação, contratos, clientes, parceiros e relatórios automáticos via WhatsApp e e-mail. Construído com Next.js, Supabase e n8n. Implementação em 4 meses, suporte mensal incluso. Aquisição do código por R$ 50.000. Cliente nosso economiza mais de R$ 100k/ano com automações.",
      en: "Complete custom management software integrating finance, operations, contracts, clients, partners and automated reports via WhatsApp and email. Built with Next.js, Supabase and n8n. Implementation in 4 months, monthly support included. Source acquisition at R$ 50,000. One of our clients saves R$ 100k+/year with our automations.",
      es: "Software de gestión completo a medida integrando finanzas, operación, contratos, clientes, socios y reportes automáticos por WhatsApp y email. Hecho con Next.js, Supabase y n8n. Implementación en 4 meses, soporte mensual incluido. Adquisición del código por R$ 50.000. Un cliente nuestro ahorra más de R$ 100k/año con automatizaciones.",
    },
    icon: "dashboard",
    pricing: {
      setup: 20000,
      monthly: 6000,
      purchase: 50000,
      deadline: { pt: "4 meses", en: "4 months", es: "4 meses" },
    },
    features: {
      pt: ["Módulos financeiro, RH, vendas, estratégico", "Automação completa (n8n)", "Relatórios automáticos via WhatsApp e e-mail", "Exportação XLSX/PDF", "Dashboard executivo", "Múltiplos níveis de acesso"],
      en: ["Finance, HR, sales, strategy modules", "Full automation (n8n)", "Automated reports via WhatsApp and email", "XLSX/PDF export", "Executive dashboard", "Multi-level access"],
      es: ["Módulos finanzas, RR.HH., ventas, estrategia", "Automatización completa (n8n)", "Reportes automáticos por WhatsApp y email", "Exportación XLSX/PDF", "Dashboard ejecutivo", "Múltiples niveles de acceso"],
    },
    includes: {
      pt: ["Implementação completa em 4 meses", "Suporte mensal contínuo", "Hospedagem segura inclusa", "Treinamento da equipe", "Manutenção e melhorias incrementais"],
      en: ["Full 4-month implementation", "Continuous monthly support", "Secure hosting included", "Team training", "Maintenance and incremental improvements"],
      es: ["Implementación completa en 4 meses", "Soporte mensual continuo", "Hosting seguro incluido", "Capacitación del equipo", "Mantenimiento y mejoras incrementales"],
    },
    forWho: {
      pt: ["Empresas com operação complexa que querem sair de planilhas", "Quem perde horas/semana em processos manuais", "Negócios que precisam escalar sem aumentar headcount"],
      en: ["Companies with complex operations stuck in spreadsheets", "Anyone losing weekly hours to manual processes", "Businesses scaling without growing headcount"],
      es: ["Empresas con operación compleja atrapadas en planillas", "Quien pierde horas/semana en procesos manuales", "Negocios que escalan sin aumentar plantilla"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Falamos sobre o seu negócio.", en: "We discuss your business.", es: "Hablamos de tu negocio." } },
      { title: { pt: "Discovery profundo", en: "Deep discovery", es: "Discovery profundo" }, description: { pt: "Mapeamos toda a operação atual.", en: "We map the full current operation.", es: "Mapeamos toda la operación actual." } },
      { title: { pt: "Desenvolvimento (4 meses)", en: "Development (4 months)", es: "Desarrollo (4 meses)" }, description: { pt: "Construímos por módulos com entregas parciais.", en: "We build by modules with partial deliveries.", es: "Construimos por módulos con entregas parciales." } },
      { title: { pt: "Go-live + suporte", en: "Go-live + support", es: "Go-live + soporte" }, description: { pt: "Lançamos, treinamos a equipe, seguimos com suporte mensal.", en: "We ship, train the team, continue with monthly support.", es: "Lanzamos, capacitamos al equipo, seguimos con soporte mensual." } },
    ],
    faq: [
      { q: { pt: "4 meses é muito?", en: "Is 4 months too long?", es: "¿4 meses es mucho?" }, a: { pt: "É o que demora pra fazer software de gestão de qualidade. A maioria das empresas leva 12 meses ou mais.", en: "That's what quality management software takes. Most companies take 12+ months.", es: "Eso es lo que toma un software de gestión de calidad. La mayoría de empresas toma 12+ meses." } },
      { q: { pt: "Por que R$ 20k de implementação?", en: "Why R$ 20k for implementation?", es: "¿Por qué R$ 20k de implementación?" }, a: { pt: "Software custom de qualidade no mercado começa em R$ 80k+. R$ 20k é o nosso compromisso de acessibilidade.", en: "Quality custom software starts at R$ 80k+ in the market. R$ 20k is our accessibility commitment.", es: "Software custom de calidad en el mercado parte de R$ 80k+. R$ 20k es nuestro compromiso de accesibilidad." } },
      { q: { pt: "E o suporte de R$ 6k/mês?", en: "What does R$ 6k/mo support cover?", es: "¿Qué cubre R$ 6k/mes de soporte?" }, a: { pt: "Manutenção, melhorias contínuas, hospedagem segura, monitoramento e ajustes que sua operação demandar.", en: "Maintenance, ongoing improvements, secure hosting, monitoring and any operations-driven tweaks.", es: "Mantenimiento, mejoras continuas, hosting seguro, monitoreo y ajustes operativos." } },
      { q: { pt: "Posso comprar o código?", en: "Can I buy the source?", es: "¿Puedo comprar el código?" }, a: { pt: "Sim, R$ 50.000 e o código é seu.", en: "Yes, R$ 50,000 and the code is yours.", es: "Sí, R$ 50.000 y el código es tuyo." } },
      { q: { pt: "Posso integrar com sistemas atuais?", en: "Integrate with current systems?", es: "¿Integrar con sistemas actuales?" }, a: { pt: "Sim, n8n no back facilita integração com qualquer API ou banco.", en: "Yes, n8n on the back makes API/DB integrations easy.", es: "Sí, n8n facilita integraciones con cualquier API o base." } },
      { q: { pt: "Treinamento da equipe?", en: "Team training?", es: "¿Capacitación del equipo?" }, a: { pt: "Sim, sessões de treinamento incluídas no go-live.", en: "Yes, training sessions included at go-live.", es: "Sí, sesiones de capacitación incluidas en el go-live." } },
      { q: { pt: "Vai escalar com a empresa?", en: "Will it scale?", es: "¿Escala con la empresa?" }, a: { pt: "Sim, arquitetura cloud com Supabase escala junto com sua operação.", en: "Yes, cloud architecture with Supabase scales with you.", es: "Sí, arquitectura cloud con Supabase escala contigo." } },
      { q: { pt: "Cliente seu economiza R$ 100k/ano mesmo?", en: "Does a client really save R$ 100k/year?", es: "¿Un cliente realmente ahorra R$ 100k/año?" }, a: { pt: "Sim. Caso real, com automação que substituiu mais de 30 horas semanais de trabalho manual.", en: "Yes. Real case, with automation replacing 30+ weekly hours of manual work.", es: "Sí. Caso real, con automatización que reemplazó 30+ horas semanales de trabajo manual." } },
    ],
    hasABVariant: false,
    featuredOnHome: true,
    relatedPortfolio: ["banco-bhg-software-de-gestao", "hubfive-software-de-gestao", "kz-servicos-web-app-de-gestao", "transportadora-sabas-software-de-gestao", "solumart-software-de-gestao"],
  },
  // ----- Email Management -----
  {
    slugs: {
      pt: "gerenciamento-de-emails-corporativos-google-workspace-office365",
      en: "corporate-email-management-google-workspace-office365",
      es: "gestion-de-correos-corporativos-google-workspace-office365",
    },
    category: "operacao-digital",
    name: {
      pt: "Gerenciamento de E-mails Corporativos (Google Workspace / Office 365)",
      en: "Corporate Email Management (Google Workspace / Office 365)",
      es: "Gestión de Correos Corporativos (Google Workspace / Office 365)",
    },
    shortDescription: {
      pt: "E-mails @suaempresa.com.br seguros, gerenciados, em 48 horas.",
      en: "@yourcompany.com email accounts, secure and managed, in 48 hours.",
      es: "Correos @tuempresa.com seguros y gestionados, en 48 horas.",
    },
    longDescription: {
      pt: "Configuração e gestão completa de e-mails corporativos no Google Workspace ou Microsoft Office 365. Até 5 e-mails por R$ 99/mês, com ambiente digital seguro, configuração DKIM/SPF/DMARC e suporte. E-mails extras por R$ 24,99/mês cada.",
      en: "Complete setup and management of corporate emails on Google Workspace or Microsoft Office 365. Up to 5 emails for R$ 99/month, with secure digital environment, DKIM/SPF/DMARC and support. Extra emails at R$ 24.99/month each.",
      es: "Configuración y gestión integral de correos corporativos en Google Workspace o Microsoft Office 365. Hasta 5 correos por R$ 99/mes, con entorno digital seguro, DKIM/SPF/DMARC y soporte. Correos extras a R$ 24,99/mes c/u.",
    },
    icon: "envelope",
    pricing: {
      monthly: 99,
      deadline: { pt: "48 horas", en: "48 hours", es: "48 horas" },
    },
    features: {
      pt: ["Até 5 e-mails @suaempresa", "Google Workspace ou Office 365", "Anti-spam e segurança configurados", "DKIM, SPF e DMARC", "Backup automático"],
      en: ["Up to 5 @yourcompany emails", "Google Workspace or Office 365", "Anti-spam and security configured", "DKIM, SPF and DMARC", "Automatic backup"],
      es: ["Hasta 5 correos @tuempresa", "Google Workspace o Office 365", "Anti-spam y seguridad configurados", "DKIM, SPF y DMARC", "Backup automático"],
    },
    includes: {
      pt: ["Configuração completa", "Migração se já tiver e-mails", "Suporte contínuo", "E-mails adicionais por R$ 24,99/mês"],
      en: ["Complete setup", "Migration if you already have emails", "Continuous support", "Additional emails at R$ 24.99/month"],
      es: ["Configuración completa", "Migración si ya tienes correos", "Soporte continuo", "Correos adicionales a R$ 24,99/mes"],
    },
    forWho: {
      pt: ["Empresas que querem e-mail profissional sem complicação", "Quem está usando Gmail pessoal pra empresa", "Times que precisam de Google Drive ou Teams junto"],
      en: ["Companies wanting pro email without hassle", "Anyone using personal Gmail for business", "Teams needing Google Drive or Teams alongside"],
      es: ["Empresas que quieren correo profesional sin complicación", "Quien usa Gmail personal para empresa", "Equipos que necesitan Google Drive o Teams"],
    },
    process: [
      { title: { pt: "Conversa no WhatsApp", en: "WhatsApp chat", es: "Chat por WhatsApp" }, description: { pt: "Você fala com a gente.", en: "You message us.", es: "Nos hablas." } },
      { title: { pt: "Escolha plataforma", en: "Pick platform", es: "Elige plataforma" }, description: { pt: "Google Workspace ou Office 365.", en: "Google Workspace or Office 365.", es: "Google Workspace u Office 365." } },
      { title: { pt: "Configuração (48h)", en: "Setup (48h)", es: "Configuración (48h)" }, description: { pt: "Configuramos tudo, incluindo DNS.", en: "We set it all up, including DNS.", es: "Configuramos todo, incluso DNS." } },
      { title: { pt: "Suporte contínuo", en: "Ongoing support", es: "Soporte continuo" }, description: { pt: "Cuidamos do dia a dia.", en: "We handle day-to-day.", es: "Cuidamos el día a día." } },
    ],
    faq: [
      { q: { pt: "Qual escolher: Google ou Microsoft?", en: "Google or Microsoft?", es: "¿Google o Microsoft?" }, a: { pt: "Depende do uso. Google é melhor pra colaboração leve; Microsoft é melhor pra Office/Teams.", en: "Depends on use. Google for light collaboration; Microsoft for Office/Teams.", es: "Depende del uso. Google para colaboración liviana; Microsoft para Office/Teams." } },
      { q: { pt: "Posso migrar e-mails antigos?", en: "Can I migrate old emails?", es: "¿Puedo migrar correos viejos?" }, a: { pt: "Sim, fazemos a migração.", en: "Yes, we do the migration.", es: "Sí, hacemos la migración." } },
      { q: { pt: "Quantos e-mails posso ter?", en: "How many emails?", es: "¿Cuántos correos?" }, a: { pt: "Até 5 no plano base, R$ 24,99/mês por e-mail extra.", en: "Up to 5 base, R$ 24.99/mo per extra.", es: "Hasta 5 base, R$ 24,99/mes por extra." } },
      { q: { pt: "Tenho domínio próprio?", en: "Do I need a domain?", es: "¿Necesito dominio propio?" }, a: { pt: "Se já tiver, configuramos. Se não tiver, registramos com você.", en: "If you have one, we configure it. Otherwise we register together.", es: "Si tienes uno, lo configuramos. Si no, lo registramos contigo." } },
      { q: { pt: "Suporte cobre o quê?", en: "What does support cover?", es: "¿Qué cubre el soporte?" }, a: { pt: "Configurações, criação de novos e-mails, ajustes anti-spam, suporte ao usuário.", en: "Settings, new email creation, anti-spam tuning, user support.", es: "Configuraciones, creación de correos, ajustes anti-spam, soporte al usuario." } },
      { q: { pt: "Tem fidelidade?", en: "Lock-in?", es: "¿Fidelización?" }, a: { pt: "Sem fidelidade.", en: "No lock-in.", es: "Sin fidelización." } },
      { q: { pt: "É seguro?", en: "Is it secure?", es: "¿Es seguro?" }, a: { pt: "DKIM, SPF, DMARC, MFA — segurança nível corporativo.", en: "DKIM, SPF, DMARC, MFA — corporate-level security.", es: "DKIM, SPF, DMARC, MFA — seguridad nivel corporativo." } },
      { q: { pt: "Quanto tempo até funcionar?", en: "How long until it works?", es: "¿Cuánto hasta que funcione?" }, a: { pt: "48 horas após acesso ao DNS.", en: "48 hours after DNS access.", es: "48 horas tras acceso al DNS." } },
    ],
    hasABVariant: false,
    featuredOnHome: false,
    relatedPortfolio: [],
  },
];

export function getProductBySlug(slug: string, locale: Locale): Product | undefined {
  return PRODUCTS.find((p) => p.slugs[locale] === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featuredOnHome);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test src/data/products.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/products.ts src/data/products.test.ts
git commit -m "feat(data): 7 products with i18n, pricing, FAQ and helpers"
```

---

## Phase 3 — UI primitives

Reusable building blocks. Many are small. After Phase 3, the page-level work in later phases is just composition.

### Task 13: Asset migration & icon setup

**Files:**
- Move: `portifolio/<client>/*` → `public/portfolio/<client-slug>/*`
- Create: `public/icons-3d/` placeholders
- Create: `public/stack/` SVG logos

- [ ] **Step 1: Move portfolio assets**

```bash
mkdir -p public/portfolio
git mv "portifolio/Banco BHG" public/portfolio/banco-bhg
git mv "portifolio/Full Finance HubFive" public/portfolio/hubfive
git mv "portifolio/KZ Serviços" public/portfolio/kz-servicos
git mv "portifolio/Solumart Serviços" public/portfolio/solumart
git mv "portifolio/Transportadora Sabas" public/portfolio/transportadora-sabas
git mv "portifolio/Vérité Perícias Judiciais" public/portfolio/verite
rmdir portifolio
```

- [ ] **Step 2: Hide non-image assets from indexing**

The `descrição.txt` and `branding.pdf` files now live under `public/portfolio/...`. Add a Next.js exclusion: edit `next.config.ts` to add headers for these files (deny indexing). Alternatively, simpler: rename them so they aren't served as routes. Use rename:

```bash
for d in public/portfolio/*/; do
  if [ -f "$d/descrição.txt" ]; then mv "$d/descrição.txt" "$d/_descricao.txt"; fi
done
mv public/portfolio/verite/branding.pdf public/portfolio/verite/_branding.pdf 2>/dev/null || true
```

(`_`-prefixed files are still served but unlinked from the site; they're kept for reference. Add `noindex` in `robots.ts` later if needed.)

- [ ] **Step 3: Create placeholder icons-3d folder**

```bash
mkdir -p public/icons-3d
```

Add a README so the folder is committed:

`public/icons-3d/README.txt`:

```
TODO: substituir ícones 3D por arte custom da BlackElephant.

Espera-se ícones PNG transparentes (~512x512) com nomes:
chart, gear, bolt, shield, rocket, dollar, bell, cube, dashboard, phone, globe, envelope

Origem provisória: 3dicons.co (CC-BY) ou conjunto open equivalente.
```

- [ ] **Step 4: Create stack folder with placeholder SVGs**

```bash
mkdir -p public/stack
```

Add a README + minimal placeholders:

`public/stack/README.txt`:

```
SVG/PNG dos logos das stacks principais usados na home:
- nextjs.svg, supabase.svg, n8n.svg, react-native.svg

Use os logos oficiais (link na página oficial de cada projeto, sob suas respectivas licenças de marca).
```

For now, create minimalist placeholder SVGs so the layout is unblocked. Each as `public/stack/<name>.svg` with a 64x64 placeholder rect + label. Example for `nextjs.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="12" fill="#0a0a0a" stroke="#39FF14"/><text x="32" y="36" text-anchor="middle" fill="#39FF14" font-family="sans-serif" font-size="10" font-weight="700">N</text></svg>
```

Replicate for `supabase.svg` (label `S`), `n8n.svg` (label `8`), `react-native.svg` (label `RN`). Mark `// TODO: replace with official logos` in `data/stack.ts` header.

- [ ] **Step 5: Verify dev**

Run: `npm run dev`. Visit `http://localhost:3000/portfolio/banco-bhg/1.png` — should serve. Stop server.

- [ ] **Step 6: Commit**

```bash
git add public/portfolio public/icons-3d public/stack
git commit -m "chore(assets): migrate portfolio images, scaffold icons-3d and stack folders"
```

---

### Task 14: Logo, Button, and base UI primitives

**Files:**
- Modify: `src/components/ui/Logo.tsx`
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 1: `src/components/ui/Logo.tsx`**

Replace existing content (or write fresh):

```tsx
import Image from "next/image";
import Link from "next/link";

type Props = { compact?: boolean; href?: string; className?: string };

export function Logo({ compact = false, href = "/", className = "" }: Props) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="BlackElephant"
        width={36}
        height={36}
        className="rounded-md"
        priority
      />
      {!compact && (
        <span
          style={{
            fontFamily: "var(--font-title)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
          }}
        >
          BlackElephant
        </span>
      )}
    </span>
  );
  return href ? <Link href={href} aria-label="BlackElephant — início">{inner}</Link> : inner;
}
```

- [ ] **Step 2: `src/components/ui/Button.tsx`**

Replace with:

```tsx
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-lime)] text-[var(--color-black)] hover:bg-[var(--color-lime-dark)] shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)]",
  secondary:
    "border border-[var(--color-lime)] text-[var(--color-lime)] hover:bg-[var(--color-lime-soft)]",
  ghost:
    "text-[var(--foreground)] hover:bg-[var(--color-gray-800)]",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

type CommonProps = { variant?: Variant; size?: Size; children: ReactNode; className?: string };

type AsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", className = "", children, ...rest } = props as CommonProps & Record<string, unknown>;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if ("href" in rest && typeof rest.href === "string") {
    const { href, external, ...anchorRest } = rest as AsLink;
    if (external) {
      return (
        <a className={classes} href={href} target="_blank" rel="noopener noreferrer" {...anchorRest}>
          {children}
        </a>
      );
    }
    return (
      <Link className={classes} href={href} {...(anchorRest as object)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: `src/components/ui/index.ts`**

Replace with explicit exports (re-add later as we create more):

```ts
export { Logo } from "./Logo";
export { Button } from "./Button";
export { LoadingScreen } from "./LoadingScreen";
export { ScrollReveal } from "./ScrollReveal";
export { AnimatedSection } from "./AnimatedSection";
```

- [ ] **Step 4: Verify dev**

Run: `npm run dev` and view the home stub — should still render. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui
git commit -m "feat(ui): rewrite Logo + Button with variant API"
```

---

### Task 15: ScrollReveal + AnimatedSection alignment

**Files:**
- Modify: `src/components/ui/ScrollReveal.tsx`
- Modify: `src/components/ui/AnimatedSection.tsx`

These exist; replace contents with the canonical version below. Keep names so existing imports keep working.

- [ ] **Step 1: `ScrollReveal.tsx`**

```tsx
"use client";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
};

export function ScrollReveal({ children, delay = 0, className, y = 24 }: Props) {
  const reduce = useReducedMotion();
  const variants: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: `AnimatedSection.tsx`**

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = { children: ReactNode; id?: string; className?: string };

export function AnimatedSection({ children, id, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ScrollReveal.tsx src/components/ui/AnimatedSection.tsx
git commit -m "feat(ui): canonical ScrollReveal and AnimatedSection with reduced-motion"
```

---

### Task 16: Marquee primitive

**Files:**
- Create: `src/components/ui/Marquee.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
};

export function Marquee({ children, speed = 40, className = "", pauseOnHover = true }: Props) {
  const duration = `${Math.max(10, 240 / speed * 10)}s`;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className={`flex gap-12 w-max ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""} motion-reduce:animate-none`}
        style={{ animation: `marquee-scroll ${duration} linear infinite` }}
      >
        <div className="flex gap-12 shrink-0">{children}</div>
        <div className="flex gap-12 shrink-0" aria-hidden="true">{children}</div>
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel**

Append to `src/components/ui/index.ts`:

```ts
export { Marquee } from "./Marquee";
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/ui/Marquee.tsx src/components/ui/index.ts
git commit -m "feat(ui): Marquee with mask fade and pause-on-hover"
```

---

### Task 17: Glow + FloatCard primitives

**Files:**
- Create: `src/components/ui/Glow.tsx`
- Create: `src/components/ui/FloatCard.tsx`

- [ ] **Step 1: `Glow.tsx`**

```tsx
import type { ReactNode, CSSProperties } from "react";

type Intensity = "sm" | "md" | "lg" | "xl";

const map: Record<Intensity, string> = {
  sm: "var(--shadow-glow)",
  md: "var(--shadow-glow-lg)",
  lg: "var(--shadow-glow-xl)",
  xl: "0 0 80px var(--color-lime-glow), 0 0 160px rgba(57,255,20,0.18)",
};

type Props = {
  intensity?: Intensity;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "div" | "section";
};

export function Glow({ intensity = "md", className, style, children, as = "div" }: Props) {
  const Tag = as;
  return (
    <Tag className={className} style={{ boxShadow: map[intensity], ...style }}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: `FloatCard.tsx`**

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
};

export function FloatCard({ children, className, amplitude = 10, duration = 5, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -amplitude, 0] }}
      transition={reduce ? undefined : { duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Update barrel**

```ts
export { Glow } from "./Glow";
export { FloatCard } from "./FloatCard";
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/components/ui/Glow.tsx src/components/ui/FloatCard.tsx src/components/ui/index.ts
git commit -m "feat(ui): Glow and FloatCard primitives"
```

---

### Task 18: StatCounter (logic + smoke test)

**Files:**
- Create: `src/components/ui/StatCounter.tsx`
- Create: `src/components/ui/StatCounter.test.tsx`

- [ ] **Step 1: Tests**

```tsx
// src/components/ui/StatCounter.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCounter } from "./StatCounter";

describe("StatCounter", () => {
  it("renders the prefix, value, and suffix", () => {
    render(<StatCounter value={300} prefix="" suffix="+" label="projetos" />);
    // initial render shows the target value (we render reduced-motion safe)
    expect(screen.getByText(/300/)).toBeInTheDocument();
    expect(screen.getByText("projetos")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
"use client";
import { motion, useInView, useMotionValue, useTransform, useReducedMotion, animate } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  duration?: number;
};

export function StatCounter({ value, prefix = "", suffix = "", decimals = 0, label, duration = 1.6 }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const motionValue = useMotionValue(reduce ? value : 0);
  const display = useTransform(motionValue, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (reduce) return;
    if (inView) {
      const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
  }, [inView, value, duration, motionValue, reduce]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div
        style={{
          fontFamily: "var(--font-title)",
          fontSize: "var(--text-h2)",
          fontWeight: 700,
          color: "var(--color-lime)",
          textShadow: "var(--text-glow)",
          lineHeight: 1.05,
        }}
      >
        {prefix}
        <motion.span>{display}</motion.span>
        {suffix}
      </div>
      <div style={{ marginTop: "0.5rem", color: "var(--foreground-muted)", fontSize: "var(--text-sm)" }}>
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run tests**

Run: `npm test src/components/ui/StatCounter.test.tsx`
Expected: pass.

- [ ] **Step 4: Update barrel + commit**

Append to `src/components/ui/index.ts`:

```ts
export { StatCounter } from "./StatCounter";
```

```bash
git add src/components/ui/StatCounter.tsx src/components/ui/StatCounter.test.tsx src/components/ui/index.ts
git commit -m "feat(ui): StatCounter with viewport-triggered animation"
```

---

### Task 19: PriceTag + TrustBadges

**Files:**
- Create: `src/components/ui/PriceTag.tsx`
- Create: `src/components/ui/TrustBadges.tsx`

- [ ] **Step 1: `PriceTag.tsx`**

```tsx
import type { Locale } from "@/types";

type Props = {
  setup?: number;
  monthly?: number;
  purchase?: number;
  deadline: string;
  locale: Locale;
};

const labels: Record<Locale, { from: string; setup: string; monthly: string; purchase: string; deadline: string; currency: string }> = {
  pt: { from: "a partir de", setup: "para começar", monthly: "/mês", purchase: "compra única", deadline: "Prazo", currency: "R$" },
  en: { from: "starting at", setup: "to start", monthly: "/month", purchase: "one-time", deadline: "Deadline", currency: "R$" },
  es: { from: "desde", setup: "para empezar", monthly: "/mes", purchase: "compra única", deadline: "Plazo", currency: "R$" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export function PriceTag({ setup, monthly, purchase, deadline, locale }: Props) {
  const t = labels[locale];
  return (
    <div
      className="flex flex-col gap-2 p-5 rounded-xl border"
      style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}
    >
      {setup != null && (
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider opacity-70">{t.setup}</span>
          <span style={{ fontSize: "var(--text-h3)", fontWeight: 700, color: "var(--color-lime)" }}>
            {t.currency} {fmt(setup)}
          </span>
        </div>
      )}
      {monthly != null && (
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider opacity-70">{t.monthly}</span>
          <span style={{ fontWeight: 600 }}>{t.currency} {fmt(monthly)}</span>
        </div>
      )}
      {purchase != null && (
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider opacity-70">{t.purchase}</span>
          <span style={{ fontWeight: 600 }}>{t.currency} {fmt(purchase)}</span>
        </div>
      )}
      <div className="mt-1 inline-flex items-center gap-2 text-xs" style={{ color: "var(--color-lime)" }}>
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: "var(--color-lime)", boxShadow: "0 0 8px var(--color-lime)" }} />
        {t.deadline}: <strong>{deadline}</strong>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `TrustBadges.tsx`**

```tsx
import type { Locale } from "@/types";

type Props = { locale: Locale };

const badges: Record<Locale, Array<{ icon: string; label: string }>> = {
  pt: [
    { icon: "⚡", label: "Resposta em minutos" },
    { icon: "🎯", label: "8 anos no mercado" },
    { icon: "💬", label: "Sem orçamento de 30 dias" },
    { icon: "🔒", label: "Sigilo total" },
  ],
  en: [
    { icon: "⚡", label: "Reply in minutes" },
    { icon: "🎯", label: "8 years in the market" },
    { icon: "💬", label: "No 30-day quotes" },
    { icon: "🔒", label: "Full confidentiality" },
  ],
  es: [
    { icon: "⚡", label: "Respuesta en minutos" },
    { icon: "🎯", label: "8 años en el mercado" },
    { icon: "💬", label: "Sin presupuesto de 30 días" },
    { icon: "🔒", label: "Confidencialidad total" },
  ],
};

export function TrustBadges({ locale }: Props) {
  return (
    <ul className="flex flex-wrap gap-3">
      {badges[locale].map((b) => (
        <li
          key={b.label}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border"
          style={{ background: "var(--glass-background)", borderColor: "var(--glass-border)", backdropFilter: "blur(8px)" }}
        >
          <span aria-hidden>{b.icon}</span>
          <span>{b.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Update barrel + commit**

Append:

```ts
export { PriceTag } from "./PriceTag";
export { TrustBadges } from "./TrustBadges";
```

```bash
git add src/components/ui/PriceTag.tsx src/components/ui/TrustBadges.tsx src/components/ui/index.ts
git commit -m "feat(ui): PriceTag with locale-aware copy and TrustBadges"
```

---

### Task 20: FAQAccordion

**Files:**
- Create: `src/components/ui/FAQAccordion.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useState } from "react";

type FAQ = { q: string; a: string };
type Props = { items: FAQ[] };

export function FAQAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li
            key={i}
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[var(--card-hover)] transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
            >
              <span style={{ fontWeight: 600 }}>{it.q}</span>
              <span aria-hidden style={{ color: "var(--color-lime)", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 200ms" }}>+</span>
            </button>
            {isOpen && (
              <div id={`faq-panel-${i}`} className="px-5 pb-4 text-[var(--foreground-muted)]" style={{ lineHeight: 1.6 }}>
                {it.a}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Update barrel + commit**

```ts
export { FAQAccordion } from "./FAQAccordion";
```

```bash
git add src/components/ui/FAQAccordion.tsx src/components/ui/index.ts
git commit -m "feat(ui): FAQAccordion with single-open behavior"
```

---

### Task 21: WhatsAppButton + WhatsAppFloating

**Files:**
- Create: `src/components/ui/WhatsAppButton.tsx`
- Create: `src/components/ui/WhatsAppFloating.tsx`

- [ ] **Step 1: `WhatsAppButton.tsx`**

```tsx
import { Button } from "./Button";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Locale, WhatsAppContext } from "@/types";

type Props = {
  context: WhatsAppContext;
  locale: Locale;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function WhatsAppButton({ context, locale, children, variant = "primary", size = "md", className }: Props) {
  return (
    <Button
      href={whatsappUrl(context, locale)}
      external
      variant={variant}
      size={size}
      className={className}
      aria-label={typeof children === "string" ? children : "WhatsApp"}
    >
      <span aria-hidden style={{ fontSize: "1.1em" }}>💬</span>
      {children}
    </Button>
  );
}
```

- [ ] **Step 2: `WhatsAppFloating.tsx`**

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Locale, WhatsAppContext } from "@/types";

type Props = { context: WhatsAppContext; locale: Locale; tooltip: string };

export function WhatsAppFloating({ context, locale, tooltip }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={whatsappUrl(context, locale)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tooltip}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, duration: reduce ? 0 : 0.4, ease: "easeOut" }}
      className="fixed bottom-6 right-6 group"
      style={{ zIndex: 500 }}
    >
      <span className="relative inline-flex items-center justify-center rounded-full"
        style={{ width: 60, height: 60, background: "var(--color-lime)", boxShadow: "0 6px 24px rgba(57,255,20,0.5), 0 0 40px rgba(57,255,20,0.4)" }}>
        {!reduce && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid var(--color-lime)",
              animation: "wa-pulse 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
            }}
          />
        )}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-black)" aria-hidden>
          <path d="M20.5 3.5A11 11 0 0 0 3.6 18l-1.6 5.5 5.7-1.5A11 11 0 1 0 20.5 3.5Zm-8.4 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.4.9.9-3.3-.2-.3a9 9 0 1 1 7.6 4.2Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.9c-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5l.2-.3c.1-.1.1-.3 0-.4l-.9-2.2c-.2-.5-.4-.4-.6-.4h-.6a1 1 0 0 0-.7.4 3 3 0 0 0-1 2.2c0 1.3 1 2.6 1.1 2.7.1.2 2 3 4.8 4.2 1.7.7 2.3.8 3.1.6.5-.1 1.6-.6 1.8-1.2.2-.6.2-1.1.2-1.2 0 0-.2-.1-.5-.2Z" />
        </svg>
      </span>
      <span className="hidden md:block absolute right-[72px] top-1/2 -translate-y-1/2 px-3 py-1 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "var(--background-tertiary)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}>
        {tooltip}
      </span>
      <style>{`@keyframes wa-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.7); opacity: 0; } }`}</style>
    </motion.a>
  );
}
```

- [ ] **Step 3: Update barrel + commit**

```ts
export { WhatsAppButton } from "./WhatsAppButton";
export { WhatsAppFloating } from "./WhatsAppFloating";
```

```bash
git add src/components/ui/WhatsAppButton.tsx src/components/ui/WhatsAppFloating.tsx src/components/ui/index.ts
git commit -m "feat(ui): WhatsApp button (link) and persistent floating CTA"
```

---

### Task 22: Lightbox wrapper

**Files:**
- Create: `src/components/ui/Lightbox.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useState } from "react";
import LightboxLib from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Props = { images: string[]; alt?: string };

export function Lightbox({ images, alt = "Project image" }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <li key={src}>
            <button
              onClick={() => setIndex(i)}
              className="block w-full aspect-[4/3] overflow-hidden rounded-xl border transition-transform hover:scale-[1.02]"
              style={{ borderColor: "var(--card-border)", background: "var(--card-background)" }}
              aria-label={`Open image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <LightboxLib
        open={index !== null}
        index={index ?? 0}
        close={() => setIndex(null)}
        slides={images.map((src) => ({ src }))}
      />
    </>
  );
}
```

- [ ] **Step 2: Update barrel + commit**

```ts
export { Lightbox } from "./Lightbox";
```

```bash
git add src/components/ui/Lightbox.tsx src/components/ui/index.ts
git commit -m "feat(ui): Lightbox grid wrapping yet-another-react-lightbox"
```

---

### Task 23: HeroBg + HeroOrb (Three.js)

**Files:**
- Create: `src/components/ui/HeroBg.tsx`
- Create: `src/components/ui/HeroOrb.tsx`

- [ ] **Step 1: `HeroBg.tsx`**

```tsx
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

export function HeroBg({ children, className = "" }: Props) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "var(--gradient-mesh)",
          backgroundColor: "var(--background)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(var(--dot-color) 1px, transparent 1px)`,
          backgroundSize: `var(--dot-spacing) var(--dot-spacing)`,
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: `HeroOrb.tsx`** (Three.js, lazy)

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function HeroOrb() {
  const ref = useRef<HTMLDivElement>(null);
  const [mountable, setMountable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setMountable(true);
  }, []);

  useEffect(() => {
    if (!mountable || !ref.current) return;
    let cancelled = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import("three");
      if (cancelled || !ref.current) return;
      const w = ref.current.clientWidth;
      const h = ref.current.clientHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      camera.position.z = 4;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      ref.current.appendChild(renderer.domElement);

      const geometry = new THREE.IcosahedronGeometry(1.4, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x39ff14,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      });
      const orb = new THREE.Mesh(geometry, material);
      scene.add(orb);

      const particles = new THREE.BufferGeometry();
      const count = 80;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 6;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
      particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const points = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0x39ff14, size: 0.04, transparent: true, opacity: 0.7 }));
      scene.add(points);

      let frameId = 0;
      const animate = () => {
        orb.rotation.y += 0.0025;
        orb.rotation.x += 0.001;
        points.rotation.y -= 0.0008;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (!ref.current) return;
        const w2 = ref.current.clientWidth;
        const h2 = ref.current.clientHeight;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        particles.dispose();
        if (ref.current && renderer.domElement.parentNode === ref.current) {
          ref.current.removeChild(renderer.domElement);
        }
      };
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [mountable]);

  return <div ref={ref} aria-hidden className="absolute inset-0 pointer-events-none opacity-60" />;
}
```

- [ ] **Step 3: Update barrel + commit**

```ts
export { HeroBg } from "./HeroBg";
export { HeroOrb } from "./HeroOrb";
```

```bash
git add src/components/ui/HeroBg.tsx src/components/ui/HeroOrb.tsx src/components/ui/index.ts
git commit -m "feat(ui): HeroBg gradient mesh + HeroOrb Three.js (mobile-off, lazy)"
```

---

## Phase 4 — Layout (Header, Footer, Locale switcher, Mobile drawer)

After Phase 4 the site shell renders correctly on every page (even if pages are still stubs).

### Task 24: LanguageSwitcher

**Files:**
- Create: `src/components/layout/LanguageSwitcher.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { Locale } from "@/types";

const FLAGS: Record<Locale, string> = { pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸" };
const LABELS: Record<Locale, string> = { pt: "PT", en: "EN", es: "ES" };

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale() as Locale;
  const list: Locale[] = ["pt", "en", "es"];
  return (
    <div className={`inline-flex items-center gap-1 rounded-full p-1 border ${className}`}
      style={{ background: "var(--glass-background)", borderColor: "var(--glass-border)" }}>
      {list.map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            onClick={() => router.replace(pathname, { locale: l })}
            aria-current={active ? "true" : undefined}
            aria-label={`Mudar para ${LABELS[l]}`}
            className={`text-xs font-semibold rounded-full px-2.5 py-1 transition-all ${active ? "" : "opacity-60 hover:opacity-100"}`}
            style={active ? { background: "var(--color-lime)", color: "var(--color-black)" } : undefined}
          >
            <span aria-hidden className="mr-1">{FLAGS[l]}</span>{LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/layout/index.ts`**

```ts
export { Header } from "./Header";
export { Footer } from "./Footer";
export { LanguageSwitcher } from "./LanguageSwitcher";
export { MobileNav } from "./MobileNav";
```

(MobileNav is added in next task; declare here to keep barrel sane.)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/LanguageSwitcher.tsx src/components/layout/index.ts
git commit -m "feat(layout): LanguageSwitcher with flag+code pills"
```

---

### Task 25: MobileNav drawer

**Files:**
- Create: `src/components/layout/MobileNav.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Locale } from "@/types";

type NavItem = { href: string; label: string };
type Props = { items: NavItem[]; locale: Locale; whatsappLabel: string };

export function MobileNav({ items, locale, whatsappLabel }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border"
        style={{ borderColor: "var(--card-border)" }}
      >
        <span aria-hidden style={{ width: 18, height: 14, position: "relative" }}>
          <span style={{ position: "absolute", left: 0, top: 0, width: 18, height: 2, background: "var(--foreground)" }} />
          <span style={{ position: "absolute", left: 0, top: 6, width: 18, height: 2, background: "var(--foreground)" }} />
          <span style={{ position: "absolute", left: 0, top: 12, width: 18, height: 2, background: "var(--foreground)" }} />
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          />
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm flex flex-col"
            style={{ background: "var(--background)", borderLeft: "1px solid var(--card-border)" }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
              <span style={{ fontFamily: "var(--font-title)", fontWeight: 700 }}>Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="w-9 h-9 rounded-md inline-flex items-center justify-center border"
                style={{ borderColor: "var(--card-border)" }}
              >✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-1">
                {items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-3 rounded-md hover:bg-[var(--card-hover)]"
                      style={{ fontWeight: 600 }}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t flex flex-col gap-3" style={{ borderColor: "var(--card-border)" }}>
              <LanguageSwitcher />
              <WhatsAppButton context={{ kind: "generic" }} locale={locale} size="lg">
                {whatsappLabel}
              </WhatsAppButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MobileNav.tsx
git commit -m "feat(layout): MobileNav drawer with backdrop, scroll lock, lang+CTA"
```

---

### Task 26: Header with sticky glass + product mega-menu

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Replace the file with the canonical header**

```tsx
"use client";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { PRODUCTS } from "@/data/products";
import type { Locale } from "@/types";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { href: "/", label: t("home") },
    { href: "/quem-somos", label: t("about") },
    { href: "/portfolio", label: t("portfolio") },
    { href: "/produtos", label: t("products") },
    { href: "/contato", label: t("contact") },
  ];

  return (
    <header
      className="fixed top-0 inset-x-0 z-[150] transition-all duration-300"
      style={{
        background: scrolled ? "var(--nav-background)" : "transparent",
        backdropFilter: scrolled ? `blur(var(--glass-blur))` : "none",
        borderBottom: scrolled ? `1px solid var(--nav-border)` : "1px solid transparent",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 h-16 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden md:block">
          <ul className="flex items-center gap-1">
            {items.map((it) => {
              const active = pathname === it.href;
              const isProducts = it.href === "/produtos";
              return (
                <li
                  key={it.href}
                  className="relative"
                  onMouseEnter={isProducts ? () => setProductsOpen(true) : undefined}
                  onMouseLeave={isProducts ? () => setProductsOpen(false) : undefined}
                >
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-[var(--card-hover)] transition-colors relative"
                  >
                    {it.label}
                    {active && (
                      <span aria-hidden className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full"
                        style={{ background: "var(--color-lime)", boxShadow: "0 0 8px var(--color-lime)" }} />
                    )}
                  </Link>
                  {isProducts && productsOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 w-[640px] rounded-xl border p-5 grid grid-cols-2 gap-3"
                      style={{ background: "var(--glass-background)", backdropFilter: "blur(var(--glass-blur))", borderColor: "var(--glass-border)" }}
                    >
                      {PRODUCTS.map((p) => (
                        <Link
                          key={p.slugs[locale]}
                          href={`/produtos/${p.slugs[locale]}`}
                          className="block p-3 rounded-md hover:bg-[var(--card-hover)] transition-colors"
                        >
                          <div className="text-sm font-semibold">{p.name[locale]}</div>
                          <div className="text-xs opacity-70 mt-0.5 line-clamp-1">{p.shortDescription[locale]}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <WhatsAppButton context={{ kind: "generic" }} locale={locale} size="sm">
            {t("ctaWhatsapp")}
          </WhatsAppButton>
        </div>
        <MobileNav items={items} locale={locale} whatsappLabel={t("ctaWhatsapp")} />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(layout): Header with sticky glass, product mega-menu, mobile drawer"
```

---

### Task 27: Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Replace file**

```tsx
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { whatsappUrl, WHATSAPP_PHONE } from "@/lib/whatsapp";
import { PRODUCTS } from "@/data/products";
import { localBusinessSchema } from "@/lib/schema";
import type { Locale } from "@/types";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const locale = useLocale() as Locale;
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-24 border-t"
      style={{
        background: "var(--background-secondary)",
        borderColor: "var(--card-border)",
        backgroundImage: `radial-gradient(var(--dot-color) 1px, transparent 1px)`,
        backgroundSize: `var(--dot-spacing) var(--dot-spacing)`,
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-16 grid gap-12 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            {t("tagline")}
          </p>
          <address className="not-italic text-sm leading-6" style={{ color: "var(--foreground-muted)" }}>
            BlackElephant Brasil LTDA<br />
            Av. Yojiro Takaoka, 4384, Sala 701<br />
            Alphaville, Santana de Parnaíba — SP<br />
            06541-038
          </address>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider mb-4 opacity-70">{t("site")}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/">{tn("home")}</Link></li>
            <li><Link href="/quem-somos">{tn("about")}</Link></li>
            <li><Link href="/portfolio">{tn("portfolio")}</Link></li>
            <li><Link href="/produtos">{tn("products")}</Link></li>
            <li><Link href="/contato">{tn("contact")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider mb-4 opacity-70">{tn("products")}</h3>
          <ul className="space-y-2 text-sm">
            {PRODUCTS.map((p) => (
              <li key={p.slugs[locale]}>
                <Link href={`/produtos/${p.slugs[locale]}`}>{p.name[locale]}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider mb-4 opacity-70">{t("contact")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={whatsappUrl({ kind: "generic" }, locale)} target="_blank" rel="noopener noreferrer">
                WhatsApp: +55 19 97805-5531
              </a>
            </li>
            <li><a href="mailto:guilherme@blackelephant.com.br">guilherme@blackelephant.com.br</a></li>
            <li><a href={`tel:+${WHATSAPP_PHONE}`}>+55 19 97805-5531</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-6 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
        style={{ borderColor: "var(--card-border)", color: "var(--foreground-muted)" }}>
        <span>
          © 2017–{year} BlackElephant Brasil LTDA · {/* TODO: confirmar CNPJ */}CNPJ XX.XXX.XXX/0001-XX
        </span>
        <div className="flex gap-4 items-center">
          {/* TODO: criar /privacidade e /termos */}
          <a href="#privacidade" aria-disabled className="opacity-60">{t("privacy")}</a>
          <a href="#termos" aria-disabled className="opacity-60">{t("terms")}</a>
          <LanguageSwitcher />
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat(layout): Footer with 4 columns, JSON-LD LocalBusiness, lang switcher"
```

---

### Task 28: Wire layout + Loading + WhatsAppFloating in root layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Replace with the full canonical layout**

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter, Sora } from "next/font/google";
import { routing } from "@/i18n/routing";
import { LoadingProvider } from "@/components/providers/LoadingProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/ui/WhatsAppFloating";
import { organizationSchema } from "@/lib/schema";
import { makeMetadata } from "@/lib/metadata";
import type { Locale } from "@/types";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], display: "swap", variable: "--font-sora" });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return makeMetadata({
    title: t("defaultTitle"),
    description: t("defaultDescription"),
    path: locale === "pt" ? "/" : `/${locale}/`,
    locale: locale as Locale,
    alternatePaths: { pt: "/", en: "/en/", es: "/es/" },
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} className={`${inter.variable} ${sora.variable}`}>
      <body style={{ fontFamily: "var(--font-primary)" }}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LoadingProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppFloating
              context={{ kind: "generic" }}
              locale={locale as Locale}
              tooltip={t("whatsappTooltip")}
            />
          </LoadingProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update `globals.css` to apply font vars**

Open `src/app/globals.css`. Ensure body uses `var(--font-primary)`. If `--font-primary` isn't applied through `next/font` variables, add this rule near top:

```css
:root {
  --font-primary: var(--font-inter), system-ui, -apple-system, sans-serif;
  --font-title: var(--font-sora), system-ui, -apple-system, sans-serif;
}
body { font-family: var(--font-primary); }
```

(Replace any prior `@import url(...fonts.googleapis...)` from `design-tokens.css` — the next/font variables are the source of truth now. If the import is still there, leave it; it's harmless but redundant.)

- [ ] **Step 3: Stub messages files for `nav`, `metadata`, `common`, `footer`, `home`**

Edit each of `src/i18n/messages/pt.json`, `en.json`, `es.json` and ensure the **minimum keys exist** so the layout/header/footer render without throwing. Use this PT seed (replicate translations in en/es with reasonable copy):

`pt.json`:

```json
{
  "metadata": {
    "brand": "BlackElephant",
    "defaultTitle": "BlackElephant — Tecnologia de impacto, em tempo recorde",
    "defaultDescription": "Sites em 72h, apps mobile, sistemas web e softwares de gestão com automação. Mais de 300 projetos entregues."
  },
  "common": {
    "whatsappTooltip": "Fale com a gente no WhatsApp"
  },
  "nav": {
    "home": "Início",
    "about": "Quem somos",
    "portfolio": "Portfólio",
    "products": "Produtos",
    "contact": "Contato",
    "ctaWhatsapp": "WhatsApp"
  },
  "footer": {
    "tagline": "Tecnologia de impacto, em tempo recorde.",
    "site": "Site",
    "contact": "Contato direto",
    "privacy": "Política de Privacidade",
    "terms": "Termos de Uso"
  }
}
```

`en.json`:

```json
{
  "metadata": {
    "brand": "BlackElephant",
    "defaultTitle": "BlackElephant — High-impact technology, delivered in record time",
    "defaultDescription": "Websites in 72h, mobile apps, web systems and management software with automation. 300+ delivered projects."
  },
  "common": { "whatsappTooltip": "Chat with us on WhatsApp" },
  "nav": {
    "home": "Home", "about": "About", "portfolio": "Portfolio",
    "products": "Products", "contact": "Contact", "ctaWhatsapp": "WhatsApp"
  },
  "footer": {
    "tagline": "High-impact technology, delivered in record time.",
    "site": "Site", "contact": "Direct contact",
    "privacy": "Privacy Policy", "terms": "Terms of Use"
  }
}
```

`es.json`:

```json
{
  "metadata": {
    "brand": "BlackElephant",
    "defaultTitle": "BlackElephant — Tecnología de impacto, en tiempo récord",
    "defaultDescription": "Sitios en 72h, apps móviles, sistemas web y software de gestión con automatización. Más de 300 proyectos entregados."
  },
  "common": { "whatsappTooltip": "Habla con nosotros por WhatsApp" },
  "nav": {
    "home": "Inicio", "about": "Sobre", "portfolio": "Portafolio",
    "products": "Productos", "contact": "Contacto", "ctaWhatsapp": "WhatsApp"
  },
  "footer": {
    "tagline": "Tecnología de impacto, en tiempo récord.",
    "site": "Sitio", "contact": "Contacto directo",
    "privacy": "Política de Privacidad", "terms": "Términos de Uso"
  }
}
```

- [ ] **Step 4: Run dev**

Run: `npm run dev`. Visit `/`, `/en`, `/es`. Header + footer render, language switcher works, WhatsApp floating appears, mobile drawer opens. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/app src/i18n/messages
git commit -m "feat(layout): root layout with header/footer/WhatsAppFloating + base i18n"
```

---

## Phase 5 — Home page (8 sections)

After Phase 5 the home is fully shippable.

### Task 29: Section components scaffold

**Files:**
- Create: `src/components/sections/home/index.ts`
- Create: `src/components/sections/home/Hero.tsx`
- Create: `src/components/sections/home/ClientMarquee.tsx`
- Create: `src/components/sections/home/Testimonials.tsx`
- Create: `src/components/sections/home/FeaturedPortfolio.tsx`
- Create: `src/components/sections/home/RealStats.tsx`
- Create: `src/components/sections/home/FeaturedProducts.tsx`
- Create: `src/components/sections/home/StackStrip.tsx`
- Create: `src/components/sections/home/FinalCTA.tsx`

Each section is a server component that takes `locale` as prop and reads from i18n + data. Below is the full canonical implementation.

- [ ] **Step 1: `Hero.tsx`**

```tsx
import { useTranslations } from "next-intl";
import Image from "next/image";
import { HeroBg } from "@/components/ui/HeroBg";
import { HeroOrb } from "@/components/ui/HeroOrb";
import { FloatCard } from "@/components/ui/FloatCard";
import { Glow } from "@/components/ui/Glow";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Locale } from "@/types";

type Props = { locale: Locale };

export function Hero({ locale }: Props) {
  const t = useTranslations("home.hero");
  return (
    <HeroBg className="pt-28 pb-16 lg:pt-32 lg:pb-24">
      <HeroOrb />
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] mb-6"
            style={{ color: "var(--color-lime)" }}>
            <span aria-hidden className="w-2 h-2 rounded-full"
              style={{ background: "var(--color-lime)", boxShadow: "0 0 12px var(--color-lime)", animation: "pulse-dot 2s ease-in-out infinite" }} />
            {t("eyebrow")}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-title)",
              fontWeight: 700,
              fontSize: "var(--text-display)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              backgroundImage: "linear-gradient(120deg, #ffffff 0%, var(--color-lime) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl" style={{ color: "var(--foreground-muted)", fontSize: "var(--text-lead)" }}>
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <WhatsAppButton context={{ kind: "home" }} locale={locale} size="lg">
              {t("ctaPrimary")}
            </WhatsAppButton>
            <Button href="/portfolio" variant="secondary" size="lg">{t("ctaSecondary")}</Button>
          </div>
          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
            <li>{t("trust1")}</li><li aria-hidden>·</li>
            <li>{t("trust2")}</li><li aria-hidden>·</li>
            <li>{t("trust3")}</li><li aria-hidden>·</li>
            <li>{t("trust4")}</li>
          </ul>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px]">
          <Glow intensity="lg" className="absolute inset-0 rounded-2xl overflow-hidden border"
            style={{ background: "var(--card-background)", borderColor: "var(--color-lime)" }}>
            <Image
              src="/portfolio/hubfive/1.png"
              alt={t("dashboardAlt")}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Glow>
          <FloatCard className="absolute -top-4 -left-4 lg:-left-6 z-20" amplitude={8} duration={6}>
            <div className="rounded-xl px-4 py-3 border flex items-center gap-3"
              style={{ background: "var(--glass-background)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)" }}>
              <span aria-hidden style={{ fontSize: 28 }}>📈</span>
              <div className="text-left">
                <div className="text-xs opacity-70">{t("floatA1")}</div>
                <div className="font-bold" style={{ color: "var(--color-lime)" }}>{t("floatA2")}</div>
              </div>
            </div>
          </FloatCard>
          <FloatCard className="absolute -bottom-4 -right-4 lg:-right-6 z-20" amplitude={10} duration={7} delay={0.6}>
            <div className="rounded-xl px-4 py-3 border flex items-center gap-3"
              style={{ background: "var(--glass-background)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)" }}>
              <span aria-hidden style={{ fontSize: 28 }}>⚡</span>
              <div className="text-left">
                <div className="text-xs opacity-70">{t("floatB1")}</div>
                <div className="font-bold" style={{ color: "var(--color-lime)" }}>{t("floatB2")}</div>
              </div>
            </div>
          </FloatCard>
          <FloatCard className="absolute top-1/2 -right-6 -translate-y-1/2 z-20 hidden lg:block" amplitude={6} duration={8} delay={1.2}>
            <div className="rounded-xl px-4 py-3 border flex items-center gap-3"
              style={{ background: "var(--glass-background)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)" }}>
              <span aria-hidden style={{ fontSize: 28 }}>⚙️</span>
              <div className="text-left">
                <div className="text-xs opacity-70">{t("floatC1")}</div>
                <div className="font-bold" style={{ color: "var(--color-lime)" }}>{t("floatC2")}</div>
              </div>
            </div>
          </FloatCard>
        </div>
      </div>
      <style>{`@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </HeroBg>
  );
}
```

- [ ] **Step 2: `ClientMarquee.tsx`**

```tsx
import { Marquee } from "@/components/ui/Marquee";
import { useTranslations } from "next-intl";

const CLIENTS = ["Banco BHG", "HubFive", "KZ Serviços", "Transportadora Sabas", "Solumart Serviços", "Vérité Perícias"];

export function ClientMarquee() {
  const t = useTranslations("home.clientMarquee");
  return (
    <section className="py-10 border-y" style={{ borderColor: "var(--card-border)" }}>
      <p className="text-center text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("label")}</p>
      <Marquee speed={30}>
        {CLIENTS.map((c) => (
          <span
            key={c}
            className="text-2xl font-bold opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            style={{ fontFamily: "var(--font-title)" }}
          >
            {c}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
```

- [ ] **Step 3: `Testimonials.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TESTIMONIALS } from "@/data/testimonials";
import type { Locale } from "@/types";

type Props = { locale: Locale };

export function Testimonials({ locale }: Props) {
  const t = useTranslations("home.testimonials");
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl" style={{ color: "var(--foreground-muted)", fontSize: "var(--text-lead)" }}>
            {t("subtitle")}
          </p>
        </ScrollReveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((tst, i) => (
            <ScrollReveal key={tst.id} delay={i * 0.08}>
              <article className="h-full rounded-2xl p-6 border relative overflow-hidden"
                style={{ background: "var(--glass-background)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)" }}>
                <span aria-hidden style={{ position: "absolute", top: 12, left: 18, fontSize: 64, lineHeight: 1, color: "var(--color-lime)", opacity: 0.4 }}>“</span>
                <blockquote className="relative z-10 pt-6" style={{ color: "var(--foreground)", lineHeight: 1.6 }}>
                  {tst.quote[locale]}
                </blockquote>
                <footer className="mt-5 flex items-center gap-3">
                  <span aria-hidden className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold"
                    style={{ background: "var(--color-lime)", color: "var(--color-black)" }}>
                    {tst.avatarInitials}
                  </span>
                  <div>
                    <div className="font-semibold">{tst.author}</div>
                    <div className="text-xs opacity-70">{tst.role[locale]} · {tst.company}</div>
                  </div>
                </footer>
              </article>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `FeaturedPortfolio.tsx`**

```tsx
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { PORTFOLIO } from "@/data/portfolio";
import type { Locale } from "@/types";

type Props = { locale: Locale };

const TYPE_LABEL: Record<Locale, Record<string, string>> = {
  pt: { site: "Site", app: "App", "web-app": "Web App", software: "Software" },
  en: { site: "Site", app: "App", "web-app": "Web App", software: "Software" },
  es: { site: "Sitio", app: "App", "web-app": "Web App", software: "Software" },
};

export function FeaturedPortfolio({ locale }: Props) {
  const t = useTranslations("home.portfolio");
  const featured = PORTFOLIO.filter((p) => p.featuredOnHome);
  return (
    <section className="py-20 lg:py-32" id="featured-portfolio">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl" style={{ color: "var(--foreground-muted)", fontSize: "var(--text-lead)" }}>
            {t("subtitle")}
          </p>
        </ScrollReveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ScrollReveal key={p.slug} delay={i * 0.06}>
              <Link
                href={`/portfolio/${p.slug}`}
                className="group block rounded-2xl overflow-hidden border h-full transition-all hover:-translate-y-1"
                style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={p.cover} alt={p.title[locale]} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden />
                  <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "var(--color-lime)", color: "var(--color-black)" }}>
                    {TYPE_LABEL[locale][p.type]}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-xs opacity-70 mb-1">{p.client}</div>
                  <div className="font-semibold leading-snug" style={{ fontFamily: "var(--font-title)" }}>{p.title[locale]}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.stack.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-lime)", color: "var(--color-lime)" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </ul>
        <div className="mt-12 flex justify-center">
          <Button href="/portfolio" variant="secondary" size="lg">{t("seeAll")}</Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `RealStats.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StatCounter } from "@/components/ui/StatCounter";

export function RealStats() {
  const t = useTranslations("home.stats");
  return (
    <section
      className="py-20 lg:py-32 relative overflow-hidden"
      style={{
        background: "var(--gradient-dark)",
        backgroundImage: `radial-gradient(var(--dot-color) 1px, transparent 1px), var(--gradient-dark)`,
        backgroundSize: `var(--dot-spacing) var(--dot-spacing), 100% 100%`,
      }}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 className="text-center" style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>
            {t("title")}
          </h2>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCounter value={100} prefix="R$ " suffix="k+" label={t("savedLabel")} />
          <StatCounter value={300} suffix="+" label={t("projectsLabel")} />
          <StatCounter value={8} suffix={` ${t("yearsLabel")}`} label={t("yearsSubLabel")} />
          <StatCounter value={100} suffix="%" label={t("satisfactionLabel")} />
        </div>
        <ScrollReveal delay={0.2}>
          <p className="mt-12 text-center max-w-3xl mx-auto" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>
            {t("persuasion")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: `FeaturedProducts.tsx`**

```tsx
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { getFeaturedProducts } from "@/data/products";
import type { Locale } from "@/types";

type Props = { locale: Locale };

export function FeaturedProducts({ locale }: Props) {
  const t = useTranslations("home.products");
  const featured = getFeaturedProducts();
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl" style={{ color: "var(--foreground-muted)", fontSize: "var(--text-lead)" }}>
            {t("subtitle")}
          </p>
        </ScrollReveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((p, i) => {
            const isMid = i === 1;
            return (
              <ScrollReveal key={p.slugs[locale]} delay={i * 0.08}>
                <article
                  className="h-full rounded-2xl p-6 border flex flex-col gap-5 relative"
                  style={{
                    background: "var(--card-background)",
                    borderColor: isMid ? "var(--color-lime)" : "var(--card-border)",
                    boxShadow: isMid ? "var(--shadow-glow-lg)" : undefined,
                  }}
                >
                  {isMid && (
                    <span className="absolute -top-3 left-6 inline-flex px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "var(--color-lime)", color: "var(--color-black)" }}>
                      {t("popularBadge")}
                    </span>
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-70">{p.category.replace("-", " ")}</div>
                    <h3 className="mt-1 leading-tight" style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>
                      {p.name[locale]}
                    </h3>
                  </div>
                  <p style={{ color: "var(--foreground-muted)" }}>{p.shortDescription[locale]}</p>
                  <PriceTag setup={p.pricing.setup} monthly={p.pricing.monthly} purchase={p.pricing.purchase} deadline={p.pricing.deadline[locale]} locale={locale} />
                  <ul className="space-y-2 text-sm">
                    {p.includes[locale].slice(0, 4).map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <span aria-hidden style={{ color: "var(--color-lime)" }}>✓</span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-2">
                    <Button href={`/produtos/${p.slugs[locale]}`} variant={isMid ? "primary" : "secondary"} className="w-full">
                      {t("learnMore")}
                    </Button>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </ul>
        <div className="mt-12 flex justify-center">
          <Button href="/produtos" variant="secondary" size="lg">{t("seeAll")}</Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: `StackStrip.tsx`**

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HOME_STACK } from "@/data/stack";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Locale } from "@/types";

type Props = { locale: Locale };

export function StackStrip({ locale }: Props) {
  const t = useTranslations("home.stack");
  return (
    <section className="py-20 lg:py-28 border-y" style={{ borderColor: "var(--card-border)", background: "var(--background-secondary)" }}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <ScrollReveal>
          <p className="text-center max-w-3xl mx-auto" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>
            {t("title")}
          </p>
        </ScrollReveal>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {HOME_STACK.map((s) => (
            <li key={s.name} className="flex flex-col items-center gap-2">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-xl border"
                style={{ background: "var(--background)", borderColor: "var(--card-border)", boxShadow: "var(--shadow-glow)" }}>
                <Image src={s.iconPath} alt={s.name} width={40} height={40} />
              </span>
              <span className="text-xs font-semibold opacity-80">{s.name}</span>
              <span className="text-xs opacity-50 max-w-[140px] text-center">{s.blurb[locale]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: `FinalCTA.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Locale } from "@/types";

type Props = { locale: Locale };

export function FinalCTA({ locale }: Props) {
  const t = useTranslations("home.finalCta");
  return (
    <section
      className="py-20 lg:py-32 text-center relative overflow-hidden"
      style={{
        background: "var(--gradient-mesh), var(--background)",
        boxShadow: "inset 0 0 120px rgba(57,255,20,0.1)",
      }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          style={{
            fontFamily: "var(--font-title)",
            fontSize: "var(--text-h2)",
            fontWeight: 700,
            backgroundImage: "linear-gradient(120deg, #ffffff 0%, var(--color-lime) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {t("title")}
        </h2>
        <p className="mt-4" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>
          {t("subtitle")}
        </p>
        <div className="mt-8 inline-block">
          <WhatsAppButton context={{ kind: "home" }} locale={locale} size="lg">
            {t("cta")}
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Barrel `src/components/sections/home/index.ts`**

```ts
export { Hero } from "./Hero";
export { ClientMarquee } from "./ClientMarquee";
export { Testimonials } from "./Testimonials";
export { FeaturedPortfolio } from "./FeaturedPortfolio";
export { RealStats } from "./RealStats";
export { FeaturedProducts } from "./FeaturedProducts";
export { StackStrip } from "./StackStrip";
export { FinalCTA } from "./FinalCTA";
```

- [ ] **Step 10: Compose home page**

Replace `src/app/[locale]/page.tsx`:

```tsx
import {
  Hero, ClientMarquee, Testimonials, FeaturedPortfolio, RealStats, FeaturedProducts, StackStrip, FinalCTA,
} from "@/components/sections/home";
import type { Locale } from "@/types";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <Hero locale={locale as Locale} />
      <ClientMarquee />
      <Testimonials locale={locale as Locale} />
      <FeaturedPortfolio locale={locale as Locale} />
      <RealStats />
      <FeaturedProducts locale={locale as Locale} />
      <StackStrip locale={locale as Locale} />
      <FinalCTA locale={locale as Locale} />
    </>
  );
}
```

- [ ] **Step 11: Add home messages**

Append to each `messages/*.json`. PT version:

```json
"home": {
  "hero": {
    "eyebrow": "SOFTWARE · SITES · AUTOMAÇÕES",
    "title": "Tecnologia de impacto, em tempo recorde",
    "subtitle": "Sites em 72h. Apps e softwares que economizam 6 dígitos por ano para nossos clientes. Sem enrolação, sem orçamento de 30 dias.",
    "ctaPrimary": "Falar no WhatsApp",
    "ctaSecondary": "Ver portfólio",
    "trust1": "300+ projetos",
    "trust2": "8 anos",
    "trust3": "100% satisfação",
    "trust4": "R$100k+/ano economizados",
    "dashboardAlt": "Mockup de dashboard de software de gestão",
    "floatA1": "Economia anual",
    "floatA2": "+R$ 100k/ano",
    "floatB1": "Prazo",
    "floatB2": "72 horas",
    "floatC1": "Operação",
    "floatC2": "Automação 24/7"
  },
  "clientMarquee": { "label": "Quem confia na BlackElephant" },
  "testimonials": {
    "title": "O que dizem quem já contratou",
    "subtitle": "Não somos a gente falando bem da gente. É quem entrega resultado com a gente."
  },
  "portfolio": {
    "title": "Projetos em destaque",
    "subtitle": "Quatro casos que provam o que a gente entrega — software de gestão, app de cliente, e site institucional.",
    "seeAll": "Ver todos os projetos"
  },
  "stats": {
    "title": "Números que importam",
    "savedLabel": "economizados/ano por cliente",
    "projectsLabel": "projetos entregues",
    "yearsLabel": "anos",
    "yearsSubLabel": "de mercado",
    "satisfactionLabel": "satisfação",
    "persuasion": "Não somos só um número. Somos o time por trás dos números dos nossos clientes."
  },
  "products": {
    "title": "Produtos com preço claro",
    "subtitle": "Da landing page de R$ 798 ao software de gestão de R$ 50k. Você decide o tamanho do passo, a gente entrega.",
    "popularBadge": "MAIS ESCOLHIDO",
    "learnMore": "Saber mais",
    "seeAll": "Ver todos os produtos"
  },
  "stack": {
    "title": "Tecnologias que escolhemos por velocidade, segurança e escala."
  },
  "finalCta": {
    "title": "Pronto pra acelerar?",
    "subtitle": "Conversa direta no WhatsApp. Sem formulário. Sem espera de orçamento.",
    "cta": "Falar no WhatsApp agora"
  }
}
```

EN version (translate each PT key idiomatically):

```json
"home": {
  "hero": {
    "eyebrow": "SOFTWARE · SITES · AUTOMATION",
    "title": "High-impact technology, delivered in record time",
    "subtitle": "Websites in 72h. Apps and software that save our clients six figures a year. No fluff, no 30-day quotes.",
    "ctaPrimary": "Chat on WhatsApp",
    "ctaSecondary": "See portfolio",
    "trust1": "300+ projects",
    "trust2": "8 years",
    "trust3": "100% satisfaction",
    "trust4": "R$100k+/yr client savings",
    "dashboardAlt": "Management software dashboard mockup",
    "floatA1": "Annual savings",
    "floatA2": "+R$ 100k/yr",
    "floatB1": "Deadline",
    "floatB2": "72 hours",
    "floatC1": "Operation",
    "floatC2": "Automation 24/7"
  },
  "clientMarquee": { "label": "Who trusts BlackElephant" },
  "testimonials": {
    "title": "What clients say",
    "subtitle": "It's not us bragging — it's who ships results with us."
  },
  "portfolio": {
    "title": "Featured projects",
    "subtitle": "Four cases that prove what we deliver — management software, client app, and institutional site.",
    "seeAll": "See all projects"
  },
  "stats": {
    "title": "Numbers that matter",
    "savedLabel": "saved/year per client",
    "projectsLabel": "delivered projects",
    "yearsLabel": "years",
    "yearsSubLabel": "in business",
    "satisfactionLabel": "satisfaction",
    "persuasion": "We're not just a number. We're the team behind our clients' numbers."
  },
  "products": {
    "title": "Products with transparent pricing",
    "subtitle": "From R$ 798 landing pages to R$ 50k management software. You set the step, we ship.",
    "popularBadge": "MOST CHOSEN",
    "learnMore": "Learn more",
    "seeAll": "See all products"
  },
  "stack": { "title": "Tech we picked for speed, security and scale." },
  "finalCta": {
    "title": "Ready to accelerate?",
    "subtitle": "Direct chat on WhatsApp. No form. No waiting for a quote.",
    "cta": "Chat on WhatsApp now"
  }
}
```

ES version (translate each PT key idiomatically — analogous shape).

- [ ] **Step 12: Run dev**

Run: `npm run dev`. Visit `/`. Validate visually:
- Hero renders with title, subtitle, 2 CTAs, trust line, dashboard image, 3 floating cards.
- Client marquee scrolls.
- Testimonials grid renders 3 cards.
- Featured portfolio shows 4 cards (BHG software, KZ App Cliente, HubFive software, Vérité site).
- Real stats animate counters.
- Featured products shows 3 cards with middle highlighted.
- Stack strip shows 4 logos.
- Final CTA renders with WhatsApp button.

Visit `/en` and `/es` — content translates.

Stop server.

- [ ] **Step 13: Commit**

```bash
git add src/components/sections/home src/app/[locale]/page.tsx src/i18n/messages
git commit -m "feat(home): all 8 sections + composition + i18n keys"
```

---

## Phase 6 — Quem somos (`/quem-somos`)

### Task 30: Quem somos page (single task with all sections)

**Files:**
- Create: `src/app/[locale]/quem-somos/page.tsx`
- Create: `src/components/sections/about/Origin.tsx`
- Create: `src/components/sections/about/Manifesto.tsx`
- Create: `src/components/sections/about/TurningPoint.tsx`
- Create: `src/components/sections/about/TeamOrbit.tsx`
- Create: `src/components/sections/about/Vision.tsx`
- Create: `src/components/sections/about/index.ts`

- [ ] **Step 1: `Origin.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Origin() {
  const t = useTranslations("about.origin");
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
        <ScrollReveal>
          <div
            aria-hidden
            className="aspect-[4/3] rounded-2xl border relative overflow-hidden"
            style={{
              background: "var(--gradient-mesh), var(--background-secondary)",
              borderColor: "var(--card-border)",
            }}
          >
            <span style={{
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              fontSize: "6rem", color: "var(--color-lime)", opacity: 0.6, textShadow: "var(--neon-glow)",
            }}>🍕→💻</span>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("title")}</h2>
          <p className="mt-5 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{t("p1")}</p>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{t("p2")}</p>
          <p className="mt-4 leading-relaxed font-semibold">{t("p3")}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `Manifesto.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const ICONS = ["⚡", "💎", "🎯", "🚪"];

export function Manifesto() {
  const t = useTranslations("about.manifesto");
  const cards = [0, 1, 2, 3].map((i) => ({
    icon: ICONS[i],
    title: t(`cards.${i}.title`),
    desc: t(`cards.${i}.desc`),
  }));
  return (
    <section className="py-20 lg:py-32 border-y" style={{ borderColor: "var(--card-border)", background: "var(--background-secondary)" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, textAlign: "center" }}>{t("title")}</h2>
          <p className="mt-3 text-center max-w-2xl mx-auto" style={{ color: "var(--foreground-muted)" }}>{t("subtitle")}</p>
        </ScrollReveal>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <article className="h-full rounded-2xl p-6 border" style={{ background: "var(--glass-background)", backdropFilter: "blur(12px)", borderColor: "var(--glass-border)" }}>
                <div aria-hidden style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
                <h3 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-xl)", fontWeight: 700 }}>{c.title}</h3>
                <p className="mt-3 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{c.desc}</p>
              </article>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `TurningPoint.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Glow } from "@/components/ui/Glow";

export function TurningPoint() {
  const t = useTranslations("about.turningPoint");
  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-[900px] px-6 lg:px-12">
        <ScrollReveal>
          <Glow intensity="lg" className="rounded-2xl p-10 border text-center"
            style={{ background: "var(--card-background)", borderColor: "var(--color-lime)" }}>
            <div className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--color-lime)" }}>{t("eyebrow")}</div>
            <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("title")}</h2>
            <p className="mt-6 leading-relaxed text-lg max-w-2xl mx-auto" style={{ color: "var(--foreground-muted)" }}>
              {t("body")}
              {/* TODO: confirmar ano do contrato BHG */}
            </p>
          </Glow>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `TeamOrbit.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function TeamOrbit() {
  const t = useTranslations("about.team");
  const core = ["design", "code", "marketing"] as const;
  const partners = ["legal", "accounting", "finance", "hr", "admin"] as const;
  return (
    <section className="py-20 lg:py-32 border-y" style={{ borderColor: "var(--card-border)", background: "var(--background-secondary)" }}>
      <div className="mx-auto max-w-[1100px] px-6 lg:px-12 text-center">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("title")}</h2>
          <p className="mt-4 max-w-2xl mx-auto" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("subtitle")}</p>
        </ScrollReveal>
        <div className="mt-14 grid md:grid-cols-2 gap-8 text-left">
          <ScrollReveal>
            <div className="rounded-2xl p-6 border h-full" style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
              <div className="text-xs uppercase tracking-wider opacity-70 mb-3">{t("coreLabel")}</div>
              <ul className="grid grid-cols-3 gap-3">
                {core.map((k) => (
                  <li key={k} className="rounded-md py-3 text-center text-sm font-semibold border"
                    style={{ borderColor: "var(--color-lime)", color: "var(--color-lime)", boxShadow: "var(--shadow-glow)" }}>
                    {t(`core.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl p-6 border h-full" style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
              <div className="text-xs uppercase tracking-wider opacity-70 mb-3">{t("partnersLabel")}</div>
              <ul className="flex flex-wrap gap-2">
                {partners.map((k) => (
                  <li key={k} className="rounded-full px-3 py-1.5 text-sm border" style={{ borderColor: "var(--card-border)" }}>
                    {t(`partners.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.2}>
          <p className="mt-10 max-w-2xl mx-auto font-semibold" style={{ fontSize: "var(--text-lead)" }}>{t("punchline")}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `Vision.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types";

type Props = { locale: Locale };

export function Vision({ locale }: Props) {
  const t = useTranslations("about.vision");
  return (
    <section className="py-20 lg:py-32 text-center" style={{ background: "var(--gradient-mesh)" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{
            fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700,
            backgroundImage: "linear-gradient(120deg, #ffffff 0%, var(--color-lime) 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>
            {t("title")}
          </h2>
          <p className="mt-6 leading-relaxed" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("body1")}</p>
          <p className="mt-4 leading-relaxed" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("body2")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <WhatsAppButton context={{ kind: "generic" }} locale={locale} size="lg">{t("ctaPrimary")}</WhatsAppButton>
            <Button href="/portfolio" variant="secondary" size="lg">{t("ctaSecondary")}</Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Barrel + page composition**

`src/components/sections/about/index.ts`:

```ts
export { Origin } from "./Origin";
export { Manifesto } from "./Manifesto";
export { TurningPoint } from "./TurningPoint";
export { TeamOrbit } from "./TeamOrbit";
export { Vision } from "./Vision";
```

`src/app/[locale]/quem-somos/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Origin, Manifesto, TurningPoint, TeamOrbit, Vision } from "@/components/sections/about";
import { makeMetadata } from "@/lib/metadata";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.metadata" });
  return makeMetadata({
    title: t("title"),
    description: t("description"),
    path: locale === "pt" ? "/quem-somos" : `/${locale}/quem-somos`,
    locale: locale as Locale,
    alternatePaths: { pt: "/quem-somos", en: "/en/quem-somos", es: "/es/quem-somos" },
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.hero" });
  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 text-center" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <div className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--color-lime)" }}>{t("eyebrow")}</div>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-display)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {t("title")}
            </h1>
            <p className="mt-6" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("subtitle")}</p>
          </ScrollReveal>
        </div>
      </section>
      <Origin />
      <Manifesto />
      <TurningPoint />
      <TeamOrbit />
      <Vision locale={locale as Locale} />
    </>
  );
}
```

- [ ] **Step 7: Add i18n keys**

Append to PT messages:

```json
"about": {
  "metadata": {
    "title": "Quem somos · BlackElephant",
    "description": "Por que existimos, no que acreditamos e onde queremos chegar. Conheça o time por trás dos números dos nossos clientes."
  },
  "hero": {
    "eyebrow": "QUEM SOMOS",
    "title": "A gente existe pra fazer uma coisa: democratizar tecnologia de verdade no Brasil.",
    "subtitle": "O sonho é grande. Ser a maior empresa de tecnologia do país. E a gente já está construindo isso desde 2017."
  },
  "origin": {
    "title": "2017. Um software de pizzaria.",
    "p1": "A BlackElephant nasceu de um convite. Um cliente queria automatizar a operação da pizzaria dele e procurou nosso fundador.",
    "p2": "No meio do projeto, ficou claro que aquele tipo de software de qualidade — feito sob medida, rápido, bonito — estava reservado pra quem podia pagar caro. Empresas pequenas e médias ficavam de fora.",
    "p3": "Naquele momento, nasceu a Black: pra mudar isso."
  },
  "manifesto": {
    "title": "No que a gente acredita",
    "subtitle": "Quatro crenças que separam a Black da maioria das softhouses.",
    "cards": {
      "0": { "title": "Velocidade não é inimiga da qualidade", "desc": "Site em 72h não é milagre, é processo certo + time experiente." },
      "1": { "title": "Preço justo é estratégia, não desconto", "desc": "Tecnologia de impacto deveria ser acessível. Ponto." },
      "2": { "title": "Software só importa se gera resultado", "desc": "Um cliente nosso economiza R$100k/ano com automações nossas. Esse é o KPI." },
      "3": { "title": "Não atendemos todo mundo", "desc": "Não trabalhamos com empresas com mais de 100 colaboradores. Isso permite a gente entregar do jeito que entrega." }
    }
  },
  "turningPoint": {
    "eyebrow": "DIVISOR DE ÁGUAS",
    "title": "O contrato que mudou tudo: Banco BHG.",
    "body": "O Banco BHG nos contratou pra desenvolver o software de gestão completo da operação. Era o maior projeto que a Black tinha encarado. A gente entregou. Desde então, ficou claro: não tem teto pro tipo de coisa que a gente faz."
  },
  "team": {
    "title": "Quem está do seu lado",
    "subtitle": "Você não contrata 'um dev'. Você contrata um sistema de operação completo.",
    "coreLabel": "Núcleo BlackElephant",
    "partnersLabel": "Parceiros estratégicos",
    "core": { "design": "Design", "code": "Programação", "marketing": "Marketing" },
    "partners": { "legal": "Jurídico", "accounting": "Contábil", "finance": "Financeiro", "hr": "RH", "admin": "Administrativo" },
    "punchline": "Multidisciplinar de propósito. Pra entregar produto inteiro, não pedaço."
  },
  "vision": {
    "title": "A meta declarada: ser a maior empresa de tecnologia do Brasil.",
    "body1": "Pretensioso? Talvez. Mas o caminho é claro: entregar produtos digitais de alto impacto, com qualidade superior, preço acessível, em tempo recorde — pra todo mundo que precisa.",
    "body2": "Cada cliente que entra agora faz parte dessa história.",
    "ctaPrimary": "Conversar no WhatsApp",
    "ctaSecondary": "Ver portfólio"
  }
}
```

EN/ES versions: translate each key idiomatically (analogous shape). The agent must produce all 3 locales — never leave EN/ES blank.

- [ ] **Step 8: Run dev**

Run: `npm run dev`. Visit `/quem-somos`. Check all 5 sections render with proper i18n. Stop server.

- [ ] **Step 9: Commit**

```bash
git add src/app/[locale]/quem-somos src/components/sections/about src/i18n/messages
git commit -m "feat(about): /quem-somos with origin, manifesto, turning point, team, vision"
```

---

## Phase 7 — Portfolio (list + detail)

### Task 31: Portfolio list page `/portfolio`

**Files:**
- Create: `src/app/[locale]/portfolio/page.tsx`
- Create: `src/components/sections/portfolio/PortfolioGrid.tsx`
- Create: `src/components/sections/portfolio/PortfolioCard.tsx`
- Create: `src/components/sections/portfolio/PortfolioFilters.tsx`
- Create: `src/components/sections/portfolio/index.ts`

- [ ] **Step 1: `PortfolioCard.tsx`**

```tsx
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { PortfolioItem, Locale } from "@/types";

const TYPE_LABEL: Record<Locale, Record<PortfolioItem["type"], string>> = {
  pt: { site: "Site", app: "App", "web-app": "Web App", software: "Software" },
  en: { site: "Site", app: "App", "web-app": "Web App", software: "Software" },
  es: { site: "Sitio", app: "App", "web-app": "Web App", software: "Software" },
};

type Props = { item: PortfolioItem; locale: Locale };

export function PortfolioCard({ item, locale }: Props) {
  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group block rounded-2xl overflow-hidden border h-full transition-all hover:-translate-y-1"
      style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={item.cover} alt={item.title[locale]} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: "var(--color-lime)", color: "var(--color-black)" }}>
          {TYPE_LABEL[locale][item.type]}
        </span>
      </div>
      <div className="p-5">
        <div className="text-xs opacity-70 mb-1">{item.client}</div>
        <div className="font-semibold leading-snug" style={{ fontFamily: "var(--font-title)" }}>{item.title[locale]}</div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {item.stack.slice(0, 4).map((s) => (
            <li key={s} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-lime)", color: "var(--color-lime)" }}>{s}</li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: `PortfolioFilters.tsx`** (client component, local state)

```tsx
"use client";
import { useState, useMemo } from "react";
import type { PortfolioItem, Locale, DeliverableType, StackName } from "@/types";
import { PortfolioCard } from "./PortfolioCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Props = { items: PortfolioItem[]; locale: Locale; allLabel: string; typeLabels: Record<DeliverableType, string>; clearLabel: string; emptyLabel: string; };

const STACK_OPTIONS: StackName[] = ["Next.js", "Supabase", "n8n", "React Native", "Bubble", "Make"];

export function PortfolioFilters({ items, locale, allLabel, typeLabels, clearLabel, emptyLabel }: Props) {
  const [type, setType] = useState<DeliverableType | "all">("all");
  const [stack, setStack] = useState<StackName | "all">("all");

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (stack !== "all" && !p.stack.includes(stack)) return false;
      return true;
    });
  }, [items, type, stack]);

  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all border"
      style={active ? { background: "var(--color-lime)", color: "var(--color-black)", borderColor: "var(--color-lime)" } : { borderColor: "var(--card-border)" }}>
      {children}
    </button>
  );

  return (
    <>
      <div className="sticky top-16 z-30 -mx-6 lg:-mx-12 px-6 lg:px-12 py-4 backdrop-blur-md"
        style={{ background: "rgba(10,10,10,0.7)", borderBottom: "1px solid var(--card-border)" }}>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-wider opacity-70 mr-2">Tipo</span>
          <Chip active={type === "all"} onClick={() => setType("all")}>{allLabel}</Chip>
          {(["site","app","web-app","software"] as DeliverableType[]).map((tp) => (
            <Chip key={tp} active={type === tp} onClick={() => setType(tp)}>{typeLabels[tp]}</Chip>
          ))}
          <span className="text-xs uppercase tracking-wider opacity-70 ml-4 mr-2">Stack</span>
          <Chip active={stack === "all"} onClick={() => setStack("all")}>{allLabel}</Chip>
          {STACK_OPTIONS.map((s) => (
            <Chip key={s} active={stack === s} onClick={() => setStack(s)}>{s}</Chip>
          ))}
          {(type !== "all" || stack !== "all") && (
            <button onClick={() => { setType("all"); setStack("all"); }} className="ml-auto text-xs underline opacity-70 hover:opacity-100">
              {clearLabel}
            </button>
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-12 text-center opacity-70">{emptyLabel}</p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it, i) => (
            <ScrollReveal key={it.slug} delay={Math.min(i, 6) * 0.05}>
              <PortfolioCard item={it} locale={locale} />
            </ScrollReveal>
          ))}
        </ul>
      )}
    </>
  );
}
```

- [ ] **Step 3: `PortfolioGrid.tsx`** wraps the filters component for server use

```tsx
import { PORTFOLIO } from "@/data/portfolio";
import { PortfolioFilters } from "./PortfolioFilters";
import type { Locale, DeliverableType } from "@/types";

const LABELS: Record<Locale, { all: string; clear: string; empty: string; types: Record<DeliverableType, string> }> = {
  pt: { all: "Todos", clear: "Limpar filtros", empty: "Nenhum projeto encontrado nesses filtros.", types: { site: "Sites", app: "Apps", "web-app": "Web Apps", software: "Softwares" } },
  en: { all: "All", clear: "Clear filters", empty: "No projects match these filters.", types: { site: "Sites", app: "Apps", "web-app": "Web Apps", software: "Software" } },
  es: { all: "Todos", clear: "Limpiar filtros", empty: "Ningún proyecto coincide con estos filtros.", types: { site: "Sitios", app: "Apps", "web-app": "Web Apps", software: "Software" } },
};

export function PortfolioGrid({ locale }: { locale: Locale }) {
  const lab = LABELS[locale];
  return (
    <PortfolioFilters items={PORTFOLIO} locale={locale} allLabel={lab.all} typeLabels={lab.types} clearLabel={lab.clear} emptyLabel={lab.empty} />
  );
}
```

- [ ] **Step 4: `index.ts`**

```ts
export { PortfolioCard } from "./PortfolioCard";
export { PortfolioFilters } from "./PortfolioFilters";
export { PortfolioGrid } from "./PortfolioGrid";
```

- [ ] **Step 5: Page**

```tsx
// src/app/[locale]/portfolio/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PortfolioGrid } from "@/components/sections/portfolio";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { makeMetadata } from "@/lib/metadata";
import type { Locale } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio.metadata" });
  return makeMetadata({
    title: t("title"),
    description: t("description"),
    path: locale === "pt" ? "/portfolio" : `/${locale}/portfolio`,
    locale: locale as Locale,
    alternatePaths: { pt: "/portfolio", en: "/en/portfolio", es: "/es/portfolio" },
  });
}

export default async function PortfolioListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio.list" });
  return (
    <>
      <section className="pt-32 pb-8 lg:pt-40" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <ScrollReveal>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-display)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{t("title")}</h1>
            <p className="mt-4 max-w-2xl" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("subtitle")}</p>
          </ScrollReveal>
        </div>
      </section>
      <section className="pb-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <PortfolioGrid locale={locale as Locale} />
        </div>
      </section>
      <section className="py-16 text-center" style={{ background: "var(--background-secondary)" }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{t("ctaTitle")}</h2>
          <p className="mt-3" style={{ color: "var(--foreground-muted)" }}>{t("ctaSubtitle")}</p>
          <div className="mt-6 inline-block">
            <WhatsAppButton context={{ kind: "generic" }} locale={locale as Locale} size="lg">{t("cta")}</WhatsAppButton>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Add `portfolio` i18n keys**

Append to PT messages:

```json
"portfolio": {
  "metadata": {
    "title": "Portfólio · BlackElephant",
    "description": "12 entregas, 6 clientes. Cada caso virou método. Veja o que a BlackElephant entregou — sites, apps, web apps e software de gestão."
  },
  "list": {
    "title": "Projetos que entregamos",
    "subtitle": "12 entregas. 6 clientes. Cada um virou case porque o resultado virou método.",
    "ctaTitle": "Tem um projeto na cabeça?",
    "ctaSubtitle": "A gente botou casos como esses pra rodar. O seu pode ser o próximo.",
    "cta": "Falar no WhatsApp"
  }
}
```

EN/ES analogous.

- [ ] **Step 7: Run dev + commit**

Run dev, visit `/portfolio` — confirm 12 cards render, filters work, type/stack filters narrow results. Stop server.

```bash
git add src/app/[locale]/portfolio/page.tsx src/components/sections/portfolio src/i18n/messages
git commit -m "feat(portfolio): list page with type/stack filters and 12 cards"
```

---

### Task 32: Portfolio detail page `/portfolio/[slug]`

**Files:**
- Create: `src/app/[locale]/portfolio/[slug]/page.tsx`
- Create: `src/components/sections/portfolio/PortfolioDetail.tsx`
- Create: `src/components/sections/portfolio/RelatedProjects.tsx`
- Create: `src/components/sections/portfolio/ClientOtherWork.tsx`

- [ ] **Step 1: `PortfolioDetail.tsx`**

```tsx
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Glow } from "@/components/ui/Glow";
import { Lightbox } from "@/components/ui/Lightbox";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { PortfolioItem, Locale } from "@/types";

type Props = {
  item: PortfolioItem;
  locale: Locale;
  labels: { breadcrumbHome: string; breadcrumbList: string; visit: string; whatsapp: string; metaClient: string; metaType: string; metaStack: string; metaUrl: string; whatDelivered: string };
};

export function PortfolioDetail({ item, locale, labels }: Props) {
  return (
    <article className="pb-20">
      <section className="pt-32 pb-10 lg:pt-40" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <nav className="text-xs opacity-70 mb-4" aria-label="Breadcrumb">
            <Link href="/">{labels.breadcrumbHome}</Link> / <Link href="/portfolio">{labels.breadcrumbList}</Link> / <span>{item.client}</span>
          </nav>
          <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-lime)" }}>{item.client}</div>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-display)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{item.title[locale]}</h1>
          <ul className="mt-5 flex flex-wrap gap-2">
            {item.stack.map((s) => (
              <li key={s} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "var(--color-lime)", color: "var(--color-lime)", boxShadow: "var(--shadow-glow)" }}>{s}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={item.liveUrl} external variant="primary" size="lg">{labels.visit} ↗</Button>
            <WhatsAppButton
              context={{ kind: "portfolio", client: item.client, deliverable: item.title[locale] }}
              locale={locale}
              variant="secondary"
              size="lg"
            >
              {labels.whatsapp}
            </WhatsAppButton>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <Glow intensity="lg" className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--color-lime)" }}>
            <div className="relative aspect-[16/10]">
              <Image src={item.cover} alt={item.title[locale]} fill priority sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover" />
            </div>
          </Glow>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12 grid lg:grid-cols-3 gap-10">
          <aside className="rounded-2xl p-6 border h-fit" style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider opacity-70">{labels.metaClient}</dt>
                <dd className="mt-1 font-semibold">{item.client}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider opacity-70">{labels.metaType}</dt>
                <dd className="mt-1 font-semibold capitalize">{item.type.replace("-", " ")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider opacity-70">{labels.metaStack}</dt>
                <dd className="mt-1 font-semibold">{item.stack.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider opacity-70">{labels.metaUrl}</dt>
                <dd className="mt-1">
                  <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color: "var(--color-lime)" }}>
                    {item.liveUrl}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
          <div className="lg:col-span-2">
            <p className="leading-relaxed text-lg" style={{ color: "var(--foreground)" }}>{item.description[locale]}</p>
            <h2 className="mt-10" style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{labels.whatDelivered}</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2">
              {item.deliverables[locale].map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span aria-hidden style={{ color: "var(--color-lime)" }}>✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <Lightbox images={item.gallery} alt={item.title[locale]} />
        </div>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: `RelatedProjects.tsx`** + `ClientOtherWork.tsx`

```tsx
// RelatedProjects.tsx
import { PortfolioCard } from "./PortfolioCard";
import type { PortfolioItem, Locale } from "@/types";

type Props = { items: PortfolioItem[]; locale: Locale; title: string };

export function RelatedProjects({ items, locale, title }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="py-16 border-t" style={{ borderColor: "var(--card-border)" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{title}</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {items.map((it) => <li key={it.slug}><PortfolioCard item={it} locale={locale} /></li>)}
        </ul>
      </div>
    </section>
  );
}
```

```tsx
// ClientOtherWork.tsx
import { PortfolioCard } from "./PortfolioCard";
import type { PortfolioItem, Locale } from "@/types";

type Props = { items: PortfolioItem[]; locale: Locale; title: string };

export function ClientOtherWork({ items, locale, title }: Props) {
  if (items.length === 0) return null;
  return (
    <section className="py-12">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{title}</h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {items.map((it) => <li key={it.slug}><PortfolioCard item={it} locale={locale} /></li>)}
        </ul>
      </div>
    </section>
  );
}
```

Update barrel:

```ts
export { PortfolioDetail } from "./PortfolioDetail";
export { RelatedProjects } from "./RelatedProjects";
export { ClientOtherWork } from "./ClientOtherWork";
```

- [ ] **Step 3: Detail page**

```tsx
// src/app/[locale]/portfolio/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  PortfolioDetail,
  RelatedProjects,
  ClientOtherWork,
} from "@/components/sections/portfolio";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getPortfolioBySlug, getOtherDeliverablesForClient, getRelatedPortfolio, PORTFOLIO } from "@/data/portfolio";
import { breadcrumbSchema, creativeWorkSchema, SITE } from "@/lib/schema";
import { makeMetadata } from "@/lib/metadata";
import type { Locale } from "@/types";

export async function generateStaticParams() {
  return PORTFOLIO.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) return {};
  const path = locale === "pt" ? `/portfolio/${slug}` : `/${locale}/portfolio/${slug}`;
  return makeMetadata({
    title: `${item.client} — ${item.title[locale as Locale]}`,
    description: item.description[locale as Locale].slice(0, 155),
    path,
    locale: locale as Locale,
    image: `${SITE.url}${item.cover}`,
    alternatePaths: { pt: `/portfolio/${slug}`, en: `/en/portfolio/${slug}`, es: `/es/portfolio/${slug}` },
  });
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const item = getPortfolioBySlug(slug);
  if (!item) notFound();
  const t = await getTranslations({ locale, namespace: "portfolio.detail" });
  const lab = {
    breadcrumbHome: t("breadcrumbHome"),
    breadcrumbList: t("breadcrumbList"),
    visit: t("visit"),
    whatsapp: t("whatsapp"),
    metaClient: t("metaClient"),
    metaType: t("metaType"),
    metaStack: t("metaStack"),
    metaUrl: t("metaUrl"),
    whatDelivered: t("whatDelivered"),
  };
  const others = getOtherDeliverablesForClient(item.clientSlug, item.slug);
  const related = getRelatedPortfolio(item.slug, 3);
  const breadcrumbs = breadcrumbSchema([
    { name: t("breadcrumbHome"), url: SITE.url },
    { name: t("breadcrumbList"), url: `${SITE.url}/portfolio` },
    { name: item.client, url: `${SITE.url}/portfolio/${slug}` },
  ]);
  const creative = creativeWorkSchema({
    name: `${item.client} — ${item.title[locale as Locale]}`,
    description: item.description[locale as Locale],
    url: `${SITE.url}/portfolio/${slug}`,
    image: `${SITE.url}${item.cover}`,
  });
  return (
    <>
      <PortfolioDetail item={item} locale={locale as Locale} labels={lab} />
      <ClientOtherWork items={others} locale={locale as Locale} title={t("clientOtherTitle", { client: item.client })} />
      <RelatedProjects items={related} locale={locale as Locale} title={t("relatedTitle")} />
      <section className="py-16 text-center" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{t("ctaTitle")}</h2>
          <p className="mt-3" style={{ color: "var(--foreground-muted)" }}>{t("ctaSubtitle")}</p>
          <div className="mt-6 inline-block">
            <WhatsAppButton context={{ kind: "portfolio", client: item.client, deliverable: item.title[locale as Locale] }} locale={locale as Locale} size="lg">
              {t("cta")}
            </WhatsAppButton>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creative) }} />
    </>
  );
}
```

- [ ] **Step 4: Add `portfolio.detail` i18n**

Append to PT:

```json
"portfolio": {
  "detail": {
    "breadcrumbHome": "Início",
    "breadcrumbList": "Portfólio",
    "visit": "Visitar projeto",
    "whatsapp": "Falar no WhatsApp",
    "metaClient": "Cliente",
    "metaType": "Tipo",
    "metaStack": "Stack",
    "metaUrl": "URL",
    "whatDelivered": "O que entregamos",
    "clientOtherTitle": "Outras entregas para {client}",
    "relatedTitle": "Outros projetos relacionados",
    "ctaTitle": "Quer um projeto desse nível?",
    "ctaSubtitle": "Conversa direta no WhatsApp pra entender se faz sentido.",
    "cta": "Falar no WhatsApp"
  }
}
```

(Merge into existing `portfolio` block; don't replace `portfolio.list` and `portfolio.metadata`.) EN/ES analogous, with `{client}` placeholder kept literal.

- [ ] **Step 5: Run dev + commit**

Run dev, visit `/portfolio/banco-bhg-software-de-gestao` and another. Confirm hero, gallery, related cards. Stop server.

```bash
git add src/app/[locale]/portfolio src/components/sections/portfolio src/i18n/messages
git commit -m "feat(portfolio): detail page with hero, gallery, related, JSON-LD"
```

---

## Phase 8 — Products (list + detail)

### Task 33: Products list page `/produtos`

**Files:**
- Create: `src/app/[locale]/produtos/page.tsx`
- Create: `src/components/sections/products/ProductCard.tsx`
- Create: `src/components/sections/products/ProductFilters.tsx`
- Create: `src/components/sections/products/ProductComparison.tsx`
- Create: `src/components/sections/products/index.ts`

- [ ] **Step 1: `ProductCard.tsx`**

```tsx
import { Link } from "@/i18n/navigation";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import type { Product, Locale } from "@/types";

type Props = { product: Product; locale: Locale; learnMoreLabel: string };

export function ProductCard({ product, locale, learnMoreLabel }: Props) {
  return (
    <article className="h-full rounded-2xl p-6 border flex flex-col gap-4"
      style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
      <div>
        <div className="text-xs uppercase tracking-wider opacity-70">{product.category.replace("-", " ")}</div>
        <h3 className="mt-1 leading-tight" style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>
          {product.name[locale]}
        </h3>
      </div>
      <p style={{ color: "var(--foreground-muted)" }}>{product.shortDescription[locale]}</p>
      <PriceTag setup={product.pricing.setup} monthly={product.pricing.monthly} purchase={product.pricing.purchase} deadline={product.pricing.deadline[locale]} locale={locale} />
      <ul className="space-y-2 text-sm">
        {product.includes[locale].slice(0, 3).map((x) => (
          <li key={x} className="flex items-start gap-2"><span aria-hidden style={{ color: "var(--color-lime)" }}>✓</span><span>{x}</span></li>
        ))}
      </ul>
      <div className="mt-auto">
        <Button href={`/produtos/${product.slugs[locale]}`} variant="secondary" className="w-full">
          {learnMoreLabel}
        </Button>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: `ProductFilters.tsx`** (client local state)

```tsx
"use client";
import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import type { Product, Locale, ProductCategory } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Props = { products: Product[]; locale: Locale; allLabel: string; categoryLabels: Record<ProductCategory, string>; learnMoreLabel: string; };

const ALL_CATS: ProductCategory[] = ["sites", "landing-pages", "apps-e-sistemas", "operacao-digital"];

export function ProductFilters({ products, locale, allLabel, categoryLabels, learnMoreLabel }: Props) {
  const [cat, setCat] = useState<ProductCategory | "all">("all");
  const filtered = useMemo(() => cat === "all" ? products : products.filter((p) => p.category === cat), [cat, products]);
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        <button onClick={() => setCat("all")} className="px-3 py-1.5 rounded-full text-sm font-semibold border"
          style={cat === "all" ? { background: "var(--color-lime)", color: "var(--color-black)", borderColor: "var(--color-lime)" } : { borderColor: "var(--card-border)" }}>
          {allLabel}
        </button>
        {ALL_CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-full text-sm font-semibold border"
            style={cat === c ? { background: "var(--color-lime)", color: "var(--color-black)", borderColor: "var(--color-lime)" } : { borderColor: "var(--card-border)" }}>
            {categoryLabels[c]}
          </button>
        ))}
      </div>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <ScrollReveal key={p.slugs[locale]} delay={Math.min(i, 6) * 0.05}>
            <ProductCard product={p} locale={locale} learnMoreLabel={learnMoreLabel} />
          </ScrollReveal>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 3: `ProductComparison.tsx`**

```tsx
import { PRODUCTS } from "@/data/products";
import type { Locale } from "@/types";

const fmt = (n?: number) => (n == null ? "—" : `R$ ${new Intl.NumberFormat("pt-BR").format(n)}`);

type Props = {
  locale: Locale;
  labels: { product: string; setup: string; monthly: string; purchase: string; deadline: string; };
};

export function ProductComparison({ locale, labels }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--card-border)", background: "var(--card-background)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--background-tertiary)" }}>
            <th className="text-left p-4 font-semibold">{labels.product}</th>
            <th className="text-left p-4 font-semibold">{labels.setup}</th>
            <th className="text-left p-4 font-semibold">{labels.monthly}</th>
            <th className="text-left p-4 font-semibold">{labels.purchase}</th>
            <th className="text-left p-4 font-semibold">{labels.deadline}</th>
          </tr>
        </thead>
        <tbody>
          {PRODUCTS.map((p) => (
            <tr key={p.slugs[locale]} className="border-t" style={{ borderColor: "var(--card-border)" }}>
              <td className="p-4 font-semibold">{p.name[locale]}</td>
              <td className="p-4">{fmt(p.pricing.setup)}</td>
              <td className="p-4">{fmt(p.pricing.monthly)}</td>
              <td className="p-4">{fmt(p.pricing.purchase)}</td>
              <td className="p-4">{p.pricing.deadline[locale]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Barrel + page**

```ts
// src/components/sections/products/index.ts
export { ProductCard } from "./ProductCard";
export { ProductFilters } from "./ProductFilters";
export { ProductComparison } from "./ProductComparison";
```

```tsx
// src/app/[locale]/produtos/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProductFilters, ProductComparison } from "@/components/sections/products";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PRODUCTS } from "@/data/products";
import { makeMetadata } from "@/lib/metadata";
import type { Locale, ProductCategory } from "@/types";

const CATEGORY_LABELS: Record<Locale, Record<ProductCategory, string>> = {
  pt: { sites: "Sites", "landing-pages": "Landing Pages", "apps-e-sistemas": "Apps & Sistemas", "operacao-digital": "Operação digital" },
  en: { sites: "Websites", "landing-pages": "Landing Pages", "apps-e-sistemas": "Apps & Systems", "operacao-digital": "Digital ops" },
  es: { sites: "Sitios", "landing-pages": "Landing Pages", "apps-e-sistemas": "Apps & Sistemas", "operacao-digital": "Operación digital" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products.metadata" });
  return makeMetadata({
    title: t("title"),
    description: t("description"),
    path: locale === "pt" ? "/produtos" : `/${locale}/produtos`,
    locale: locale as Locale,
    alternatePaths: { pt: "/produtos", en: "/en/produtos", es: "/es/produtos" },
  });
}

export default async function ProductsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products.list" });
  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <ScrollReveal>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-display)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{t("title")}</h1>
            <p className="mt-4 max-w-2xl" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("subtitle")}</p>
          </ScrollReveal>
        </div>
      </section>
      <section className="pb-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <ProductFilters
            products={PRODUCTS}
            locale={locale as Locale}
            allLabel={t("filterAll")}
            categoryLabels={CATEGORY_LABELS[locale as Locale]}
            learnMoreLabel={t("learnMore")}
          />
        </div>
      </section>
      <section className="pb-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <h2 className="mb-6" style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("compareTitle")}</h2>
          <ProductComparison locale={locale as Locale} labels={{ product: t("compareProduct"), setup: t("compareSetup"), monthly: t("compareMonthly"), purchase: t("comparePurchase"), deadline: t("compareDeadline") }} />
        </div>
      </section>
      <section className="py-16 text-center" style={{ background: "var(--background-secondary)" }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{t("ctaTitle")}</h2>
          <p className="mt-3" style={{ color: "var(--foreground-muted)" }}>{t("ctaSubtitle")}</p>
          <div className="mt-6 inline-block">
            <WhatsAppButton context={{ kind: "generic" }} locale={locale as Locale} size="lg">{t("cta")}</WhatsAppButton>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Add `products.list` and `products.metadata` i18n**

Append to PT:

```json
"products": {
  "metadata": {
    "title": "Produtos · BlackElephant",
    "description": "Sites, landing pages, apps, sistemas e softwares de gestão. Preço claro, prazo curto, sem orçamento de 30 dias."
  },
  "list": {
    "title": "Tudo que a gente faz, com preço claro.",
    "subtitle": "Sem orçamento que demora 30 dias. Você vê o preço, conversa no WhatsApp, e o projeto começa.",
    "filterAll": "Tudo",
    "learnMore": "Ver detalhes",
    "compareTitle": "Compare lado a lado",
    "compareProduct": "Produto",
    "compareSetup": "Para começar",
    "compareMonthly": "Mensal",
    "comparePurchase": "Compra única",
    "compareDeadline": "Prazo",
    "ctaTitle": "Não sabe qual escolher?",
    "ctaSubtitle": "Manda mensagem com o seu cenário. A gente te indica o que faz sentido.",
    "cta": "Falar no WhatsApp"
  }
}
```

EN/ES analogous.

- [ ] **Step 6: Run dev + commit**

Run dev, visit `/produtos`. 7 cards + filters + comparison table. Stop server.

```bash
git add src/app/[locale]/produtos/page.tsx src/components/sections/products src/i18n/messages
git commit -m "feat(products): list page with filters and comparison table"
```

---

### Task 34: Product detail `/produtos/[slug]` — full conversion landing

**Files:**
- Create: `src/app/[locale]/produtos/[slug]/page.tsx`
- Create: `src/components/sections/products/ProductDetail.tsx` (composer)
- Create: `src/components/sections/products/ProductHero.tsx`
- Create: `src/components/sections/products/ProductIncluded.tsx`
- Create: `src/components/sections/products/ProductForWho.tsx`
- Create: `src/components/sections/products/ProductProcess.tsx`
- Create: `src/components/sections/products/ProductPricing.tsx`
- Create: `src/components/sections/products/ProductABCompare.tsx`
- Create: `src/components/sections/products/ProductRelatedCases.tsx`
- Create: `src/components/sections/products/ProductFAQSection.tsx`

Each block is small and self-contained. Below is the full canonical implementation.

- [ ] **Step 1: `ProductHero.tsx`**

```tsx
import { Link } from "@/i18n/navigation";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Product, Locale } from "@/types";

type Props = { product: Product; locale: Locale; labels: { breadcrumbHome: string; breadcrumbList: string; whatsapp: string; details: string } };

export function ProductHero({ product, locale, labels }: Props) {
  return (
    <section className="pt-32 pb-12 lg:pt-40 lg:pb-20" style={{ background: "var(--gradient-mesh)" }}>
      <div className="mx-auto max-w-[1300px] px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <nav className="text-xs opacity-70 mb-3" aria-label="Breadcrumb">
            <Link href="/">{labels.breadcrumbHome}</Link> / <Link href="/produtos">{labels.breadcrumbList}</Link>
          </nav>
          <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-lime)" }}>{product.category.replace("-", " ")}</div>
          <h1 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-display)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{product.name[locale]}</h1>
          <p className="mt-5 max-w-xl" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{product.longDescription[locale]}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton context={{ kind: "product", productName: product.name[locale] }} locale={locale} size="lg">{labels.whatsapp}</WhatsAppButton>
            <Button href="#detalhes" variant="secondary" size="lg">{labels.details}</Button>
          </div>
        </div>
        <div>
          <PriceTag setup={product.pricing.setup} monthly={product.pricing.monthly} purchase={product.pricing.purchase} deadline={product.pricing.deadline[locale]} locale={locale} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `ProductIncluded.tsx`**

```tsx
import type { Product, Locale } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Props = { product: Product; locale: Locale; title: string };

export function ProductIncluded({ product, locale, title }: Props) {
  return (
    <section id="detalhes" className="py-16">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{title}</h2>
        </ScrollReveal>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {product.includes[locale].map((x, i) => (
            <ScrollReveal key={x} delay={Math.min(i, 6) * 0.04}>
              <li className="flex items-start gap-3 rounded-xl p-4 border"
                style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
                <span aria-hidden style={{ color: "var(--color-lime)", fontSize: 20 }}>✓</span>
                <span>{x}</span>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `ProductForWho.tsx`**

```tsx
import type { Product, Locale } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Props = { product: Product; locale: Locale; title: string };

export function ProductForWho({ product, locale, title }: Props) {
  return (
    <section className="py-16 border-y" style={{ borderColor: "var(--card-border)", background: "var(--background-secondary)" }}>
      <div className="mx-auto max-w-[900px] px-6 lg:px-12 text-center">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{title}</h2>
        </ScrollReveal>
        <ul className="mt-8 space-y-3 text-left">
          {product.forWho[locale].map((x, i) => (
            <ScrollReveal key={x} delay={Math.min(i, 6) * 0.05}>
              <li className="flex items-start gap-3 rounded-xl p-4 border"
                style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
                <span aria-hidden style={{ color: "var(--color-lime)", fontSize: 20 }}>★</span>
                <span style={{ fontSize: "var(--text-lead)" }}>{x}</span>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `ProductProcess.tsx`**

```tsx
import type { Product, Locale } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Props = { product: Product; locale: Locale; title: string };

export function ProductProcess({ product, locale, title }: Props) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, textAlign: "center" }}>{title}</h2>
        </ScrollReveal>
        <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {product.process.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <li className="rounded-2xl p-6 border h-full relative"
                style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
                <span className="text-xs font-bold absolute top-4 right-4" style={{ color: "var(--color-lime)" }}>0{i + 1}</span>
                <h3 className="font-semibold leading-tight" style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-xl)" }}>{step.title[locale]}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--foreground-muted)" }}>{step.description[locale]}</p>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: `ProductPricing.tsx`**

```tsx
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { Product, Locale } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

type Plan = { id: "setup" | "monthly" | "purchase"; price: number; label: string; subtitle: string };

const fmt = (n: number) => `R$ ${new Intl.NumberFormat("pt-BR").format(n)}`;

type Props = { product: Product; locale: Locale; title: string; cta: string; planLabels: Record<"setup" | "monthly" | "purchase", { label: string; subtitle: string }> };

export function ProductPricing({ product, locale, title, cta, planLabels }: Props) {
  const plans: Plan[] = [];
  if (product.pricing.setup != null) plans.push({ id: "setup", price: product.pricing.setup, ...planLabels.setup });
  if (product.pricing.monthly != null) plans.push({ id: "monthly", price: product.pricing.monthly, ...planLabels.monthly });
  if (product.pricing.purchase != null) plans.push({ id: "purchase", price: product.pricing.purchase, ...planLabels.purchase });
  return (
    <section className="py-16 border-y" style={{ borderColor: "var(--card-border)", background: "var(--background-secondary)" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, textAlign: "center" }}>{title}</h2>
        </ScrollReveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.id} className="rounded-2xl p-6 border flex flex-col gap-4"
              style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
              <div className="text-xs uppercase tracking-wider opacity-70">{plan.label}</div>
              <div style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, color: "var(--color-lime)" }}>{fmt(plan.price)}</div>
              <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>{plan.subtitle}</p>
              <div className="mt-auto">
                <WhatsAppButton context={{ kind: "product", productName: product.name[locale] }} locale={locale} className="w-full">{cta}</WhatsAppButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: `ProductABCompare.tsx`**

```tsx
import type { Product, Locale } from "@/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const fmt = (n?: number) => (n == null ? "—" : `R$ ${new Intl.NumberFormat("pt-BR").format(n)}`);

type Props = { current: Product; target: Product; locale: Locale; title: string; rows: { setup: string; monthly: string; purchase: string; deadline: string } };

export function ProductABCompare({ current, target, locale, title, rows }: Props) {
  const data = [
    { label: rows.setup, a: fmt(current.pricing.setup), b: fmt(target.pricing.setup) },
    { label: rows.monthly, a: fmt(current.pricing.monthly), b: fmt(target.pricing.monthly) },
    { label: rows.purchase, a: fmt(current.pricing.purchase), b: fmt(target.pricing.purchase) },
    { label: rows.deadline, a: current.pricing.deadline[locale], b: target.pricing.deadline[locale] },
  ];
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
        <ScrollReveal>
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700, textAlign: "center" }}>{title}</h2>
        </ScrollReveal>
        <div className="mt-8 overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--card-border)", background: "var(--card-background)" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "var(--background-tertiary)" }}>
              <tr>
                <th className="text-left p-4"></th>
                <th className="text-left p-4">{current.name[locale]}</th>
                <th className="text-left p-4">{target.name[locale]}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.label} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                  <td className="p-4 font-semibold opacity-70">{row.label}</td>
                  <td className="p-4">{row.a}</td>
                  <td className="p-4">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: `ProductRelatedCases.tsx`**

```tsx
import { PortfolioCard } from "@/components/sections/portfolio/PortfolioCard";
import { getPortfolioBySlug } from "@/data/portfolio";
import type { Product, Locale } from "@/types";

type Props = { product: Product; locale: Locale; title: string };

export function ProductRelatedCases({ product, locale, title }: Props) {
  const items = product.relatedPortfolio
    .map((s) => getPortfolioBySlug(s))
    .filter((x): x is NonNullable<ReturnType<typeof getPortfolioBySlug>> => Boolean(x))
    .slice(0, 3);
  if (items.length === 0) return null;
  return (
    <section className="py-16 border-y" style={{ borderColor: "var(--card-border)", background: "var(--background-secondary)" }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{title}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((it) => <li key={it.slug}><PortfolioCard item={it} locale={locale} /></li>)}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: `ProductFAQSection.tsx`**

```tsx
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import type { Product, Locale } from "@/types";

type Props = { product: Product; locale: Locale; title: string };

export function ProductFAQSection({ product, locale, title }: Props) {
  const items = product.faq.map((f) => ({ q: f.q[locale], a: f.a[locale] }));
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[900px] px-6 lg:px-12">
        <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{title}</h2>
        <div className="mt-8"><FAQAccordion items={items} /></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Update barrel**

Append to `src/components/sections/products/index.ts`:

```ts
export { ProductHero } from "./ProductHero";
export { ProductIncluded } from "./ProductIncluded";
export { ProductForWho } from "./ProductForWho";
export { ProductProcess } from "./ProductProcess";
export { ProductPricing } from "./ProductPricing";
export { ProductABCompare } from "./ProductABCompare";
export { ProductRelatedCases } from "./ProductRelatedCases";
export { ProductFAQSection } from "./ProductFAQSection";
```

- [ ] **Step 10: Page**

```tsx
// src/app/[locale]/produtos/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  ProductHero, ProductIncluded, ProductForWho, ProductProcess,
  ProductPricing, ProductABCompare, ProductRelatedCases, ProductFAQSection,
} from "@/components/sections/products";
import { getProductBySlug, getProductsByCategory, PRODUCTS } from "@/data/products";
import { breadcrumbSchema, faqSchema, serviceSchema, SITE } from "@/lib/schema";
import { makeMetadata } from "@/lib/metadata";
import type { Locale } from "@/types";

export async function generateStaticParams() {
  return PRODUCTS.flatMap((p) =>
    (["pt", "en", "es"] as Locale[]).map((loc) => ({ locale: loc, slug: p.slugs[loc] }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug, locale as Locale);
  if (!product) return {};
  const path = locale === "pt" ? `/produtos/${slug}` : `/${locale}/produtos/${slug}`;
  return makeMetadata({
    title: `${product.name[locale as Locale]} · ${product.pricing.deadline[locale as Locale]}`,
    description: product.shortDescription[locale as Locale],
    path,
    locale: locale as Locale,
    alternatePaths: {
      pt: `/produtos/${product.slugs.pt}`,
      en: `/en/produtos/${product.slugs.en}`,
      es: `/es/produtos/${product.slugs.es}`,
    },
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug, locale as Locale);
  if (!product) notFound();
  const t = await getTranslations({ locale, namespace: "products.detail" });

  const target = product.abComparisonTarget
    ? PRODUCTS.find((p) => p.slugs.pt === product.abComparisonTarget)
    : undefined;

  const breadcrumbs = breadcrumbSchema([
    { name: t("breadcrumbHome"), url: SITE.url },
    { name: t("breadcrumbList"), url: `${SITE.url}/produtos` },
    { name: product.name[locale as Locale], url: `${SITE.url}/produtos/${slug}` },
  ]);
  const service = serviceSchema({
    name: product.name[locale as Locale],
    description: product.shortDescription[locale as Locale],
    url: `${SITE.url}/produtos/${slug}`,
    price: product.pricing.purchase ?? product.pricing.setup ?? product.pricing.monthly ?? 0,
    currency: "BRL",
  });
  const faq = faqSchema(product.faq.map((f) => ({ q: f.q[locale as Locale], a: f.a[locale as Locale] })));

  return (
    <>
      <ProductHero
        product={product}
        locale={locale as Locale}
        labels={{ breadcrumbHome: t("breadcrumbHome"), breadcrumbList: t("breadcrumbList"), whatsapp: t("ctaWhatsapp"), details: t("seeDetails") }}
      />
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12 flex flex-col items-center gap-4">
          <p className="text-sm opacity-80 text-center">{t("trustLine")}</p>
          <TrustBadges locale={locale as Locale} />
        </div>
      </section>
      <ProductForWho product={product} locale={locale as Locale} title={t("forWhoTitle")} />
      <ProductIncluded product={product} locale={locale as Locale} title={t("includedTitle")} />
      <ProductProcess product={product} locale={locale as Locale} title={t("processTitle")} />
      <ProductPricing
        product={product}
        locale={locale as Locale}
        title={t("pricingTitle")}
        cta={t("ctaWhatsapp")}
        planLabels={{
          setup: { label: t("planSetupLabel"), subtitle: t("planSetupSubtitle") },
          monthly: { label: t("planMonthlyLabel"), subtitle: t("planMonthlySubtitle") },
          purchase: { label: t("planPurchaseLabel"), subtitle: t("planPurchaseSubtitle") },
        }}
      />
      {product.hasABVariant && target && (
        <ProductABCompare
          current={product} target={target} locale={locale as Locale}
          title={t("abTitle")}
          rows={{ setup: t("planSetupLabel"), monthly: t("planMonthlyLabel"), purchase: t("planPurchaseLabel"), deadline: t("compareDeadline") }}
        />
      )}
      <ProductRelatedCases product={product} locale={locale as Locale} title={t("casesTitle")} />
      <ProductFAQSection product={product} locale={locale as Locale} title={t("faqTitle")} />
      <section className="py-16 text-center" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("finalCtaTitle")}</h2>
          <p className="mt-3" style={{ color: "var(--foreground-muted)" }}>{t("finalCtaSubtitle")}</p>
          <div className="mt-6 inline-block">
            <WhatsAppButton context={{ kind: "product", productName: product.name[locale as Locale] }} locale={locale as Locale} size="lg">
              {t("ctaWhatsapp")}
            </WhatsAppButton>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}
```

- [ ] **Step 11: Add `products.detail` i18n**

PT:

```json
"products": {
  "detail": {
    "breadcrumbHome": "Início",
    "breadcrumbList": "Produtos",
    "ctaWhatsapp": "Falar no WhatsApp",
    "seeDetails": "Ver detalhes",
    "trustLine": "Quem confia na BlackElephant: Banco BHG, HubFive, KZ Serviços, Vérité, Sabas, Solumart.",
    "forWhoTitle": "Pra quem é",
    "includedTitle": "O que está incluído",
    "processTitle": "Como funciona",
    "pricingTitle": "Planos e preços",
    "abTitle": "Compare com a versão A/B",
    "compareDeadline": "Prazo",
    "planSetupLabel": "Para começar",
    "planSetupSubtitle": "Pagamento único de implementação inicial.",
    "planMonthlyLabel": "Mensal",
    "planMonthlySubtitle": "Hospedagem, domínio, suporte e atualizações inclusos.",
    "planPurchaseLabel": "Compra única",
    "planPurchaseSubtitle": "Você adquire o código e fica dono do projeto.",
    "casesTitle": "Cases relacionados",
    "faqTitle": "Perguntas frequentes",
    "finalCtaTitle": "Pronto pra começar?",
    "finalCtaSubtitle": "Sem orçamento de 30 dias. A gente conversa e o projeto roda."
  }
}
```

EN/ES analogous.

- [ ] **Step 12: Run dev + commit**

Run dev. Visit `/produtos/desenvolvimento-de-site-profissional`, `/produtos/software-de-gestao-empresarial-com-automacao` and one with A/B variant. All sections render. JSON-LD valid (use Chrome devtools → Application → JSON-LD or `view-source`). Stop server.

```bash
git add src/app/[locale]/produtos src/components/sections/products src/i18n/messages
git commit -m "feat(products): detail landing page with full conversion stack and JSON-LD"
```

---

## Phase 9 — Contato (`/contato`)

### Task 35: Contact page (single task with all sections)

**Files:**
- Create: `src/app/[locale]/contato/page.tsx`

(Single page, no sub-components — small enough to keep inline.)

- [ ] **Step 1: Page**

```tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Glow } from "@/components/ui/Glow";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { whatsappUrl, WHATSAPP_PHONE } from "@/lib/whatsapp";
import { localBusinessSchema, breadcrumbSchema, SITE } from "@/lib/schema";
import { makeMetadata } from "@/lib/metadata";
import type { Locale } from "@/types";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Av.+Yojiro+Takaoka+4384,+Santana+de+Parnaiba+SP";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.metadata" });
  return makeMetadata({
    title: t("title"),
    description: t("description"),
    path: locale === "pt" ? "/contato" : `/${locale}/contato`,
    locale: locale as Locale,
    alternatePaths: { pt: "/contato", en: "/en/contato", es: "/es/contato" },
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const breadcrumbs = breadcrumbSchema([
    { name: t("metadata.breadcrumbHome"), url: SITE.url },
    { name: t("metadata.breadcrumbList"), url: `${SITE.url}/contato` },
  ]);

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40" style={{ background: "var(--gradient-mesh)" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <div className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-lime)" }}>{t("hero.eyebrow")}</div>
            <h1 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-display)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{t("hero.title")}</h1>
            <p className="mt-5" style={{ fontSize: "var(--text-lead)", color: "var(--foreground-muted)" }}>{t("hero.subtitle")}</p>
          </ScrollReveal>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[900px] px-6 lg:px-12">
          <ScrollReveal>
            <Glow intensity="lg" className="rounded-2xl p-10 border text-center" style={{ background: "var(--card-background)", borderColor: "var(--color-lime)" }}>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("primary.title")}</h2>
              <p className="mt-3" style={{ color: "var(--foreground-muted)" }}>+55 (19) 97805-5531</p>
              <div className="mt-6 inline-block">
                <WhatsAppButton context={{ kind: "contact" }} locale={locale as Locale} size="lg">{t("primary.cta")}</WhatsAppButton>
              </div>
            </Glow>
          </ScrollReveal>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl p-6 border" style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
            <div aria-hidden style={{ fontSize: 28 }}>✉️</div>
            <h3 className="mt-3 font-semibold">{t("email.title")}</h3>
            <p className="mt-1 break-all">guilherme@blackelephant.com.br</p>
            <Button href="mailto:guilherme@blackelephant.com.br" variant="secondary" size="sm" className="mt-4">{t("email.cta")}</Button>
          </article>
          <article className="rounded-2xl p-6 border" style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
            <div aria-hidden style={{ fontSize: 28 }}>📞</div>
            <h3 className="mt-3 font-semibold">{t("phone.title")}</h3>
            <p className="mt-1">+55 (19) 97805-5531</p>
            <Button href={`tel:+${WHATSAPP_PHONE}`} variant="secondary" size="sm" className="mt-4">{t("phone.cta")}</Button>
          </article>
          <article className="rounded-2xl p-6 border" style={{ background: "var(--card-background)", borderColor: "var(--card-border)" }}>
            <div aria-hidden style={{ fontSize: 28 }}>📍</div>
            <h3 className="mt-3 font-semibold">{t("address.title")}</h3>
            <address className="mt-1 not-italic text-sm leading-6">
              BlackElephant Brasil LTDA<br />Av. Yojiro Takaoka, 4384, Sala 701<br />Alphaville, Santana de Parnaíba — SP<br />06541-038
            </address>
            <Button href={MAPS_URL} external variant="secondary" size="sm" className="mt-4">{t("address.cta")}</Button>
          </article>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[900px] px-6 lg:px-12 text-center">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{t("hours.title")}</h2>
          <p className="mt-3" style={{ color: "var(--foreground-muted)" }}>{t("hours.body")}</p>
          {/* TODO: confirmar horário de atendimento */}
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12 flex flex-col items-center gap-6">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h3)", fontWeight: 700 }}>{t("badges.title")}</h2>
          <TrustBadges locale={locale as Locale} />
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          <iframe
            title="BlackElephant — localização"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.0!2d-46.844!3d-23.480!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQXYuIFlvamlybyBUYWthb2thLCA0Mzg0!5e0!3m2!1spt-BR!2sbr!4v0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[360px] rounded-2xl border"
            style={{ borderColor: "var(--card-border)" }}
          />
        </div>
      </section>
      <section className="py-16 text-center" style={{ background: "var(--background-secondary)" }}>
        <div className="mx-auto max-w-2xl px-6">
          <h2 style={{ fontFamily: "var(--font-title)", fontSize: "var(--text-h2)", fontWeight: 700 }}>{t("finalCta.title")}</h2>
          <div className="mt-6 inline-block">
            <a href={whatsappUrl({ kind: "contact" }, locale as Locale)} target="_blank" rel="noopener noreferrer">
              <WhatsAppButton context={{ kind: "contact" }} locale={locale as Locale} size="lg">{t("finalCta.cta")}</WhatsAppButton>
            </a>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
    </>
  );
}
```

- [ ] **Step 2: Add `contact` i18n**

PT:

```json
"contact": {
  "metadata": {
    "title": "Contato · BlackElephant — WhatsApp, e-mail e endereço",
    "description": "Sem formulário. Sem espera. Conversa direta no WhatsApp ou e-mail. Atendimento em horário comercial.",
    "breadcrumbHome": "Início",
    "breadcrumbList": "Contato"
  },
  "hero": {
    "eyebrow": "FALE COM A GENTE",
    "title": "Sem formulário. Sem espera. Conversa direta.",
    "subtitle": "A gente responde no WhatsApp em horário comercial — geralmente em minutos. Sem robô, sem 'agendar reunião pra agendar reunião'."
  },
  "primary": {
    "title": "Chamar no WhatsApp agora",
    "cta": "Abrir WhatsApp"
  },
  "email": { "title": "Prefere e-mail?", "cta": "Enviar e-mail" },
  "phone": { "title": "Direto na voz", "cta": "Ligar agora" },
  "address": { "title": "Estamos aqui", "cta": "Abrir no Google Maps" },
  "hours": {
    "title": "Horário de atendimento",
    "body": "Atendemos de segunda a sexta, das 9h às 18h (horário de Brasília). Fora desse horário a gente lê e responde no próximo dia útil."
  },
  "badges": { "title": "Por que conversar com a gente" },
  "finalCta": { "title": "Pronto pra acelerar?", "cta": "Falar no WhatsApp" }
}
```

EN/ES analogous.

- [ ] **Step 3: Run dev + commit**

Run dev, visit `/contato`. Confirm hero, big WhatsApp card, 3 contact cards, hours, badges, map, final CTA. Stop server.

```bash
git add src/app/[locale]/contato src/i18n/messages
git commit -m "feat(contact): static page with WhatsApp-first layout, address, map, JSON-LD"
```

---

## Phase 10 — SEO finalization

After Phase 10 the site has sitemap, robots, OpenGraph image, canonical hreflang, and is ready for Lighthouse.

### Task 36: sitemap.ts and robots.ts

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: `sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { PORTFOLIO } from "@/data/portfolio";
import { SITE } from "@/lib/schema";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/quem-somos", "/portfolio", "/produtos", "/contato"];
  const entries: MetadataRoute.Sitemap = [];
  for (const loc of routing.locales) {
    const prefix = loc === routing.defaultLocale ? "" : `/${loc}`;
    for (const route of staticRoutes) {
      entries.push({ url: `${SITE.url}${prefix}${route}`, lastModified: now, changeFrequency: "monthly", priority: route === "" ? 1 : 0.8 });
    }
    for (const item of PORTFOLIO) {
      entries.push({ url: `${SITE.url}${prefix}/portfolio/${item.slug}`, lastModified: now, changeFrequency: "yearly", priority: 0.6 });
    }
    for (const p of PRODUCTS) {
      entries.push({ url: `${SITE.url}${prefix}/produtos/${p.slugs[loc as Locale]}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    }
  }
  return entries;
}
```

- [ ] **Step 2: `robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/schema";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/_descricao*", "/_branding*"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
```

- [ ] **Step 3: Build + commit**

Run: `npm run build`. Confirm no errors. Visit `/sitemap.xml` and `/robots.txt` after `npm run start` (or via build output). Stop server.

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(seo): sitemap + robots covering all locales, portfolio and products"
```

---

### Task 37: OpenGraph image generator

**Files:**
- Create: `src/app/opengraph-image.tsx`

- [ ] **Step 1: Implement**

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BlackElephant — Tecnologia de impacto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0a0a0a",
          color: "#39FF14",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(57,255,20,0.18), transparent 50%), radial-gradient(circle at 80% 80%, rgba(57,255,20,0.12), transparent 50%)",
          }}
        />
        <div style={{ position: "absolute", top: 64, left: 64, fontSize: 28, fontWeight: 700 }}>BlackElephant</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 80px", textAlign: "center" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: "#ffffff", letterSpacing: "-0.02em" }}>
            Tecnologia de impacto.
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: "#39FF14", marginTop: 8 }}>
            Em tempo recorde.
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 64, right: 64, fontSize: 24, opacity: 0.7 }}>blackelephant.com.br</div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 2: Build + commit**

Run: `npm run build`. Confirm. Stop server.

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat(seo): dynamic OpenGraph image at /opengraph-image"
```

---

## Phase 11 — Translations sweep

By now PT is mostly complete and EN/ES exist for layout/home/about/portfolio/products/contact at minimum. Pass through and ensure all message keys present in `pt.json` exist in `en.json` and `es.json` with idiomatic translations.

### Task 38: Translation completeness

**Files:**
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/es.json`

- [ ] **Step 1: Diff PT vs EN/ES keys**

Run a small node one-liner to print missing keys:

```bash
node -e "
const pt=require('./src/i18n/messages/pt.json');
const en=require('./src/i18n/messages/en.json');
const es=require('./src/i18n/messages/es.json');
function flat(o,p='',acc={}){for(const k in o){const np=p?\`\${p}.\${k}\`:k;if(typeof o[k]==='object'&&o[k]!==null)flat(o[k],np,acc);else acc[np]=o[k];}return acc;}
const pf=flat(pt),ef=flat(en),sf=flat(es);
const miss=(o,n)=>Object.keys(pf).filter(k=>!(k in o)).map(k=>n+': '+k);
console.log(miss(ef,'EN').concat(miss(sf,'ES')).join('\n'));
"
```

Expected output: empty if you've been faithful in earlier tasks. Otherwise, list of missing keys.

- [ ] **Step 2: Fill missing keys with idiomatic translations**

For each missing key, add the appropriate EN/ES copy. Keep tone aligned with the PT version: direct, no corporatês.

- [ ] **Step 3: Run dev**

Toggle through PT/EN/ES on every page. No untranslated strings should appear.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/messages
git commit -m "feat(i18n): complete EN and ES translations across all pages"
```

---

## Phase 12 — Polish, audits, cleanup

### Task 39: Visual QA + responsive sweep

- [ ] **Step 1: Run dev**

Run: `npm run dev`. With browser devtools, switch device to:
- **iPhone SE (375)**, **iPhone 14 Pro (393)**, **iPad (820)**, **Desktop (1280)**, **Wide (1920)**.

For each breakpoint, walk every route:
- `/`, `/quem-somos`, `/portfolio`, `/portfolio/banco-bhg-software-de-gestao`, `/produtos`, `/produtos/desenvolvimento-de-site-profissional`, `/contato`, plus `/en/...` and `/es/...` variants of at least one of each.

Record any layout breaks (overflow, broken grids, illegible text, overlapping floats) in a scratch list.

- [ ] **Step 2: Fix issues found**

Address each item from the scratch list with targeted CSS/component fixes. Common fixes: tighten container padding on mobile, drop float cards on the hero below 640px, stack pricing tables under 768px, reduce hero typography clamp lower bound.

- [ ] **Step 3: Run typecheck and tests**

```bash
npx tsc --noEmit
npm test
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: responsive polish across all pages"
```

---

### Task 40: Lighthouse + a11y audit

- [ ] **Step 1: Run production build**

```bash
npm run build && npm run start
```

In a separate terminal, run Lighthouse on `/`, `/quem-somos`, `/portfolio`, `/produtos`, `/produtos/software-de-gestao-empresarial-com-automacao`, `/contato`:

```bash
npx lighthouse http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --output=json --output-path=./lighthouse-home.json --chrome-flags="--headless"
```

Repeat for each route. Inspect JSON; target ≥ 95 in all 4 categories.

- [ ] **Step 2: Fix any score under 95**

Common levers:
- Performance: reduce JS bundles (audit which components are still client when they could be server), set `priority` only on hero img, ensure `next/image` `sizes` are correct, defer Three.js further.
- Accessibility: missing `alt`, low contrast, missing `aria-label`, focus traps, button without label.
- SEO: missing meta description, missing canonical, missing hreflang, blocked by robots.
- Best practices: console errors, mixed content, deprecated APIs.

- [ ] **Step 3: Run axe DevTools or @axe-core/cli**

Optional but recommended for a11y. Install + run:

```bash
npm install -D @axe-core/cli
npx axe http://localhost:3000/ --exit
```

Fix any "serious"/"critical" issues.

- [ ] **Step 4: Commit final polish**

```bash
git add -A
git commit -m "fix: lighthouse + axe pass — performance/a11y/seo polish"
```

Stop the production server.

---

### Task 41: Final verification + remaining TODO inventory

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all green.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: success. No TS errors, no warnings about unused imports.

- [ ] **Step 3: Inventory TODOs**

Run: `Grep` for `TODO` across `src/` and `public/`. Confirm only the intentional ones from §9 of the spec remain (testimonials, image curation, BHG year, hours, CNPJ, privacy, terms, 3D icons, stack logos).

If any unintended TODO appears, address it now or document it in the commit message.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: site rebuild complete — pending content TODOs documented in spec §9"
```

- [ ] **Step 5: Tag the milestone**

```bash
git tag -a v2.0.0-rebuild -m "Full site rebuild: pt/en/es, 7 product landings, 12 portfolio cases, WhatsApp-first conversion"
```

---

## End of plan

The site is now in a shippable state with:
- All 7 product landing pages (each with hero, pricing, FAQ, related cases, JSON-LD)
- 12 portfolio detail pages with related projects and gallery
- Quem somos with 5-section narrative
- Contact page with WhatsApp-first design
- Full pt/en/es i18n
- Sitemap, robots, OpenGraph image
- Lighthouse 95+
- Persistent WhatsApp floating button with context-aware messages

Next milestones (handled outside this plan):
- Curate portfolio images per deliverable (TODO in `data/portfolio.ts`)
- Replace placeholder testimonials with real ones
- Confirm BHG contract year, attendance hours, CNPJ
- Source custom 3D icons + official stack logos
- Author Privacy Policy and Terms of Use pages

