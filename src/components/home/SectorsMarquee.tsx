'use client';

import { motion } from 'framer-motion';

type Sector = { name: string; style?: 'italic' };

const SECTORS: Sector[] = [
  { name: 'Agro' },
  { name: 'Contabilidade', style: 'italic' },
  { name: 'Financeiro' },
  { name: 'Logística', style: 'italic' },
  { name: 'Jurídico' },
  { name: 'Serviços', style: 'italic' },
];

function Asterisk() {
  return (
    <span
      aria-hidden
      className="inline-block mx-4 lg:mx-7 text-[1.5rem] lg:text-[2rem]"
      style={{
        color: 'var(--color-lime)',
        transform: 'translateY(-0.05em)',
        opacity: 0.85,
      }}
    >
      ✦
    </span>
  );
}

export function SectorsMarquee() {
  // 3x para garantir loop visualmente contínuo em viewports largos
  const loop = [...SECTORS, ...SECTORS, ...SECTORS];

  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{
        backgroundColor: 'var(--background-secondary)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Background lime atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--color-lime) 0%, transparent 70%)',
        }}
      />

      <div className="site-container mb-12 lg:mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              aria-hidden
              className="h-px w-10"
              style={{ backgroundColor: 'var(--color-lime)' }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.32em]"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
            >
              Verticais
            </span>
          </div>
          <h2
            className="leading-[1] tracking-[-0.025em] text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem]"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
              fontWeight: 700,
            }}
          >
            Setores que atendemos
          </h2>
        </motion.div>
      </div>

      {/* Marquee track — direção invertida (esquerda → direita) */}
      <div className="marquee-fade relative z-10">
        <div
          className="flex items-center w-max marquee-track marquee-reverse whitespace-nowrap"
          style={{ ['--marquee-duration' as string]: '38s' }}
        >
          {loop.map((sector, i) => (
            <span key={i} className="flex items-center">
              <span
                className="leading-none text-[2.25rem] sm:text-[3rem] lg:text-[4rem] xl:text-[4.5rem] tracking-[-0.03em]"
                style={{
                  fontFamily: sector.style === 'italic' ? 'var(--font-serif)' : 'var(--font-title)',
                  fontStyle: sector.style === 'italic' ? 'italic' : 'normal',
                  fontWeight: sector.style === 'italic' ? 400 : 700,
                  color: sector.style === 'italic' ? 'var(--color-lime)' : 'var(--foreground)',
                }}
              >
                {sector.name}
              </span>
              <Asterisk />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
