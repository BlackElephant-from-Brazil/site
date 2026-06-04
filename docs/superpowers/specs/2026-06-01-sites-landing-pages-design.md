# Sites And Landing Pages Ad Landing Design

**Date:** 2026-06-01  
**Status:** Design approved; awaiting written spec review

## Goal

Create a dedicated high-conversion advertising landing page for BlackElephant's landing page and multipage website offers.

The page lives at `/[locale]/sites-landing-pages`, keeps the existing home intact, and supports Portuguese and English. It targets paid traffic and must feel like a premium technology-company sales page: dark, energetic, animated, visually stimulating, and direct about conversion.

## Scope

In scope:

- New public route: `/pt/sites-landing-pages` and `/en/sites-landing-pages`
- Portuguese and English content
- High-conversion sales flow using AIDA
- Hero, testimonials, portfolio, product cards, benefit sections, two marquees maximum, contact CTA, WhatsApp CTA, Calendly CTA, direct purchase links, FAQ, and footer
- Reuse existing WhatsApp, Calendly, Stripe, webhook, design tokens, layout shell, and animation patterns

Out of scope:

- Database changes
- Supabase queries or server actions
- New checkout/payment integration
- New admin/customer dashboard behavior
- Replacing the current home page
- Adding translations for locales other than `pt` and `en`

## Route And Localization

Route:

- `src/app/[locale]/sites-landing-pages/page.tsx`

Supported copy:

- Portuguese: full marketing copy for Brazil
- English: equivalent copy for international traffic

Other configured locales can still reach the route through the App Router, but the implementation should use English as the fallback content unless the current locale is `pt`.

Pricing format:

- Portuguese:
  - Landing Page de Alta Conversao: `R$ 1.997`
  - Site Multipagina, 8 paginas: `R$ 3.500`
- English:
  - High-Converting Landing Page: `US$ 1,997`
  - Multipage Website, 8 pages: `US$ 3,500`

The numeric price remains the same across currencies by user request.

## Existing Links And Integrations

Use the existing links found in the site:

- WhatsApp: `https://wa.me/5519978055531`
- Calendly: `https://calendly.com/guilherme-blackelephant/30min`
- Direct purchase, multipage website: `https://buy.stripe.com/test_14AfZh3RB9dTgBS9icenS02`
- Direct purchase, landing page: `https://buy.stripe.com/test_7sYfZh5ZJ0Hn4TacuoenS01`
- Contact form webhook: `https://black-elephant.app.n8n.cloud/webhook/blackelephant-contact-form`

Calendly clicks should call `reportReservarHorarioConversion` as the current service CTAs do.

## Conversion Narrative

Use AIDA across the page:

- Attention: hero with a strong promise, visible prices, and immediate CTAs.
- Interest: show why a weak page wastes ad spend and how a focused page improves the path to conversion.
- Desire: benefits, portfolio, testimonials, process, and product comparison make the outcome tangible.
- Action: direct purchase, WhatsApp, Calendly, and contact form are repeated at natural decision points.

Tone:

- Direct, commercially sharp, and specific
- Avoid vague corporate language
- Emphasize conversion, speed, clarity, premium design, and technology execution

## Section Order

### 1. Hero

Purpose: capture attention and drive immediate action.

Content:

- Headline: landing pages and multipage websites built to convert traffic into leads and customers
- Subcopy: paid traffic deserves a fast, persuasive, professional page, not a generic online brochure
- Primary CTAs:
  - Buy landing page
  - Buy multipage website
- Secondary CTAs:
  - WhatsApp
  - Schedule a call
- Visual panel: animated conversion dashboard/funnel with cards for offer, traffic, lead, WhatsApp, and sale
- Trust chips: performance, responsive, SEO, tracking-ready, premium design

Behavior:

- Animated entry for headline, CTAs, and visual panel
- Subtle floating motion on the conversion cards
- No full-screen hero that hides the next section completely; show a hint of following content on common desktop and mobile viewports

### 2. Marquee 1

Purpose: create energy and communicate capability quickly.

Style:

- Vibrant horizontal band
- Lime/cyan/pink accents on dark background
- Continuous CSS or Framer Motion scroll

Terms:

- Portuguese: `ALTA CONVERSAO`, `SEO`, `PERFORMANCE`, `DESIGN PREMIUM`, `WHATSAPP`, `TRAFEGO PAGO`, `COPY ESTRATEGICA`
- English: `HIGH CONVERSION`, `SEO`, `PERFORMANCE`, `PREMIUM DESIGN`, `WHATSAPP`, `PAID TRAFFIC`, `STRATEGIC COPY`

### 3. Problem And Desire

Purpose: build interest by naming the cost of a weak page.

Content:

- Ads are expensive when the destination page is slow, confusing, generic, or unfocused.
- Visitors need a clear promise, fast load, persuasive structure, and an obvious next step.
- BlackElephant builds the page around the sale path, not around decoration.

Layout:

- Two-column section on desktop
- Left side: problem statements
- Right side: desired outcomes and metrics-style cards

### 4. Products

Purpose: make the buying decision clear.

Product cards:

1. Landing Page de Alta Conversao / High-Converting Landing Page
   - Price: `R$ 1.997` or `US$ 1,997`
   - Promise: one focused page for campaigns, offers, launches, lead capture, and WhatsApp conversion
   - Includes: copy structure, premium responsive design, performance-focused build, tracking-ready CTA structure, publication support
   - Direct purchase link: landing page Stripe URL

2. Site Multipagina / Multipage Website
   - Price: `R$ 3.500` or `US$ 3,500`
   - Scope: 8 pages
   - Promise: professional authority website for businesses that need trust, SEO surface, service pages, and stronger digital presence
   - Includes: home, about/company, services/pages, contact, responsive design, SEO structure, publication support
   - Direct purchase link: website Stripe URL

Each card includes:

- Direct purchase CTA
- WhatsApp secondary CTA
- Small delivery/scope notes without overpromising exact dates unless already supported by existing product content

### 5. Landing Page Benefits

Purpose: create desire for the lower-ticket conversion offer.

Benefits:

- One objective per page
- Campaign-ready structure
- Clear offer hierarchy
- Lead capture and WhatsApp-first CTAs
- Faster decision path
- Better message match with ads
- Performance-focused implementation

Layout:

- Benefit grid with icon-style visual markers
- Animated hover states

### 6. Multipage Website Benefits

Purpose: create desire for the authority/SEO offer.

Benefits:

- More trust for cold visitors
- Pages for each service or offer
- Better SEO surface
- Professional institutional presence
- Clear navigation for different buyer intents
- Stronger base for future content and campaigns
- More room for proof, process, team, and contact information

Layout:

- Alternating content and visual cards
- Compare "landing page" versus "multipage site" intent without making either product look inferior

### 7. Portfolio

Purpose: provide proof of capability.

Use existing portfolio data from `src/data/portfolio.ts` when the data fits the landing page visually and semantically.

If the existing data is not ideal for this exact page, render a focused selection of portfolio-style cards based on existing projects/cases without inventing unsupported claims. Include a CTA to `/portfolio`.

Layout:

- 3 or 4 featured cards
- Dark cards with screenshots/images when available
- Tags for website, system, automation, landing, or relevant service category

### 8. Marquee 2

Purpose: reinforce urgency and memorable messaging.

Limit: this is the second and final marquee.

Suggested copy:

- Portuguese: `SEU ANUNCIO MERECE UMA PAGINA QUE VENDA`
- English: `YOUR AD DESERVES A PAGE THAT SELLS`

Style:

- Different visual rhythm from Marquee 1
- Brighter but still controlled
- Use vibrant accents without turning the whole page into a one-color palette

### 9. Testimonials

Purpose: reduce perceived risk with social proof.

Implementation:

- Reuse the visual pattern from `ReviewsCarousel` where practical
- Render compact testimonial cards on this page
- Use existing testimonial copy if available in current components/messages; otherwise write generic but truthful short testimonial-style copy that does not claim named client outcomes unless those exist in the repository

### 10. Process

Purpose: clarify what happens after purchase or contact.

Steps:

1. Briefing: understand business, offer, audience, and conversion goal
2. Structure: define page flow, copy direction, sections, and CTAs
3. Design and development: build responsive, fast, premium page/site
4. Launch support: publish, review, and prepare CTAs/tracking structure

Layout:

- Four horizontal steps on desktop
- Stacked timeline on mobile

### 11. Contact CTA

Purpose: provide a low-friction action for users not ready to buy directly.

Content:

- Contact form fields: name, email, message
- Submit to existing n8n contact webhook
- Success and error feedback similar to the current contact page
- Side panel with:
  - WhatsApp button
  - Calendly button
  - Direct purchase buttons for both products

Behavior:

- Client-side submit with loading state
- No persistence in the app database
- No server action

### 12. FAQ

Purpose: answer final objections.

Topics:

- Difference between landing page and multipage website
- Whether the buyer can purchase directly
- What content/materials are needed
- Whether the page is responsive
- Whether SEO/performance are considered
- Whether WhatsApp and Calendly can be used as CTAs
- How to talk to the team before buying

### 13. Footer

Use the existing site footer.

## Visual Direction

Keep the public-site design system:

- Dark background
- Lime as the primary accent
- Glassmorphism cards
- Subtle borders
- Framer Motion scroll reveals
- Existing container sizing and font tokens

Make this page more energetic than the institutional pages:

- Add controlled cyan, pink, and amber accents
- Use colored product CTAs
- Use two vibrant marquees maximum
- Use varied type treatment through existing font tokens
- Avoid a flat one-hue lime-only look

Do not use a light theme.

## Component Structure

Recommended files:

- `src/app/[locale]/sites-landing-pages/page.tsx`
- `src/components/sites-landing-pages/SitesLandingPagesClient.tsx`

The client component can contain small local section components in the same file if that keeps the implementation cohesive. Extract shared pieces only when repetition becomes meaningful.

No new database types, server actions, or Supabase code are needed.

## Data And Copy

Use a local copy object keyed by locale in the landing page component or a dedicated local module. This is preferable to expanding global i18n messages heavily for a campaign page, unless the implementation naturally fits the current `src/i18n/messages/*.json` structure.

The page must support:

- `pt`
- `en`

Fallback:

- Any non-`pt` locale should render English copy.

## Analytics And Tracking

Reuse existing Google Ads conversion reporting for Calendly clicks:

- `reportReservarHorarioConversion`

Direct purchase buttons should be normal external anchors to Stripe. WhatsApp should be an external anchor. Contact form submission is tracked only by webhook response unless an existing analytics helper is already available and suitable.

## Accessibility And Responsive Behavior

- All CTAs must have visible focus states through native or CSS focus behavior.
- External links open in a new tab with `rel="noopener noreferrer"`.
- Form inputs need labels.
- Text must not overflow buttons/cards on mobile.
- Marquees must not be the only place important information appears.
- The page must remain readable and usable if motion is reduced by the user agent.

## Verification

Run:

- `npm run lint`
- `npm run build`
- `npm run dev`

Manual checks:

- `/pt/sites-landing-pages`
- `/en/sites-landing-pages`
- Desktop and mobile viewport
- Hero CTAs point to the correct Stripe, WhatsApp, and Calendly URLs
- Contact form posts to the existing webhook and handles loading/success/error states
- Prices render as `R$` in Portuguese and `US$` in English
- Header and footer still render correctly
- Marquees do not cause horizontal page overflow
