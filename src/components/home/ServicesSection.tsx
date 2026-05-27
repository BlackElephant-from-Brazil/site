'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { reportReservarHorarioConversion } from '@/lib/analytics/google-ads';

type ServiceCard = {
  index: string;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  delivery: string;
  icon: ReactNode;
  /** Quando true, destaca o card com lime accent (oferta fechada e ágil). */
  highlight?: boolean;
  /** URL externa (Stripe Checkout). Quando ausente, leva para /contact. */
  checkoutUrl?: string;
};

const SERVICES: ServiceCard[] = [
  {
    index: '/01',
    title: 'Site institucional completo',
    description:
      'Presença online profissional, otimizada para SEO, performance e conversão.',
    price: 'R$ 3.500',
    priceNote: 'valor fechado',
    delivery: '5 dias úteis',
    highlight: true,
    checkoutUrl: 'https://buy.stripe.com/test_14AfZh3RB9dTgBS9icenS02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </svg>
    ),
  },
  {
    index: '/02',
    title: 'Landing page completa',
    description:
      'Página de conversão focada em campanha, produto ou captação de leads.',
    price: 'R$ 1.889',
    priceNote: 'valor fechado',
    delivery: '3 dias úteis',
    highlight: true,
    checkoutUrl: 'https://buy.stripe.com/test_7sYfZh5ZJ0Hn4TacuoenS01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    index: '/03',
    title: 'Softwares sob medida',
    description:
      'Sistemas web e desktop construídos especificamente para a sua operação.',
    price: 'Sob projeto',
    priceNote: 'orçamento dedicado',
    delivery: 'Definido por escopo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 8l-5 4 5 4M15 8l5 4-5 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    index: '/04',
    title: 'Aplicativos mobile',
    description:
      'Apps nativos para iOS e Android ou PWA pensados para a sua audiência.',
    price: 'Sob projeto',
    priceNote: 'orçamento dedicado',
    delivery: 'Definido por escopo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="3" width="12" height="18" rx="2.5" />
        <path d="M11 18h2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    index: '/05',
    title: 'Automações e IA',
    description:
      'Automatize processos repetitivos e amplie sua operação com IA aplicada.',
    price: 'Sob projeto',
    priceNote: 'orçamento dedicado',
    delivery: 'Definido por escopo',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function ServiceCardItem({ service }: { service: ServiceCard }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full p-7 lg:p-8 rounded-2xl flex flex-col"
      style={{
        background: service.highlight
          ? 'linear-gradient(150deg, rgba(57,255,20,0.06) 0%, rgba(15,15,15,0.7) 60%)'
          : 'linear-gradient(150deg, rgba(20,20,20,0.7) 0%, rgba(12,12,12,0.5) 100%)',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        border: service.highlight
          ? '1px solid rgba(57,255,20,0.32)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
      }}
    >
      {/* Header: index + ícone */}
      <div className="flex items-start justify-between mb-7">
        <span
          className="text-[11px] font-bold tabular-nums tracking-[0.22em]"
          style={{
            fontFamily: 'var(--font-title)',
            color: service.highlight ? 'var(--color-lime)' : 'rgba(255,255,255,0.4)',
          }}
        >
          {service.index}
        </span>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
          style={{
            backgroundColor: service.highlight
              ? 'rgba(57,255,20,0.12)'
              : 'rgba(255,255,255,0.04)',
            border: service.highlight
              ? '1px solid rgba(57,255,20,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
            color: service.highlight ? 'var(--color-lime)' : 'rgba(255,255,255,0.6)',
          }}
        >
          {service.icon}
        </div>
      </div>

      {/* Título */}
      <h3
        className="text-[1.35rem] lg:text-[1.5rem] leading-[1.15] tracking-[-0.02em] mb-3"
        style={{
          fontFamily: 'var(--font-title)',
          color: 'var(--foreground)',
          fontWeight: 700,
        }}
      >
        {service.title}
      </h3>

      {/* Descrição */}
      <p
        className="text-[14px] lg:text-[15px] leading-[1.55] mb-7 flex-grow"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        {service.description}
      </p>

      {/* Divider */}
      <div
        aria-hidden
        className="h-px w-full mb-5"
        style={{
          background: service.highlight
            ? 'linear-gradient(90deg, rgba(57,255,20,0.4) 0%, transparent 100%)'
            : 'rgba(255,255,255,0.08)',
        }}
      />

      {/* Pricing row */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div
            className="text-[10.5px] font-semibold uppercase tracking-[0.2em] mb-1.5"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Investimento
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`leading-none tracking-[-0.02em] ${
                service.highlight ? 'text-[1.75rem] lg:text-[2rem]' : 'text-[1.35rem] lg:text-[1.5rem]'
              }`}
              style={{
                fontFamily: 'var(--font-title)',
                fontWeight: service.highlight ? 800 : 600,
                color: service.highlight ? 'var(--color-lime)' : 'var(--foreground)',
              }}
            >
              {service.price}
            </span>
          </div>
          <div
            className="text-[11px] mt-1"
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'normal',
              fontWeight: 100,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {service.priceNote}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-[10.5px] font-semibold uppercase tracking-[0.2em] mb-1.5"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Entrega
          </div>
          <div
            className="text-[14px] lg:text-[15px] leading-tight"
            style={{
              fontFamily: 'var(--font-title)',
              fontWeight: 600,
              color: 'var(--foreground)',
            }}
          >
            {service.delivery}
          </div>
        </div>
      </div>

      {/* CTA — checkout externo (Stripe) ou contato interno */}
      {service.checkoutUrl ? (
        <a
          href={service.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-between gap-2 px-5 py-3 rounded-xl font-semibold text-[13px] transition-all duration-300 mt-auto"
          style={{
            backgroundColor: service.highlight ? 'var(--color-lime)' : 'rgba(255,255,255,0.05)',
            color: service.highlight ? '#0a0a0a' : 'var(--foreground)',
            border: service.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span>Solicitar agora</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ) : (
        <a
          href="https://calendly.com/guilherme-blackelephant/30min"
          target="_blank"
          rel="noopener noreferrer"
          onClick={reportReservarHorarioConversion}
          className="inline-flex items-center justify-between gap-2 px-5 py-3 rounded-xl font-semibold text-[13px] transition-all duration-300 mt-auto"
          style={{
            backgroundColor: service.highlight ? 'var(--color-lime)' : 'rgba(255,255,255,0.05)',
            color: service.highlight ? '#0a0a0a' : 'var(--foreground)',
            border: service.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span>Solicitar agora</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </motion.article>
  );
}

export function ServicesSection() {
  return (
    <section
      className="relative py-24 lg:py-36 overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background atmosphere */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[160px]"
          style={{ backgroundColor: 'var(--color-lime)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-14 lg:mb-20"
        >
          <div className="flex items-center gap-3 mb-5">
            <span
              aria-hidden
              className="h-px w-10"
              style={{ backgroundColor: 'var(--color-lime)' }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.32em]"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
            >
              Nossas frentes
            </span>
          </div>

          <h2
            className="leading-[1] tracking-[-0.03em] text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.5rem] mb-6"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
              fontWeight: 800,
            }}
          >
            Como podemos te{' '}
            <em
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'normal',
                fontWeight: 100,
                color: 'var(--color-lime)',
              }}
            >
              ajudar hoje?
            </em>
          </h2>

          <p
            className="text-[1.05rem] lg:text-[1.15rem] leading-[1.55] max-w-2xl"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-primary)',
            }}
          >
            Do site institucional pronto em poucos dias ao sistema sob medida construído com sua
            equipe. Escolha o ponto de partida; nós cuidamos do resto.
          </p>
        </motion.div>

        {/* Cards de oferta fechada (preço definido) — 2 colunas em destaque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 mb-5 lg:mb-6">
          {SERVICES.filter((s) => s.highlight).map((service, i) => (
            <motion.div
              key={service.index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <ServiceCardItem service={service} />
            </motion.div>
          ))}
        </div>

        {/* Cards sob projeto — 3 colunas mais discretas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {SERVICES.filter((s) => !s.highlight).map((service, i) => (
            <motion.div
              key={service.index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <ServiceCardItem service={service} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA — fala outro tipo de projeto */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 lg:mt-20 mx-1 sm:mx-0 overflow-hidden rounded-[28px] p-7 sm:p-9 lg:p-12 text-center"
          style={{
            background:
              'radial-gradient(circle at 18% 0%, rgba(57,255,20,0.30) 0%, rgba(57,255,20,0.10) 28%, transparent 48%), linear-gradient(135deg, rgba(57,255,20,0.18) 0%, rgba(24,24,24,0.95) 42%, rgba(10,10,10,0.96) 100%)',
            border: '1px solid rgba(57,255,20,0.24)',
            boxShadow:
              '0 24px 70px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          <h2
            className="text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] leading-[1.02] tracking-[-0.03em]"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
            }}
          >
            Tem algum projeto em mente?
          </h2>
          <p
            className="mx-auto mt-4 max-w-[32rem] text-[15px] sm:text-[16px] leading-[1.55]"
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontFamily: 'var(--font-primary)',
            }}
          >
            Fale com nossos especialistas para receber as melhores orientações para o seu projeto.
          </p>
          <a
            href="https://calendly.com/guilherme-blackelephant/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={reportReservarHorarioConversion}
            className="mt-7 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14px] transition-all duration-300 active:scale-95"
            style={{
              backgroundColor: 'var(--color-lime)',
              color: '#0a0a0a',
              boxShadow:
                '0 0 0 1px rgba(57,255,20,0.35), 0 18px 38px rgba(57,255,20,0.20), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            Agendar consultoria de 1h
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
