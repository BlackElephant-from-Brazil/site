'use client';

import { motion, useReducedMotion } from 'framer-motion';

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
