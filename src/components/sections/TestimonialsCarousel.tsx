'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const testimonials = [
  {
    name: 'Fernanda Ribeiro',
    role: 'COO · Fintech líder',
    quote: 'O squad HUBFIVE integrou discovery, UX e engenharia com velocidade. Em 90 dias reduzimos o tempo de análise em 42%.',
    avatar: '/assets/testimonials/avatar-1.svg',
    rating: 5
  },
  {
    name: 'Lucas Andrade',
    role: 'Head de Produto · Telecom',
    quote: 'A disciplina de experimentação trouxe previsibilidade para roadmap. O NPS da experiência digital subiu para 73.',
    avatar: '/assets/testimonials/avatar-2.svg',
    rating: 5
  },
  {
    name: 'Marina Costa',
    role: 'CPO · SaaS B2B',
    quote: 'Eles nos ajudaram a reescrever arquitetura e implementar observabilidade. O time interno ganhou autonomia em semanas.',
    avatar: '/assets/testimonials/avatar-3.svg',
    rating: 5
  }
];

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % testimonials.length), 5200);
    return () => clearInterval(timer);
  }, []);

  const active = testimonials[index];

  return (
    <section className="section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="flex-between">
          <div>
            <p className="tagline">DEPOIMENTOS</p>
            <h2 id="testimonials-title" className="section-title">
              Provas de valor com quem já acelerou com a HUBFIVE
            </h2>
            <p className="section-subtitle">
              Relacionamentos de longo prazo orientados a métricas de negócio: CSA, LTV, eficiência operacional e engajamento.
            </p>
          </div>
          <div className="carousel-nav" aria-label="Navegação de depoimentos">
            <button className="nav-button" onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}>
              ◀
            </button>
            <button className="nav-button" onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}>
              ▶
            </button>
          </div>
        </div>
        <article className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <Image src={active.avatar} alt={`Foto de ${active.name}`} width={64} height={64} />
            <div>
              <h3 style={{ margin: 0 }}>{active.name}</h3>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{active.role}</p>
              <div style={{ color: 'var(--brand)', marginTop: 6 }} aria-label={`${active.rating} de 5 estrelas`}>
                {'★★★★★'.slice(0, active.rating)}
              </div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 18 }}>{`“${active.quote}”`}</p>
        </article>
      </div>
    </section>
  );
}
