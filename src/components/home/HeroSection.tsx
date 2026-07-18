'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { reportReservarHorarioConversion } from '@/lib/analytics/google-ads';

// ============================================================================
// Conteúdo dos cases.
// ============================================================================

type Case = {
  index: string;
  total: string;
  name: string;
  sector: string;
  metric: string;
  metricSuffix: string;
  metricLabel: string;
  title: { text: string; italic?: boolean }[];
  description: string;
  images: { src: string; alt: string; portrait?: boolean }[];
};

const CASES: Case[] = [
  {
    index: '01',
    total: '03',
    name: 'Banco Regional',
    sector: 'Financeiro',
    metric: '−90',
    metricSuffix: '%',
    metricLabel: 'em erros operacionais',
    title: [
      { text: 'Precisão onde não há espaço para' },
      { text: 'falhas', italic: true },
      { text: '.' },
    ],
    description:
      'Plataforma bancária que substituiu processos manuais críticos e praticamente zerou os erros humanos na operação.',
    images: [
      { src: '/portfolio/banco/1.png', alt: 'Tela do sistema bancário - visão geral' },
      { src: '/portfolio/banco/2.png', alt: 'Tela do sistema bancário - operação' },
      { src: '/portfolio/banco/3.png', alt: 'Tela do sistema bancário - dados financeiros' },
      { src: '/portfolio/banco/4.png', alt: 'Tela do sistema bancário - gestão' },
    ],
  },
  {
    index: '02',
    total: '03',
    name: 'Transportadora Regional',
    sector: 'Logística',
    metric: 'R$100k',
    metricSuffix: '+',
    metricLabel: 'economizados por ano',
    title: [
      { text: 'Automações que geram' },
      { text: 'economia', italic: true },
      { text: 'real.' },
    ],
    description:
      'Sistema de gestão operacional que eliminou desperdícios invisíveis e transformou a operação de uma transportadora regional.',
    images: [
      { src: '/portfolio/logistica/1.png', alt: 'Tela do sistema logístico - painel operacional' },
      { src: '/portfolio/logistica/2.png', alt: 'Tela do sistema logístico - controle de viagens' },
      { src: '/portfolio/logistica/3.png', alt: 'Tela do sistema logístico - indicadores' },
      { src: '/portfolio/logistica/4.png', alt: 'Tela do sistema logístico - gestão' },
    ],
  },
  {
    index: '03',
    total: '03',
    name: 'Empresa de Serviços',
    sector: 'Serviços',
    metric: '30',
    metricSuffix: ' dias',
    metricLabel: 'do zero ao deploy',
    title: [
      { text: 'Sistema + 2 apps. Em' },
      { text: '1 mês', italic: true },
      { text: '.' },
    ],
    description:
      'Plataforma de gestão completa e dois aplicativos mobile entregues em trinta dias. Do briefing aos apps nas lojas.',
    images: [
      { src: '/portfolio/servicos/1.png', alt: 'Tela da plataforma de serviços - dashboard' },
      { src: '/portfolio/servicos/2.png', alt: 'Tela da plataforma de serviços - agenda' },
      { src: '/portfolio/servicos/3.png', alt: 'Tela da plataforma de serviços - operação' },
      { src: '/portfolio/servicos/4.png', alt: 'Tela da plataforma de serviços - gestão' },
      { src: '/portfolio/servicos/5.png', alt: 'Aplicativo mobile de serviços - tela inicial', portrait: true },
      { src: '/portfolio/servicos/6.png', alt: 'Aplicativo mobile de serviços - detalhes', portrait: true },
      { src: '/portfolio/servicos/7.png', alt: 'Aplicativo mobile de serviços - acompanhamento', portrait: true },
    ],
  },
];

// ============================================================================
// Background atmosphere — usado tanto no hero quanto entre cases.
// ============================================================================

function AtmosphereBg({ variant = 'hero' }: { variant?: 'hero' | 'case' }) {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18,59,79,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(18,59,79,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Teal orb */}
      <div
        className={
          variant === 'hero'
            ? 'absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-[0.10] blur-[140px]'
            : 'absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full opacity-[0.08] blur-[120px]'
        }
        style={{ backgroundColor: 'var(--color-brand)' }}
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
}

// ============================================================================
// Hero block — Editorial Magazine Cover + Cyberpunk Cold
// ----------------------------------------------------------------------------
// Direção: capa de revista editorial em modo dark, com "GRANDES/PROGRAMAÇÃO"
// como peça dominante. Layout único para todas as telas — em telas largas o
// conteúdo ganha mais respiro (padding, tipografia e largura máxima maiores
// via variantes `lg:`), mas a composição é a mesma do mobile.
// ============================================================================

const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

const HERO_MARQUEE_ITEMS = [
  'APPs',
  'Landing Pages',
  'Automações',
  'Agentes de IA',
  'Site institucional',
  'Blog',
  'eCommerce',
  'Sistemas Embarcados',
];

const SYSTEM_BENEFITS = [
  'Economize com sistemas caros de terceiros',
  'Nunca mais use planilhas Excel para gerenciar seus processos',
  'Relatórios personalizados focados no crescimento da sua empresa',
  'Economize tempo com automações',
  'Melhore a qualidade do seu atendimento',
  'Tenha segurança nos dados dos seus clientes, fornecedores e de toda a empresa',
];

function HeroBlock() {
  // Palavra de impacto letra por letra para staggered reveal.
  const programmingLetters = Array.from('PROGRAMAÇÃO');
  const marqueeItems = [...HERO_MARQUEE_ITEMS, ...HERO_MARQUEE_ITEMS];

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <AtmosphereBg variant="hero" />

      {/* Linha vertical lime — fio condutor do lado esquerdo do conteúdo */}
      <div
        aria-hidden
        className="absolute left-3 lg:left-8 top-0 bottom-0 w-px z-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(31,111,107,0.45) 20%, rgba(31,111,107,0.45) 80%, transparent 100%)',
          opacity: 0.55,
        }}
      />

      {/* Cantos editoriais (corner brackets) — top left + top right */}
      <div aria-hidden className="absolute top-24 left-5 lg:left-10 z-10 pointer-events-none">
        <div
          className="h-3 w-3"
          style={{
            borderTop: '1px solid rgba(31,111,107,0.6)',
            borderLeft: '1px solid rgba(31,111,107,0.6)',
          }}
        />
      </div>
      <div aria-hidden className="absolute top-24 right-5 lg:right-10 z-10 pointer-events-none">
        <div
          className="h-3 w-3"
          style={{
            borderTop: '1px solid rgba(31,111,107,0.6)',
            borderRight: '1px solid rgba(31,111,107,0.6)',
          }}
        />
      </div>

      {/* ===== TOP FRAME — editorial header ===== */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="relative z-10 pt-28"
      >
        <div className="relative overflow-hidden mx-4 lg:mx-auto lg:max-w-2xl rounded-full marquee-fade">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(31,111,107,0.08), rgba(18,59,79,0.04), rgba(232,169,60,0.08))',
              border: '1px solid rgba(18,59,79,0.10)',
              boxShadow: 'var(--shadow-soft)',
            }}
          />
          <motion.div
            aria-label="Serviços BlackElephant"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
            className="relative z-10 flex w-max items-center gap-3 py-2.5 px-3"
          >
            {marqueeItems.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] whitespace-nowrap"
                  style={{
                    fontFamily: 'var(--font-title)',
                    color: 'var(--foreground-muted)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(18,59,79,0.08)',
                  }}
                >
                  {item}
                </span>
                <span
                  aria-hidden
                  className="relative h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-brand)',
                  }}
                />
              </span>
            ))}
          </motion.div>
        </div>

        <div className="mt-7 flex justify-center px-7">
          <span
            className="relative inline-flex items-center justify-center rounded-full px-5 py-2 text-[10.5px] font-bold uppercase tracking-[0.24em] whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--color-brand)',
              background:
                'linear-gradient(135deg, rgba(31,111,107,0.12), rgba(255,255,255,0.9))',
              border: '1px solid rgba(31,111,107,0.28)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            Consultoria de TI
          </span>
        </div>
      </motion.header>

      {/* ===== Title block ===== */}
      <div className="relative z-10 flex flex-1 flex-col justify-end lg:justify-center px-7 lg:px-20 xl:px-28 pt-16 pb-6 lg:mx-auto lg:max-w-5xl lg:w-full">
        {/* Title — linha introdutória */}
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT }}
          className="block text-[1.28rem] lg:text-[1.6rem] leading-none mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            letterSpacing: '0.01em',
            color: 'var(--foreground-muted)',
            marginLeft: '0.15em',
          }}
        >
          a empresa de
        </motion.span>

        {/* PROGRAMAÇÃO — display tipográfico monumental, letra por letra.
            Tamanho via classe Tailwind (não inline style) para que lg:/xl:
            consigam sobrepor o clamp() do mobile. */}
        <h1
          className="relative flex items-end leading-[0.88] lg:leading-[0.85] tracking-[-0.035em] lg:tracking-[-0.03em] text-[clamp(2.15rem,10.5vw,4rem)] lg:text-[6rem] xl:text-[7.5rem]"
          style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 900,
            color: 'var(--color-brand)',
          }}
        >
          {programmingLetters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.22 + i * 0.045,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* Fechamento do título */}
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE_OUT }}
          className="block text-[1.92rem] lg:text-[3rem] xl:text-[3.5rem] leading-[1.02] tracking-[-0.01em] mt-2"
          style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 700,
            color: 'var(--foreground)',
            paddingLeft: '0.04em',
          }}
        >
          que você procura<span style={{ color: 'var(--color-accent)' }}>.</span>
        </motion.span>

        {/* Hairline divider antes do deck */}
        <motion.div
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE_OUT }}
          className="origin-left mt-8 h-px w-20 lg:w-28"
          style={{
            background:
              'linear-gradient(90deg, var(--color-brand), transparent)',
          }}
        />

        {/* Deck/sublinha */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT }}
          className="mt-5 text-[15px] lg:text-[19px] leading-[1.55] max-w-[26rem] lg:max-w-[34rem]"
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: 'var(--font-primary)',
          }}
        >
          Substitua as planilhas de Excel e economize as{' '}
          <strong
            style={{
              fontWeight: 700,
              color: 'var(--color-brand)',
            }}
          >
            licenças caras
          </strong>
          {' '}de software criando um sistema exclusivo para sua empresa.
        </motion.p>

        {/* CTA + decoração */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: EASE_OUT }}
          className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >
          <a
            href="https://calendly.com/guilherme-blackelephant/30min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={reportReservarHorarioConversion}
            className="group inline-flex items-center justify-center gap-2.5 px-5 lg:px-7 py-3.5 lg:py-4 rounded-full font-semibold text-[14px] lg:text-[15px] transition-all duration-300 active:scale-95 hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accent-ink)',
              boxShadow: 'var(--shadow-cta)',
              fontFamily: 'var(--font-title)',
            }}
          >
            <span>Agendar consultoria de 1h</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

          <a
            href="https://wa.me/5519978055531"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 lg:px-7 py-3.5 lg:py-4 rounded-full font-semibold text-[13px] lg:text-[14px] transition-all duration-300 active:scale-95 hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--color-brand)',
              color: 'var(--color-brand)',
              boxShadow: 'var(--shadow-soft)',
              fontFamily: 'var(--font-title)',
            }}
          >
            Tirar dúvidas no whatsapp
          </a>
        </motion.div>
      </div>

      {/* ===== BOTTOM FRAME — editorial footer ===== */}
      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: EASE_OUT }}
        className="relative z-10 px-7 lg:px-20 xl:px-28 pb-10"
      >
        <div
          aria-hidden
          className="h-px w-full mb-4"
          style={{ backgroundColor: 'var(--color-line)' }}
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
              className="inline-block leading-none text-[14px]"
              style={{ color: 'var(--color-brand)' }}
            >
              ↓
            </motion.span>
            <span
              className="text-[9.5px] font-semibold uppercase tracking-[0.3em]"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--foreground-muted)',
              }}
            >
              Em números abaixo
            </span>
          </div>
          <span
            className="text-[9.5px] tabular-nums tracking-[0.22em]"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground-subtle)',
            }}
          >
            SP · 2026
          </span>
        </div>
      </motion.footer>
    </div>
  );
}

// ============================================================================
// Benefits block — reforço sobre sistemas exclusivos (fluxo mobile).
// ============================================================================

function SystemBenefitsBlock() {
  return (
    <div
      className="relative overflow-hidden px-6 py-20"
      style={{
        background:
          'linear-gradient(180deg, var(--background-secondary) 0%, var(--background) 34%, var(--background) 100%)',
        borderTop: '1px solid var(--color-line)',
      }}
    >
      <AtmosphereBg variant="case" />
      <div
        aria-hidden
        className="absolute inset-x-6 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(31,111,107,0.4), transparent)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-[27rem]"
      >
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden
              className="h-px w-8"
              style={{ backgroundColor: 'var(--color-brand)' }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--color-brand)' }}
            >
              Você merece o melhor
            </span>
          </div>

          <h2
            className="text-[2.08rem] leading-[1.02] tracking-[-0.025em]"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
              fontWeight: 800,
            }}
          >
            Benefícios de ter um sistema exclusivo para sua empresa
          </h2>
        </div>

        <p
          className="max-w-[24rem] text-[14.5px] leading-[1.55]"
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: 'var(--font-primary)',
          }}
        >
          Um sistema feito para a sua operação reduz desperdício, organiza processos e
          deixa sua equipe trabalhar com mais precisão.
        </p>

        <div
          className="relative mt-10 overflow-hidden rounded-[24px]"
          style={{
            background:
              'linear-gradient(155deg, #17516a 0%, #0e2f3f 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'var(--shadow-soft-lg)',
          }}
        >
          <div
            aria-hidden
            className="absolute left-[1.85rem] top-8 bottom-8 w-px"
            style={{
              background:
                'linear-gradient(180deg, rgba(232,169,60,0.7), rgba(232,169,60,0.16), transparent)',
            }}
          />
          {SYSTEM_BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-start gap-4 px-4 py-4"
              style={{
                borderBottom:
                  index === SYSTEM_BENEFITS.length - 1
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.075)',
              }}
            >
              <span
                className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(232,169,60,0.42)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="min-w-0">
                <span
                  className="mb-1 block text-[9px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: 'var(--font-title)',
                    color: 'rgba(255,217,138,0.85)',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p
                  className="text-[14px] leading-[1.45]"
                  style={{
                    fontFamily: 'var(--font-primary)',
                    color: 'rgba(255,255,255,0.82)',
                  }}
                >
                  {benefit}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Section header before cases
// ============================================================================

function CasesHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 lg:px-10 lg:max-w-7xl lg:mx-auto mb-10 lg:mb-14"
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          aria-hidden
          className="h-px w-8"
          style={{ backgroundColor: 'var(--color-brand)' }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--color-brand)' }}
        >
          Soluções que agregam
        </span>
      </div>
      <h2
        className="leading-[1] tracking-[-0.025em] text-[2.25rem] lg:text-[3.25rem]"
        style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)', fontWeight: 700 }}
      >
        Nossos 3 principais cases de sucesso
      </h2>
    </motion.div>
  );
}

// ============================================================================
// Single case card
// ============================================================================

function CaseImageCarousel({ data }: { data: Case }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const image = data.images[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) =>
      current === 0 ? data.images.length - 1 : current - 1,
    );
  }

  function goToNext() {
    setActiveIndex((current) =>
      current === data.images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <div className="relative mb-5 overflow-hidden rounded-[16px]">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.055), rgba(0,0,0,0.34))',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 30vw, 86vw"
          className={image.portrait ? 'object-contain p-2' : 'object-cover'}
          priority={data.index === '01' && activeIndex === 0}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(0,0,0,0.72))',
          }}
        />
      </div>

      {data.images.length > 1 && (
        <>
          <button
            type="button"
            aria-label={`Imagem anterior do case ${data.name}`}
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              backgroundColor: 'rgba(10,10,10,0.72)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'var(--foreground)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`Próxima imagem do case ${data.name}`}
            onClick={goToNext}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              backgroundColor: 'rgba(10,10,10,0.72)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'var(--foreground)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {data.images.map((item, index) => (
              <button
                key={item.src}
                type="button"
                aria-label={`Ver imagem ${index + 1} do case ${data.name}`}
                onClick={() => setActiveIndex(index)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: activeIndex === index ? 18 : 6,
                  backgroundColor:
                    activeIndex === index
                      ? '#ffd98a'
                      : 'rgba(255,255,255,0.38)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CaseCard({ data, position }: { data: Case; position: number }) {
  return (
    <article
      className="relative min-w-[86vw] lg:min-w-0 lg:w-full snap-center overflow-hidden rounded-[20px] p-5 lg:p-6"
      style={{
        background:
          'linear-gradient(155deg, #17516a 0%, #0e2f3f 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'var(--shadow-soft-lg)',
      }}
    >
      <AtmosphereBg variant="case" />

      {/* Accent thread vertical */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-[2px]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, var(--color-accent) 50%, transparent 100%)',
          opacity: 0.55,
        }}
      />

      {/* Glass reflection top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
      />

      <div className="relative z-10">
        <CaseImageCarousel data={data} />

        {/* Pill: CASE DE SUCESSO · NN/03 */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
          style={{
            backgroundColor: 'rgba(232,169,60,0.14)',
            border: '1px solid rgba(232,169,60,0.35)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: '#ffd98a',
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ fontFamily: 'var(--font-title)', color: '#ffd98a' }}
          >
            Case de Sucesso
          </span>
          <span
            aria-hidden
            className="w-px h-3"
            style={{ backgroundColor: 'rgba(232,169,60,0.35)' }}
          />
          <span
            className="text-[10px] font-bold tabular-nums tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-title)', color: '#ffd98a' }}
          >
            {data.index} / {data.total}
          </span>
        </div>

        {/* Sector chip + Case name */}
        <div className="mb-1">
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.55)' }}
          >
            Setor · {data.sector}
          </span>
        </div>
        <h3
          className="text-[1.65rem] leading-[1.05] tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontWeight: 700 }}
        >
          {data.name}
        </h3>

        {/* Decorative gradient line */}
        <div
          aria-hidden
          className="mt-5 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(232,169,60,0.55) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)',
          }}
        />

        {/* Metric */}
        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span
              className="text-[4rem] sm:text-[4.6rem] leading-none tabular-nums tracking-[-0.05em]"
              style={{
                fontFamily: 'var(--font-title)',
                color: '#ffd98a',
                fontWeight: 800,
              }}
            >
              {data.metric}
            </span>
            <span
              className="text-[1.6rem] sm:text-[1.85rem] leading-none"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#ffd98a',
                opacity: 0.85,
              }}
            >
              {data.metricSuffix}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span
              aria-hidden
              className="h-px w-5"
              style={{ backgroundColor: '#ffd98a', opacity: 0.7 }}
            />
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.6)' }}
            >
              {data.metricLabel}
            </span>
          </div>
        </div>

        {/* Title quote */}
        <p
          className="mt-6 text-[1.05rem] leading-[1.25] tracking-[-0.01em]"
          style={{
            fontFamily: 'var(--font-title)',
            color: 'rgba(255,255,255,0.92)',
            fontWeight: 500,
          }}
        >
          {data.title.map((part, i) =>
            part.italic ? (
              <span key={i}>
                {' '}
                <em
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: '#ffd98a',
                  }}
                >
                  {part.text}
                </em>
              </span>
            ) : (
              <span key={i}>
                {i > 0 ? ' ' : ''}
                {part.text}
              </span>
            ),
          )}
        </p>

        {/* Description */}
        <p
          className="mt-4 text-[14px] leading-[1.55]"
          style={{
            color: 'rgba(255,255,255,0.68)',
            fontFamily: 'var(--font-primary)',
          }}
        >
          {data.description}
        </p>

        {/* Position badge */}
        <div
          className="absolute right-5 top-5 text-[10px] font-bold tabular-nums tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.22)' }}
        >
          /{String(position).padStart(2, '0')}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// Cases block
// ============================================================================

function CasesBlock() {
  return (
    <div
      className="relative pt-16 pb-20 lg:pt-24 lg:pb-28"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <CasesHeader />

      <div className="flex snap-x snap-proximity gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:snap-none lg:px-10 lg:max-w-7xl lg:mx-auto">
        {CASES.map((c, i) => (
          <CaseCard key={c.index} data={c} position={i + 1} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Wrappers exportados
// ============================================================================

/** Hero — renderiza em todas as telas (editorial, sem Lottie/scroll-jacking). */
export function HeroSection() {
  return (
    <section style={{ backgroundColor: 'var(--background)' }}>
      <HeroBlock />
    </section>
  );
}

/** Bloco de benefícios — exclusivo do fluxo mobile (<1024px). */
export function MobileSystemBenefitsSection() {
  const isMobile = useMediaQuery('(max-width: 1023.98px)', false);
  if (!isMobile) return null;

  return (
    <section style={{ backgroundColor: 'var(--background)' }}>
      <SystemBenefitsBlock />
    </section>
  );
}

/** Cases/portfólio — renderiza em todas as telas (carrossel no mobile, grid no desktop). */
export function CasesSection() {
  return (
    <section style={{ backgroundColor: 'var(--background)' }}>
      <CasesBlock />
    </section>
  );
}
