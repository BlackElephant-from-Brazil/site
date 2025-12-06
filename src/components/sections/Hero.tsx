'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

const orbitingShapes = [
  'Descoberta estratégica',
  'UX/UI com pesquisa',
  'Engenharia escalável'
];

export function Hero() {
  const [activeShape, setActiveShape] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveShape((prev) => (prev + 1) % orbitingShapes.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  useAnalytics([{ name: 'page_view', payload: { section: 'hero' } }]);

  return (
    <section className="section hero" aria-labelledby="hero-title">
      <div className="container hero-content">
        <div>
          <p className="badge" aria-label="Soluções end-to-end">
            HUBFIVE · Produtos digitais end-to-end
          </p>
          <h1 id="hero-title" className="section-title" style={{ marginTop: 12, marginBottom: 16 }}>
            Construa experiências digitais que combinam design, dados e engenharia.
          </h1>
          <p className="section-subtitle">
            Squads multidisciplinares para lançar, evoluir e escalar produtos com agilidade. Mergulhamos na operação para
            gerar valor mensurável desde o primeiro sprint.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <a className="button primary" href="#contato">
              Agendar diagnóstico
            </a>
            <a className="button secondary" href="#portfolio">
              Ver portfólio
            </a>
          </div>
          <div className="pillars" aria-label="Pilares de atuação">
            {['Produto completo', 'Growth & Data', 'Tech Leadership'].map((item) => (
              <div key={item} className="pillar-item">
                <span className="badge" aria-hidden>
                  ●
                </span>
                <div>
                  <strong>{item}</strong>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                    {item === 'Produto completo'
                      ? 'Ideação, discovery e entrega contínua'
                      : item === 'Growth & Data'
                      ? 'Métricas, experimentos e personalização'
                      : 'Arquitetura, devops e qualidade de ponta'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual" aria-hidden>
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(183,253,19,.1), transparent 45%)' }} />
            <Image src="/assets/portfolio/portfolio-1.svg" alt="Dashboard HUBFIVE" width={520} height={360} priority />
            <div className="banner" style={{ marginTop: 16, justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Destacado</p>
                <strong>Products HUBFIVE</strong>
              </div>
              <span className="badge">CSAT 4.9</span>
            </div>
            <div className="pillars">
              {orbitingShapes.map((shape, index) => (
                <div
                  key={shape}
                  className="pillar-item"
                  style={{
                    borderColor: index === activeShape ? 'rgba(183,253,19,0.6)' : 'rgba(255,255,255,0.06)',
                    transform: index === activeShape ? 'translateY(-2px)' : 'none',
                    transition: 'all 240ms ease'
                  }}
                >
                  <span className="badge" style={{ animation: 'float 5s ease-in-out infinite' }} aria-hidden>
                    {index === activeShape ? '●' : '○'}
                  </span>
                  <span>{shape}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
