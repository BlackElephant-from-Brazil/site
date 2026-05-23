'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type Stat = {
  index: string;
  value: number;
  suffix: string;
  label: string;
  kicker: string;
};

const STATS: Stat[] = [
  {
    index: '/01',
    value: 50,
    suffix: '+',
    label: 'Clientes',
    kicker: 'Empresas que confiam em nosso trabalho.',
  },
  {
    index: '/02',
    value: 100,
    suffix: '+',
    label: 'Projetos',
    kicker: 'Sistemas entregues e em operação.',
  },
  {
    index: '/03',
    value: 5,
    suffix: '+',
    label: 'Anos no mercado',
    kicker: 'De experiência em engenharia de software.',
  },
  {
    index: '/04',
    value: 98,
    suffix: '%',
    label: 'Satisfação',
    kicker: 'Em pesquisas internas com clientes ativos.',
  },
];

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          const startTime = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - t, 4);
            setDisplay(Math.floor(eased * value));
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration, started]);

  return <span ref={ref}>{display}</span>;
}

export function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-24 lg:py-36"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Single subtle lime orb — left */}
        <div className="absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full opacity-[0.07] blur-[140px]"
          style={{ backgroundColor: 'var(--color-lime)' }}
        />
        {/* Grid lines — subtle */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
      </div>

      <div className="site-container relative z-10">
        {/* Editorial header — asymmetric: title left, manifesto right */}
        <div className="grid grid-cols-12 gap-y-10 gap-x-6 lg:gap-x-12 mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-7"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span
                aria-hidden
                className="h-px w-10"
                style={{ backgroundColor: 'var(--color-lime)' }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.32em]"
                style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
              >
                Em números
              </span>
            </div>

            {/* Headline mixing display + serif italic */}
            <h2
              className="leading-[0.95] tracking-[-0.03em] text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.75rem]"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--foreground)',
                fontWeight: 800,
              }}
            >
              Resultado é o que{' '}
              <em
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: 'var(--color-lime)',
                }}
              >
                nos define
              </em>
              .
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-5 lg:pt-6"
          >
            <p
              className="text-[1.05rem] lg:text-[1.15rem] leading-[1.55]"
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 400,
              }}
            >
              Cada número aqui representa empresas reais transformadas por software bem feito,
              entregue dentro do prazo e construído para durar.
            </p>
            <div
              aria-hidden
              className="mt-6 h-px w-24"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-lime) 0%, transparent 100%)',
              }}
            />
          </motion.div>
        </div>

        {/* Stats grid — editorial brutalist */}
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.article
              key={stat.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`relative py-8 lg:py-10 px-4 lg:px-7 ${
                i < 2 ? 'border-b lg:border-b-0' : ''
              } ${
                i % 2 === 0 ? 'border-r' : ''
              } ${
                i === 2 ? 'lg:border-r' : ''
              }`}
              style={{
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              {/* Hairline top accent */}
              <div
                aria-hidden
                className="absolute left-4 lg:left-7 top-0 h-px w-12"
                style={{
                  backgroundColor: i === 0 ? 'var(--color-lime)' : 'rgba(255,255,255,0.2)',
                }}
              />

              {/* Index numbering — editorial */}
              <div
                className="text-[12px] font-bold tabular-nums tracking-[0.2em] mb-6 lg:mb-8"
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                {stat.index}
              </div>

              {/* Number — oversized display */}
              <div className="flex items-baseline gap-0.5 mb-3">
                <span
                  className="leading-none tabular-nums tracking-[-0.06em] text-[3.75rem] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem]"
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontWeight: 800,
                    color: 'var(--foreground)',
                  }}
                >
                  <AnimatedNumber value={stat.value} duration={2.2} />
                </span>
                <span
                  className="leading-none text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] xl:text-[3rem]"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'var(--color-lime)',
                    fontWeight: 400,
                  }}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Label — uppercase tracked */}
              <div
                className="text-[11px] lg:text-[12px] font-bold uppercase tracking-[0.22em] mb-4"
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--foreground)',
                }}
              >
                {stat.label}
              </div>

              {/* Kicker — serif italic editorial */}
              <p
                className="text-[13px] lg:text-[14px] leading-[1.5] max-w-[200px]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 400,
                }}
              >
                {stat.kicker}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Bottom hairline */}
        <div
          aria-hidden
          className="mt-0 h-px w-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
        />
      </div>
    </section>
  );
}
