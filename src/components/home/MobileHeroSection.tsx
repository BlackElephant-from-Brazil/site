'use client';

import { motion } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================================
// Conteúdo dos cases (espelho ao desktop scrollytelling, sem range/snap).
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
};

const CASES: Case[] = [
  {
    index: '01',
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
  },
  {
    index: '02',
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
  },
  {
    index: '03',
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
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Lime orb */}
      <div
        className={
          variant === 'hero'
            ? 'absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-[0.10] blur-[140px]'
            : 'absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full opacity-[0.06] blur-[120px]'
        }
        style={{ backgroundColor: 'var(--color-lime)' }}
      />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
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
// Direção: capa de revista editorial em modo dark, com "GRANDES" como peça
// dominante (display gigante, quase rompendo a margem direita por design),
// numeração editorial (ED. 01), hairlines de 1px, asterisco rotativo, e
// timestamp/créditos no rodapé. Staggered reveal letter-by-letter no onload.
// ============================================================================

const EASE_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

function RotatingAsterisk({ size = 26 }: { size?: number }) {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
      className="inline-block leading-none"
      style={{
        fontSize: size,
        color: 'var(--color-lime)',
        textShadow: '0 0 18px rgba(57,255,20,0.45)',
      }}
    >
      ✦
    </motion.span>
  );
}

function HeroBlock() {
  // "GRANDES" letra por letra para staggered reveal
  const grandesLetters = ['G', 'R', 'A', 'N', 'D', 'E', 'S'];

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
        className="absolute left-3 top-0 bottom-0 w-px z-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(57,255,20,0.45) 20%, rgba(57,255,20,0.45) 80%, transparent 100%)',
          opacity: 0.55,
        }}
      />

      {/* Cantos editoriais (corner brackets) — top left + top right */}
      <div aria-hidden className="absolute top-24 left-5 z-10 pointer-events-none">
        <div
          className="h-3 w-3"
          style={{
            borderTop: '1px solid rgba(57,255,20,0.6)',
            borderLeft: '1px solid rgba(57,255,20,0.6)',
          }}
        />
      </div>
      <div aria-hidden className="absolute top-24 right-5 z-10 pointer-events-none">
        <div
          className="h-3 w-3"
          style={{
            borderTop: '1px solid rgba(57,255,20,0.6)',
            borderRight: '1px solid rgba(57,255,20,0.6)',
          }}
        />
      </div>

      {/* ===== TOP FRAME — editorial header ===== */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="relative z-10 px-7 pt-28"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <span
            className="text-[10.5px] font-bold tabular-nums tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
          >
            ED. 01
          </span>
          <RotatingAsterisk size={22} />
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-px flex-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
          />
          <span
            className="text-[9.5px] font-semibold uppercase tracking-[0.32em] whitespace-nowrap"
            style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.55)' }}
          >
            BlackElephant · Eng. de Software
          </span>
        </div>
      </motion.header>

      {/* ===== Title block ===== */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-7 py-10">
        {/* Deck eyebrow — Capítulo */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE_OUT }}
          className="flex items-baseline gap-3 mb-6"
        >
          <span
            className="text-[10.5px] font-bold tabular-nums tracking-[0.28em]"
            style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.35)' }}
          >
            /00
          </span>
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.28em]"
            style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.45)' }}
          >
            Manifesto
          </span>
        </motion.div>

        {/* Title — "gostamos de" (serif italic, low contrast) */}
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT }}
          className="block text-[1.55rem] leading-none mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            marginLeft: '0.15em',
          }}
        >
          gostamos de
        </motion.span>

        {/* GRANDES — display tipográfico monumental, letra por letra.
            font-size escala com viewport mas é limitado para evitar overflow
            em telas estreitas (320–430px). Tracking afrouxado de -0.06em para
            -0.04em — em Sora 900 ultra-bold, valores muito agressivos
            sobrepunham as letras. */}
        <h1
          className="relative flex items-end leading-[0.85] tracking-[-0.04em]"
          style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 900,
            fontSize: 'clamp(2.75rem, 15.5vw, 5.25rem)',
            color: 'var(--color-lime)',
          }}
        >
          {grandesLetters.map((letter, i) => (
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
              style={{
                textShadow: '0 0 24px rgba(57,255,20,0.18)',
              }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* desafios. — em estilo display normal, levemente recuado */}
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE_OUT }}
          className="block text-[2.35rem] leading-[0.95] tracking-[-0.02em] mt-2"
          style={{
            fontFamily: 'var(--font-title)',
            fontWeight: 700,
            color: 'var(--foreground)',
            paddingLeft: '0.04em',
          }}
        >
          desafios<span style={{ color: 'var(--color-lime)' }}>.</span>
        </motion.span>

        {/* Hairline divider antes do deck */}
        <motion.div
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE_OUT }}
          className="origin-left mt-8 h-px w-20"
          style={{
            background:
              'linear-gradient(90deg, var(--color-lime), transparent)',
          }}
        />

        {/* Deck/sublinha */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT }}
          className="mt-5 text-[15px] leading-[1.55] max-w-[26rem]"
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontFamily: 'var(--font-primary)',
          }}
        >
          Estamos aqui para resolver os problemas mais complexos da sua empresa
          e te dar{' '}
          <em
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--color-lime)',
            }}
          >
            escala
          </em>
          .
        </motion.p>

        {/* CTA + decoração */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: EASE_OUT }}
          className="mt-8 flex items-center gap-4"
        >
          <a
            href="https://calendly.com/guilherme-blackelephant/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold text-[14px] transition-all duration-300 active:scale-95"
            style={{
              backgroundColor: 'var(--color-lime)',
              color: '#0a0a0a',
              boxShadow:
                '0 0 0 1px rgba(57,255,20,0.35), 0 14px 28px rgba(57,255,20,0.22), inset 0 1px 0 rgba(255,255,255,0.35)',
              fontFamily: 'var(--font-title)',
            }}
          >
            <span>Entrar em contato</span>
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

          {/* Counter editorial — pequena "stat" decorativa */}
          <div
            className="flex flex-col items-start leading-tight"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              30 min
            </span>
            <span
              className="text-[10px]"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              sem compromisso
            </span>
          </div>
        </motion.div>
      </div>

      {/* ===== BOTTOM FRAME — editorial footer ===== */}
      <motion.footer
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: EASE_OUT }}
        className="relative z-10 px-7 pb-10"
      >
        <div
          aria-hidden
          className="h-px w-full mb-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
              className="inline-block leading-none text-[14px]"
              style={{ color: 'var(--color-lime)' }}
            >
              ↓
            </motion.span>
            <span
              className="text-[9.5px] font-semibold uppercase tracking-[0.3em]"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'rgba(255,255,255,0.55)',
              }}
            >
              Cases reais abaixo
            </span>
          </div>
          <span
            className="text-[9.5px] tabular-nums tracking-[0.22em]"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'rgba(255,255,255,0.35)',
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
// Section header before cases
// ============================================================================

function CasesHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="px-6 mb-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          aria-hidden
          className="h-px w-8"
          style={{ backgroundColor: 'var(--color-lime)' }}
        />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.28em]"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
        >
          Cases de sucesso
        </span>
      </div>
      <h2
        className="leading-[1] tracking-[-0.025em] text-[2.25rem]"
        style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)', fontWeight: 700 }}
      >
        Resultados que{' '}
        <em
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--color-lime)',
          }}
        >
          comprovam
        </em>
        .
      </h2>
    </motion.div>
  );
}

// ============================================================================
// Single case card
// ============================================================================

function CaseCard({ data, position }: { data: Case; position: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[20px] p-6"
      style={{
        background:
          'linear-gradient(155deg, rgba(20,20,20,0.85) 0%, rgba(12,12,12,0.7) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow:
          '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)',
      }}
    >
      <AtmosphereBg variant="case" />

      {/* Lime accent thread vertical */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-[2px]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, var(--color-lime) 50%, transparent 100%)',
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
        {/* Pill: CASE DE SUCESSO · NN/03 */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
          style={{
            backgroundColor: 'rgba(57,255,20,0.12)',
            border: '1px solid rgba(57,255,20,0.35)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: 'var(--color-lime)',
              boxShadow: '0 0 8px rgba(57,255,20,0.7)',
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
          >
            Case de Sucesso
          </span>
          <span
            aria-hidden
            className="w-px h-3"
            style={{ backgroundColor: 'rgba(57,255,20,0.35)' }}
          />
          <span
            className="text-[10px] font-bold tabular-nums tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
          >
            {data.index} / {data.total}
          </span>
        </div>

        {/* Sector chip + Case name */}
        <div className="mb-1">
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-title)', color: 'rgba(255,255,255,0.45)' }}
          >
            Setor · {data.sector}
          </span>
        </div>
        <h3
          className="text-[1.65rem] leading-[1.05] tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)', fontWeight: 700 }}
        >
          {data.name}
        </h3>

        {/* Decorative gradient line */}
        <div
          aria-hidden
          className="mt-5 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(57,255,20,0.55) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)',
          }}
        />

        {/* Metric */}
        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span
              className="text-[4rem] sm:text-[4.6rem] leading-none tabular-nums tracking-[-0.05em]"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--color-lime)',
                fontWeight: 800,
                textShadow: '0 0 24px rgba(57,255,20,0.22)',
              }}
            >
              {data.metric}
            </span>
            <span
              className="text-[1.6rem] sm:text-[1.85rem] leading-none"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--color-lime)',
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
              style={{ backgroundColor: 'var(--color-lime)', opacity: 0.7 }}
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
                    color: 'var(--color-lime)',
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
    </motion.article>
  );
}

// ============================================================================
// Cases block
// ============================================================================

function CasesBlock() {
  return (
    <div
      className="relative pt-16 pb-20"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <CasesHeader />

      <div className="px-4 space-y-5">
        {CASES.map((c, i) => (
          <CaseCard key={c.index} data={c} position={i + 1} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Outer wrapper — só renderiza no mobile.
// ============================================================================

export function MobileHeroSection() {
  // Default false no SSR — não duplica conteúdo do desktop scrollytelling.
  const isMobile = useMediaQuery('(max-width: 1023.98px)', false);
  if (!isMobile) return null;

  return (
    <section style={{ backgroundColor: 'var(--background)' }}>
      <HeroBlock />
      <CasesBlock />
    </section>
  );
}
