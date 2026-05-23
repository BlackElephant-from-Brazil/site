'use client';

import { motion } from 'framer-motion';

type Review = {
  name: string;
  role: string;
  initial: string;
  accent: string;
  text: string;
};

const REVIEWS: Review[] = [
  {
    name: 'Marcelo Pereira',
    role: 'CEO, Logística SP',
    initial: 'M',
    accent: '#39FF14',
    text: 'Reduzimos 40% dos custos operacionais em seis meses. Equipe técnica acima da média e entregas sempre dentro do prazo combinado.',
  },
  {
    name: 'Ana Beatriz Almeida',
    role: 'Diretora Financeira',
    initial: 'A',
    accent: '#7dd3fc',
    text: 'Sistema sob medida que substituiu três planilhas e dois softwares antigos. Mudou completamente nossa rotina de fechamento mensal.',
  },
  {
    name: 'Carlos Eduardo Vianna',
    role: 'Sócio, Escritório Jurídico',
    initial: 'C',
    accent: '#fbbf24',
    text: 'Plataforma robusta, segura e intuitiva. Conseguimos atender mais clientes sem precisar contratar gente nova para a operação.',
  },
  {
    name: 'Juliana Costa',
    role: 'Gerente de Operações',
    initial: 'J',
    accent: '#f472b6',
    text: 'Atendimento próximo e consultivo. Sentimos que estavam pensando no nosso problema, não apenas vendendo um pacote pronto.',
  },
  {
    name: 'Rodrigo Mansur',
    role: 'Fundador, Startup B2B',
    initial: 'R',
    accent: '#a78bfa',
    text: 'Aplicativo desenvolvido em quatro semanas. Lançamos no prazo prometido ao investidor e captamos a próxima rodada com tração.',
  },
  {
    name: 'Patrícia Lemos',
    role: 'Gerente de Marketing',
    initial: 'P',
    accent: '#39FF14',
    text: 'Site institucional ficou impecável. Carregamento rápido, design moderno e a página já apareceu no Google em poucas semanas.',
  },
  {
    name: 'Fernando Tavares',
    role: 'Sócio, Contabilidade',
    initial: 'F',
    accent: '#7dd3fc',
    text: 'Automatizamos 80% das tarefas repetitivas. Time agora foca em consultoria de alto valor e parou de perder noite com retrabalho.',
  },
  {
    name: 'Mariana Oliveira',
    role: 'Coordenadora de TI',
    initial: 'M',
    accent: '#fbbf24',
    text: 'Integração com nossos sistemas legados foi cirúrgica. Zero downtime na migração e nenhum dado perdido no processo.',
  },
  {
    name: 'Lucas Bernardes',
    role: 'Diretor Comercial',
    initial: 'L',
    accent: '#f472b6',
    text: 'Dashboard em tempo real mudou como tomamos decisões. Saímos do achismo para dados concretos e ainda economizamos no time de BI.',
  },
  {
    name: 'Bruno Sampaio',
    role: 'CEO, Agro Tech',
    initial: 'B',
    accent: '#a78bfa',
    text: 'Software de gestão rural sob medida para nossa realidade. Outros tentaram empurrar pacotes prontos, eles ouviram o que precisávamos.',
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 estrelas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: 'var(--color-lime)' }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      className="flex-shrink-0 w-[320px] sm:w-[360px] md:w-[400px] p-7 rounded-2xl"
      style={{
        background:
          'linear-gradient(150deg, rgba(20,20,20,0.85) 0%, rgba(12,12,12,0.7) 100%)',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow:
          '0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base"
            style={{
              background: `linear-gradient(135deg, ${review.accent} 0%, rgba(0,0,0,0.4) 130%)`,
              color: '#0a0a0a',
              fontFamily: 'var(--font-title)',
              boxShadow: `0 0 24px ${review.accent}22`,
            }}
          >
            {review.initial}
          </div>
          <div>
            <div
              className="text-[14px] font-semibold leading-tight"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--foreground)',
              }}
            >
              {review.name}
            </div>
            <div
              className="text-[11.5px] mt-0.5"
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-primary)',
              }}
            >
              {review.role}
            </div>
          </div>
        </div>
        <Stars />
      </div>

      <p
        className="text-[14px] leading-[1.6]"
        style={{
          color: 'rgba(255,255,255,0.78)',
          fontFamily: 'var(--font-primary)',
        }}
      >
        {review.text}
      </p>
    </article>
  );
}

export function ReviewsCarousel() {
  // Duplicamos a lista para o loop infinito sem cortes
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="site-container mb-12 lg:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
        >
          <div>
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
                O que dizem
              </span>
            </div>
            <h2
              className="leading-[1] tracking-[-0.025em] text-[2.25rem] sm:text-[2.75rem] lg:text-[3.5rem]"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--foreground)',
                fontWeight: 700,
              }}
            >
              Avaliações de quem{' '}
              <em
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: 'var(--color-lime)',
                }}
              >
                trabalha com a gente
              </em>
              .
            </h2>
          </div>
          <p
            className="text-[15px] lg:text-[16px] max-w-md leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Histórias reais de quem confiou na engenharia da Black Elephant.
          </p>
        </motion.div>
      </div>

      {/* Auto-scrolling track */}
      <div className="marquee-fade">
        <div
          className="flex gap-5 w-max marquee-track"
          style={{ ['--marquee-duration' as string]: '70s' }}
        >
          {loop.map((review, i) => (
            <ReviewCard key={`${review.name}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
