'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

// Ferramentas de prototipagem que "resgatamos" e levamos à produção.
const PROTOTYPE_TOOLS = ['Lovable', 'Bolt', 'Codex', 'Claude Code', 'Cursor', 'Replit'];

// Imagem do hero. Troque por um caminho (ex.: '/hero/product.png') quando a arte
// estiver pronta; enquanto for null, renderiza um placeholder editorial.
const HERO_IMAGE_SRC: string | null = null;

const SYSTEM_BENEFITS = [
  'Economize com sistemas caros de terceiros',
  'Nunca mais use planilhas Excel para gerenciar seus processos',
  'Relatórios personalizados focados no crescimento da sua empresa',
  'Economize tempo com automações',
  'Melhore a qualidade do seu atendimento',
  'Tenha segurança nos dados dos seus clientes, fornecedores e de toda a empresa',
];

// ----------------------------------------------------------------------------
// Moldura de imagem do hero (coluna esquerda no desktop).
// ----------------------------------------------------------------------------

function HeroImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }}
      />
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,217,138,0.9)" strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" strokeLinecap="round" />
          <circle cx="6.5" cy="6.5" r="0.6" fill="rgba(255,217,138,0.9)" stroke="none" />
        </svg>
      </div>
      <span
        className="relative text-[11px] font-semibold uppercase tracking-[0.24em]"
        style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.55)' }}
      >
        {label}
      </span>
    </div>
  );
}

function HeroImageFrame({ placeholderLabel, badgeLabel }: { placeholderLabel: string; badgeLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT }}
      className="relative mx-auto w-full max-w-[30rem] lg:max-w-none"
    >
      {/* Glow petróleo atrás da moldura */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[40px]"
        style={{
          background:
            'radial-gradient(60% 55% at 35% 25%, rgba(31,111,107,0.18), transparent 72%)',
        }}
      />

      {/* Canto editorial */}
      <div
        aria-hidden
        className="absolute -top-3 -left-3 h-6 w-6"
        style={{
          borderTop: '1.5px solid rgba(31,111,107,0.55)',
          borderLeft: '1.5px solid rgba(31,111,107,0.55)',
        }}
      />

      {/* Moldura + espaço da imagem */}
      <div
        className="relative overflow-hidden rounded-[26px]"
        style={{
          aspectRatio: '4 / 5',
          background: 'linear-gradient(160deg, #17516a 0%, #0e2f3f 100%)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-soft-lg)',
        }}
      >
        {HERO_IMAGE_SRC ? (
          <Image
            src={HERO_IMAGE_SRC}
            alt={placeholderLabel}
            fill
            sizes="(min-width: 1024px) 44vw, 90vw"
            className="object-cover"
            priority
          />
        ) : (
          <HeroImagePlaceholder label={placeholderLabel} />
        )}
        {/* Reflexo de vidro no topo */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          }}
        />
      </div>

      {/* Selo flutuante "pronto para produção" */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT }}
        className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-2xl px-4 py-3"
        style={{
          background: 'var(--background-secondary)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-soft-lg)',
        }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(31,111,107,0.12)', color: 'var(--color-brand)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span
          className="text-[12.5px] font-bold uppercase tracking-[0.12em]"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--color-deep)' }}
        >
          {badgeLabel}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Hero — split editorial: imagem à esquerda, mensagem à direita (desktop);
// empilhado (texto → imagem) no mobile.
// ----------------------------------------------------------------------------

function HeroBlock() {
  const t = useTranslations('home.hero');

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

      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 pt-28 lg:pt-32 pb-16 lg:pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ===== Coluna esquerda — imagem (abaixo do texto no mobile) ===== */}
            <div className="order-2 lg:order-1">
              <HeroImageFrame placeholderLabel={t('imagePlaceholder')} badgeLabel={t('badge')} />
            </div>

            {/* ===== Coluna direita — mensagem ===== */}
            <div className="order-1 lg:order-2">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="mb-6 flex items-center gap-3"
              >
                <span aria-hidden className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} />
                <span
                  className="text-[10.5px] font-bold uppercase tracking-[0.28em]"
                  style={{ fontFamily: 'var(--font-title)', color: 'var(--color-brand)' }}
                >
                  {t('eyebrow')}
                </span>
              </motion.div>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: EASE_OUT }}
                className="text-[clamp(2.15rem,8vw,2.9rem)] lg:text-[clamp(2.6rem,3.6vw,3.7rem)] leading-[1.06] tracking-[-0.025em]"
                style={{ fontFamily: 'var(--font-title)', fontWeight: 800, color: 'var(--foreground)' }}
              >
                {t.rich('h1', {
                  hl: (chunks) => <span style={{ color: 'var(--color-brand)' }}>{chunks}</span>,
                  em: (chunks) => (
                    <em
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        color: 'var(--color-deep)',
                      }}
                    >
                      {chunks}
                    </em>
                  ),
                })}
              </motion.h1>

              {/* Subtítulo */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
                className="mt-6 max-w-[34rem] text-[15.5px] lg:text-[17px] leading-[1.62]"
                style={{ color: 'var(--foreground-muted)', fontFamily: 'var(--font-primary)' }}
              >
                {t('subtitle')}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32, ease: EASE_OUT }}
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <a
                  href="https://calendly.com/guilherme-blackelephant/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={reportReservarHorarioConversion}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full px-6 lg:px-7 py-3.5 lg:py-4 font-semibold text-[14px] lg:text-[15px] transition-all duration-300 active:scale-95 hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-accent-ink)',
                    boxShadow: 'var(--shadow-cta)',
                    fontFamily: 'var(--font-title)',
                  }}
                >
                  <span>{t('ctaPrimary')}</span>
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
                  className="inline-flex items-center justify-center rounded-full px-6 lg:px-7 py-3.5 lg:py-4 font-semibold text-[13px] lg:text-[14px] transition-all duration-300 active:scale-95 hover:scale-[1.02]"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    border: '1px solid var(--color-brand)',
                    color: 'var(--color-brand)',
                    boxShadow: 'var(--shadow-soft)',
                    fontFamily: 'var(--font-title)',
                  }}
                >
                  {t('ctaSecondary')}
                </a>
              </motion.div>

              {/* Prova: prototipagens que levamos à produção */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: EASE_OUT }}
                className="mt-10"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span aria-hidden className="h-px w-6" style={{ backgroundColor: 'var(--color-line)' }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                    style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground-subtle)' }}
                  >
                    {t('toolsLabel')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PROTOTYPE_TOOLS.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full px-3 py-1.5 text-[12px] font-medium"
                      style={{
                        fontFamily: 'var(--font-title)',
                        color: 'var(--foreground-muted)',
                        backgroundColor: 'var(--background-secondary)',
                        border: '1px solid var(--card-border)',
                        boxShadow: 'var(--shadow-soft)',
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
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
