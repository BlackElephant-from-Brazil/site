'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const portfolioItems = [
  {
    title: 'Plataforma de crédito inteligente',
    description: 'Onboarding, scoring e automação de esteiras de aprovação com dashboards operacionais.',
    image: '/assets/portfolio/portfolio-2.svg',
    category: 'Fintech'
  },
  {
    title: 'Super app de experiência do cliente',
    description: 'Camada de serviço para autoatendimento, notificações e personalização de ofertas.',
    image: '/assets/portfolio/portfolio-3.svg',
    category: 'Telecom'
  },
  {
    title: 'Console de dados e observabilidade',
    description: 'Coleta de eventos em tempo real, feature flags e cockpit de experimentação.',
    image: '/assets/portfolio/portfolio-4.svg',
    category: 'SaaS'
  }
];

export function PortfolioCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % portfolioItems.length), 4800);
    return () => clearInterval(timer);
  }, []);

  const activeItems = [
    portfolioItems[index],
    portfolioItems[(index + 1) % portfolioItems.length],
    portfolioItems[(index + 2) % portfolioItems.length]
  ];

  return (
    <section className="section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="container">
        <div className="flex-between">
          <div>
            <p className="tagline">PORTFÓLIO</p>
            <h2 id="portfolio-title" className="section-title">
              Casos que combinam produto, design e engenharia
            </h2>
            <p className="section-subtitle">
              Estruturamos a experiência ponta a ponta: discovery, prototipação validada com usuários e engenharia com
              observabilidade desde o dia zero.
            </p>
          </div>
          <div className="carousel-nav" aria-label="Navegação do carrossel">
            <button className="nav-button" onClick={() => setIndex((prev) => (prev - 1 + portfolioItems.length) % portfolioItems.length)}>
              ◀
            </button>
            <button className="nav-button" onClick={() => setIndex((prev) => (prev + 1) % portfolioItems.length)}>
              ▶
            </button>
          </div>
        </div>
        <div className="carousel" style={{ marginTop: 24 }}>
          <div className="carousel-track">
            {activeItems.map((item) => (
              <article key={item.title} className="card" aria-label={item.title}>
                <div className="banner" style={{ marginBottom: 14, width: 'fit-content' }}>
                  <span className="badge">{item.category}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Experiência HUBFIVE</span>
                </div>
                <Image src={item.image} alt={item.title} width={360} height={220} />
                <h3 style={{ marginBottom: 8 }}>{item.title}</h3>
                <p style={{ margin: 0, color: 'var(--muted)' }}>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
