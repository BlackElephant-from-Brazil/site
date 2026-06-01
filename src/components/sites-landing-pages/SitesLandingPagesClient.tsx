'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { Link } from '@/i18n/navigation';
import { portfolioItems } from '@/data/portfolio';
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

const PROOF_CARDS = {
  pt: [
    {
      label: 'Sinal de entrega',
      title: 'Clareza antes da campanha',
      text: 'A pagina organiza oferta, argumentos e chamada principal para que o visitante entenda rapido o proximo passo.',
    },
    {
      label: 'Criterio de decisao',
      title: 'Experiencia confiavel',
      text: 'Design, responsividade e velocidade ajudam a reduzir atrito quando o clique vem de anuncio, busca ou indicacao.',
    },
    {
      label: 'Base comercial',
      title: 'Caminho claro para contato',
      text: 'A estrutura destaca CTAs, WhatsApp e pontos de prova sem depender de promessas de resultado ou metricas nao verificadas.',
    },
  ],
  en: [
    {
      label: 'Delivery signal',
      title: 'Clarity before the campaign',
      text: 'The page organizes the offer, arguments, and primary call to action so visitors quickly understand the next step.',
    },
    {
      label: 'Decision criteria',
      title: 'Trustworthy experience',
      text: 'Design, responsiveness, and speed help reduce friction when the click comes from an ad, search, or referral.',
    },
    {
      label: 'Sales foundation',
      title: 'Clear path to contact',
      text: 'The structure highlights CTAs, WhatsApp, and proof points without relying on unverified outcome promises or metrics.',
    },
  ],
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
      <MarqueeBand items={copy.marqueeOne} variant="primary" />
      <ProblemSection copy={copy} reduceMotion={reduceMotion} />
      <ProductsSection copy={copy} reduceMotion={reduceMotion} />
      <BenefitsSection title={copy.landingBenefitsTitle} items={copy.landingBenefits} accent="lime" reduceMotion={reduceMotion} />
      <BenefitsSection title={copy.websiteBenefitsTitle} items={copy.websiteBenefits} accent="cyan" reduceMotion={reduceMotion} />
      <PortfolioSection copy={copy} reduceMotion={reduceMotion} />
      <MarqueeBand items={copy.marqueeTwo} variant="secondary" />
      <TestimonialsSection locale={activeLocale} copy={copy} reduceMotion={reduceMotion} />
      <ProcessSection copy={copy} reduceMotion={reduceMotion} />
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

function MarqueeBand({ items, variant }: { items: readonly string[]; variant: 'primary' | 'secondary' }) {
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

function BenefitsSection({
  title,
  items,
  accent,
  reduceMotion,
}: {
  title: string;
  items: readonly string[];
  accent: 'lime' | 'cyan';
  reduceMotion: boolean | null;
}) {
  const accentStyles = {
    lime: {
      number: 'text-[var(--color-lime)]',
      bar: 'bg-[var(--color-lime)]',
      glow: 'bg-[var(--color-lime)]/10',
      border: 'hover:border-[var(--color-lime)]/35',
    },
    cyan: {
      number: 'text-cyan-300',
      bar: 'bg-cyan-300',
      glow: 'bg-cyan-400/10',
      border: 'hover:border-cyan-300/35',
    },
  }[accent];

  return (
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className={`absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full blur-[120px] ${accentStyles.glow}`} />
      <div className="site-container relative">
        <h2
          className="max-w-3xl text-[2.25rem] font-black leading-[1] text-white lg:text-[4rem]"
          style={{ fontFamily: 'var(--font-title)' }}
        >
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
              className={`rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition-colors ${accentStyles.border}`}
            >
              <span className={`text-sm font-black ${accentStyles.number}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={`mt-5 h-1 w-10 rounded-full ${accentStyles.bar}`} />
              <p className="mt-5 text-lg font-semibold leading-snug text-white">{item}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PortfolioSection({
  copy,
  reduceMotion,
}: {
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  const featuredPortfolio = useMemo(
    () => portfolioItems.filter((item) => item.category === 'sites').slice(0, 3),
    []
  );

  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <h2
              className="text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {copy.portfolioTitle}
            </h2>
            <p className="mt-6 text-lg leading-[1.7] text-white/64">{copy.portfolioText}</p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-6 text-sm font-bold text-white transition-all duration-300 hover:border-[var(--color-lime)]/60 hover:text-[var(--color-lime)]"
          >
            {copy.portfolioCta}
          </Link>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredPortfolio.map((item, index) => (
            <motion.article
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] transition-colors hover:border-[var(--color-lime)]/35"
            >
              <Link href={`/portfolio/${item.slug}`} className="block h-full">
                <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(57,255,20,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))]">
                  <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:28px_28px]" />
                  <div className="absolute inset-x-5 top-5 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-lime)]">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-white/52">{item.year}</span>
                    </div>
                    <div className="mt-4 h-3 w-2/3 rounded-full bg-white/20" />
                    <div className="mt-3 h-3 w-1/2 rounded-full bg-[var(--color-lime)]/35" />
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {item.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="h-8 rounded-lg border border-white/10 bg-white/[0.06]" />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-white/46">{item.client}</div>
                    <div className="mt-2 text-2xl font-black leading-none text-white">{item.title}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-lime)]">
                    {item.client}
                  </div>
                  <h3 className="mt-3 text-xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-[1.65] text-white/62">{item.shortDescription}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/62"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({
  locale,
  copy,
  reduceMotion,
}: {
  locale: LocaleKey;
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  const proofCards = PROOF_CARDS[locale];

  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <h2
          className="max-w-3xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          {copy.testimonialsTitle}
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {proofCards.map((proofCard, index) => (
            <motion.article
              key={proofCard.title}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-lime)]">
                {proofCard.label}
              </div>
              <h3 className="mt-6 text-2xl font-black leading-tight text-white">{proofCard.title}</h3>
              <p className="mt-5 text-base leading-[1.7] text-white/64">{proofCard.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({
  copy,
  reduceMotion,
}: {
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <h2
          className="max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          {copy.processTitle}
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.process.map(([title, text], index) => (
            <motion.article
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime)]/10 text-sm font-black text-[var(--color-lime)]">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-8 text-2xl font-black text-white">{title}</h3>
              <p className="mt-4 text-sm leading-[1.7] text-white/62">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
