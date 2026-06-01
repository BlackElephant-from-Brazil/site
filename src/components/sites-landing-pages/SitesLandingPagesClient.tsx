'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { reportReservarHorarioConversion } from '@/lib/analytics/google-ads';

type LocaleKey = 'pt' | 'en';
type SitesLandingPagesClientProps = {
  locale: string;
};

export const LINKS = {
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
    trustChips: ['Performance', 'Responsivo', 'SEO', 'Pronto para tracking', 'Design premium'],
    marqueeOne: ['ALTA CONVERSAO', 'SEO', 'PERFORMANCE', 'DESIGN PREMIUM', 'WHATSAPP', 'TRAFEGO PAGO', 'COPY ESTRATEGICA'],
    problemTitle: 'Pagina fraca queima verba de trafego.',
    problemText:
      'Quando o clique chega em uma pagina lenta, confusa ou generica, a campanha paga pela visita e perde a venda.',
    outcomes: ['Oferta clara', 'CTA visivel', 'Carregamento rapido', 'Mensagem alinhada ao anuncio'],
    productsTitle: 'Escolha o formato certo para vender agora.',
    productsText:
      'Compra direta para quem ja decidiu. WhatsApp e call para quem quer validar o melhor caminho antes.',
    landingDescription:
      'Uma pagina focada para campanhas, lancamentos, captacao de leads e conversao por WhatsApp.',
    websiteDescription: 'Um site profissional de 8 paginas para autoridade, SEO, servicos, prova e contato.',
    productIncludes: ['Copy e estrutura', 'Design responsivo', 'Performance', 'Publicacao assistida'],
    visualFlow: ['Trafego', 'Oferta', 'Lead', 'WhatsApp', 'Venda'],
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
    trustChips: ['Performance', 'Responsive', 'SEO', 'Tracking-ready', 'Premium design'],
    marqueeOne: ['HIGH CONVERSION', 'SEO', 'PERFORMANCE', 'PREMIUM DESIGN', 'WHATSAPP', 'PAID TRAFFIC', 'STRATEGIC COPY'],
    problemTitle: 'A weak page burns paid traffic budget.',
    problemText:
      'When a click lands on a slow, confusing, or generic page, the campaign pays for the visit and loses the sale.',
    outcomes: ['Clear offer', 'Visible CTA', 'Fast loading', 'Message match with the ad'],
    productsTitle: 'Choose the right format to sell now.',
    productsText:
      'Direct purchase for buyers who are ready. WhatsApp and call for buyers who want to validate the best path first.',
    landingDescription:
      'One focused page for campaigns, launches, lead capture, and WhatsApp conversion.',
    websiteDescription: 'An 8-page professional website for authority, SEO, services, proof, and contact.',
    productIncludes: ['Copy and structure', 'Responsive design', 'Performance', 'Launch support'],
    visualFlow: ['Traffic', 'Offer', 'Lead', 'WhatsApp', 'Sale'],
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

type HeroCopy = (typeof COPY)[LocaleKey];

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
      <MarqueeBand items={copy.marqueeOne} variant="primary" />
      <ProblemSection copy={copy} reduceMotion={reduceMotion} />
      <ProductsSection copy={copy} reduceMotion={reduceMotion} />
    </div>
  );
}

function HeroSection({
  copy,
  reduceMotion,
}: {
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-24 top-20 h-[420px] w-[420px] rounded-full opacity-[0.08] blur-[140px]"
          style={{ backgroundColor: 'var(--color-lime)' }}
        />
        <div
          className="absolute left-0 top-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[150px]"
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      </div>
      <div className="site-container relative z-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid min-h-[82vh] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20"
        >
          <div>
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={LINKS.landingCheckout}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95 bg-[var(--color-lime)] text-black hover:bg-[var(--color-lime-light)]"
              >
                {copy.buyLanding}
              </a>
              <a
                href={LINKS.websiteCheckout}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95 border border-white/14 bg-white/[0.06] text-white hover:border-[var(--color-lime)]/60 hover:text-[var(--color-lime)]"
              >
                {copy.buyWebsite}
              </a>
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95 border border-white/12 text-white/78 hover:border-white/30 hover:text-white"
              >
                {copy.whatsapp}
              </a>
              <a
                href={LINKS.calendly}
                target="_blank"
                rel="noopener noreferrer"
                onClick={reportReservarHorarioConversion}
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95 border border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100 hover:bg-fuchsia-500/20"
              >
                {copy.calendly}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {copy.trustChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/68"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <HeroConversionVisual copy={copy} reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}

function HeroConversionVisual({
  copy,
  reduceMotion,
}: {
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 26, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[560px]"
      aria-hidden
    >
      <div className="absolute inset-8 rounded-full bg-[var(--color-lime)]/10 blur-[90px]" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-black/50 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/42">
              Conversion OS
            </div>
            <div className="mt-1 text-lg font-black text-white">BlackElephant</div>
          </div>
          <div className="h-3 w-3 rounded-full bg-[var(--color-lime)] shadow-[0_0_24px_var(--color-lime)]" />
        </div>

        <div className="space-y-3">
          {copy.visualFlow.map((item, index) => (
            <motion.div
              key={item}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-lime)]/12 text-xs font-black text-[var(--color-lime)]">
                  0{index + 1}
                </span>
                <span className="text-sm font-bold text-white">{item}</span>
              </div>
              <motion.span
                animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.18 }}
                className="h-2 w-16 rounded-full bg-gradient-to-r from-[var(--color-lime)] to-fuchsia-400"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MarqueeBand({ items, variant }: { items: readonly string[]; variant: 'primary' | 'muted' }) {
  const reduceMotion = useReducedMotion();
  const isPrimary = variant === 'primary';

  return (
    <section
      className={`relative overflow-hidden border-y ${isPrimary ? 'border-[var(--color-lime)]/20 bg-[var(--color-lime)]/8' : 'border-white/10 bg-white/[0.03]'}`}
    >
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex w-max py-5"
      >
        {[0, 1].map((track) => (
          <div key={track} className="flex gap-8 pr-8">
            {items.map((item) => (
              <span
                key={`${track}-${item}`}
                className="whitespace-nowrap text-sm font-black uppercase tracking-[0.24em] text-white/72"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function ProblemSection({
  copy,
  reduceMotion,
}: {
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              className="text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {copy.problemTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-white/64">{copy.problemText}</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {copy.outcomes.map((outcome, index) => (
              <div
                key={outcome}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"
              >
                <div className="mb-5 h-1 w-12 rounded-full bg-[var(--color-lime)]" />
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/36">
                  0{index + 1}
                </div>
                <div className="mt-3 text-xl font-black text-white">{outcome}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProductsSection({
  copy,
  reduceMotion,
}: {
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  const products = [
    {
      name: copy.landingName,
      price: copy.landingPrice,
      description: copy.landingDescription,
      checkout: LINKS.landingCheckout,
      featured: true,
    },
    {
      name: copy.websiteName,
      price: copy.websitePrice,
      description: copy.websiteDescription,
      checkout: LINKS.websiteCheckout,
      featured: false,
    },
  ];

  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 max-w-3xl lg:mb-14"
        >
          <h2
            className="text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            {copy.productsTitle}
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-white/64">{copy.productsText}</p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          {products.map((product, index) => (
            <motion.article
              key={product.name}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-[1.5rem] border p-6 lg:p-8 ${product.featured ? 'border-[var(--color-lime)]/35 bg-[var(--color-lime)]/[0.07]' : 'border-white/10 bg-white/[0.04]'}`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">{product.name}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-[1.7] text-white/62">{product.description}</p>
                </div>
                <div className="text-3xl font-black text-[var(--color-lime)]">{product.price}</div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {copy.productIncludes.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-white/76">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-lime)]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={product.checkout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95 bg-[var(--color-lime)] text-black hover:bg-[var(--color-lime-light)]"
                >
                  {product.featured ? copy.buyLanding : copy.buyWebsite}
                </a>
                <a
                  href={LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300 active:scale-95 border border-white/14 bg-white/[0.05] text-white hover:border-white/30"
                >
                  {copy.whatsapp}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
