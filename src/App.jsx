import { useRef } from 'react';

const sections = [
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'pacotes', label: 'Pacotes' },
  { id: 'ecosistema', label: 'Ecossistema HUBFIVE' },
  { id: 'lead', label: 'Contato' },
];

const testimonials = [
  {
    author: 'CEO de fintech B2B',
    quote:
      'A HUBFIVE traduziu nossos processos complexos em uma plataforma simples e veloz. O time entende negócios e entrega design premium.',
  },
  {
    author: 'Diretor de operações, varejo',
    quote:
      'Integrações com ERP e app mobile saíram dentro do prazo e com documentação impecável. Foi além de um fornecedor, virou parceiro.',
  },
  {
    author: 'Fundador de healthtech',
    quote:
      'Nos apoiaram desde o MVP até a escala com arquitetura escalável e squad dedicado. Atendimento humano do início ao fim.',
  },
];

const packages = [
  {
    name: 'Essencial',
    price: 'A partir de R$ 8k/mês',
    features: [
      'Squad dedicado (PM + UI/UX + Dev)',
      'Sprint quinzenal com roadmap validado',
      'Integrações prontas com gateways e CRMs',
    ],
    cta: 'Começar com o Essencial',
  },
  {
    name: 'Recomendado',
    price: 'A partir de R$ 12k/mês',
    features: [
      'Discovery profundo com pesquisa de usuário',
      'Design system exclusivo com acessibilidade',
      'Arquitetura escalável (cloud + automações)',
      'SLA prioritário e squad ampliado',
    ],
    cta: 'Quero o plano recomendado',
    badge: 'Mais escolhido',
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    features: [
      'Onboarding dedicado para times internos',
      'Integração com legados e compliance',
      'Suporte 24/7 e governança de produto',
    ],
    cta: 'Falar com o time enterprise',
  },
];

const portfolioItems = [
  {
    title: 'Plataforma de onboarding digital',
    description: 'Fluxos antifraude, biometria e assinatura digital com NPS 82.',
  },
  {
    title: 'Super app de varejo',
    description: 'Compras, fidelidade e cashback em um app responsivo e escalável.',
  },
  {
    title: 'Painel de inteligência logística',
    description: 'Roteirização otimizada e dashboards em tempo real com dados IoT.',
  },
];

const benefits = [
  'UX e UI com microinterações prontas para produção',
  'Arquitetura cloud e automações para ganhar escala',
  'Integrações com ERPs, CRMs, gateways e marketing stack',
  'Equipe plugável ao seu time interno com rituais ágeis',
];

const ecosystem = [
  'Labs de inovação para validar ideias com usuários reais',
  'Academy para treinar equipes em produto e tecnologia',
  'Parcerias com martechs, fintechs e healthtechs',
  'Comunidade HUBFIVE com eventos e benchmarks',
];

function useHorizontalScroll(reverse = false) {
  const ref = useRef(null);
  const scrollByAmount = (delta) => {
    const container = ref.current;
    if (container) {
      container.scrollBy({ left: reverse ? -delta : delta, behavior: 'smooth' });
    }
  };

  return { ref, scrollNext: () => scrollByAmount(340), scrollPrev: () => scrollByAmount(-340) };
}

export default function App() {
  const portfolioScroll = useHorizontalScroll();
  const testimonialsScroll = useHorizontalScroll(true);

  return (
    <div className="page">
      <header className="nav">
        <div className="logo" aria-label="Logotipo HUBFIVE">
          <span className="dot" />
          HUBFIVE
        </div>
        <nav>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn ghost" href="#lead">
          Falar com especialista
        </a>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero__text">
            <p className="eyebrow">SQUADS DIGITAIS COMPLETOS</p>
            <h1>
              Software sob medida com <span>performance</span> e <span>design</span> para o seu negócio.
            </h1>
            <p className="lead">
              Do discovery ao suporte contínuo: squads dedicados, integrações prontas e velocidade para lançar produtos
              que encantam.
            </p>
            <div className="hero__actions">
              <a className="btn primary" href="#portfolio">
                Ver portfólio
              </a>
              <a className="btn secondary" href="#pacotes">
                Ver pacotes e preços
              </a>
            </div>
            <div className="meta">
              <span>+50 projetos lançados</span>
              <span>Atuação LATAM & EUA</span>
              <span>Design System exclusivo</span>
            </div>
          </div>
          <div className="hero__visual" aria-label="Placeholder do showcase">
            <div className="mockup">Mockup ou vídeo hero (placeholder)</div>
          </div>
        </section>

        <section className="section" id="portfolio">
          <header className="section__header">
            <p className="eyebrow">PORTFÓLIO</p>
            <div className="section__title-group">
              <h2>Produtos que lançamos com clientes ambiciosos.</h2>
              <div className="controls">
                <button onClick={portfolioScroll.scrollPrev} aria-label="Ver anterior">◀</button>
                <button onClick={portfolioScroll.scrollNext} aria-label="Ver próximo">▶</button>
              </div>
            </div>
          </header>
          <div className="carousel" ref={portfolioScroll.ref} aria-label="Projetos em destaque">
            {portfolioItems.map((item) => (
              <article className="card" key={item.title}>
                <div className="card__visual" aria-label={`Screenshot de ${item.title}`}>
                  <div className="placeholder">Screenshot placeholder</div>
                </div>
                <div className="card__body">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a className="link" href="#lead">
                    Falar sobre um projeto parecido →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section muted" id="avaliacoes">
          <header className="section__header">
            <p className="eyebrow">AVALIAÇÕES</p>
            <div className="section__title-group">
              <h2>Feedback real de quem construiu com a HUBFIVE.</h2>
              <div className="controls">
                <button onClick={testimonialsScroll.scrollPrev} aria-label="Ver anterior">◀</button>
                <button onClick={testimonialsScroll.scrollNext} aria-label="Ver próximo">▶</button>
              </div>
            </div>
          </header>
          <div className="carousel reverse" ref={testimonialsScroll.ref} aria-label="Avaliações de clientes">
            {testimonials.map((testimonial) => (
              <article className="card testimonial" key={testimonial.author}>
                <p className="quote">“{testimonial.quote}”</p>
                <p className="author">{testimonial.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="quem-somos">
          <header className="section__header">
            <p className="eyebrow">QUEM SOMOS</p>
            <h2>Uma casa de produto que entrega estratégia, UX e engenharia alinhadas.</h2>
          </header>
          <div className="grid two">
            <p>
              HUBFIVE é o estúdio que combina pesquisa, design e engenharia para colocar produtos digitais no ar com
              qualidade enterprise. Trabalhamos com squads completos, rituais ágeis e uma cultura orientada a dados para
              que cada release traga resultado de negócio.
            </p>
            <div className="list">
              <div className="list__item">Times full stack e mobile com chapter leads.</div>
              <div className="list__item">UI/UX com design system e protótipos navegáveis.</div>
              <div className="list__item">Tech leads alinhados ao CTO para decisões críticas.</div>
              <div className="list__item">Suporte humano de ponta a ponta, sem burocracia.</div>
            </div>
          </div>
        </section>

        <section className="section" id="pacotes">
          <header className="section__header">
            <p className="eyebrow">PACOTES</p>
            <h2>Escolha o ritmo ideal para evoluir seu produto.</h2>
          </header>
          <div className="cards three">
            {packages.map((pack) => (
              <article className={`card pricing ${pack.badge ? 'highlight' : ''}`} key={pack.name}>
                {pack.badge && <span className="badge">{pack.badge}</span>}
                <h3>{pack.name}</h3>
                <p className="price">{pack.price}</p>
                <ul>
                  {pack.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
                <a className="btn secondary full" href="#lead">
                  {pack.cta}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="beneficios">
          <header className="section__header">
            <p className="eyebrow">BENEFÍCIOS</p>
            <h2>Benefícios de ter a HUBFIVE como parceira.</h2>
          </header>
          <div className="list grid two">
            {benefits.map((item) => (
              <div className="list__item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="section muted" id="ecosistema">
          <header className="section__header">
            <p className="eyebrow">ECOSSISTEMA HUBFIVE</p>
            <h2>Um ecossistema para acelerar do MVP ao scale-up.</h2>
          </header>
          <div className="list grid two">
            {ecosystem.map((item) => (
              <div className="list__item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="lead">
          <div className="lead-form">
            <div>
              <p className="eyebrow">Quer seu próprio software?</p>
              <h2>Conte para a HUBFIVE o que quer lançar.</h2>
              <p>
                Preencha o formulário e nosso time retorna em até 24h para destravar seu próximo produto digital.
              </p>
              <div className="meta">
                <span>Atendimento humano</span>
                <span>Squad pronto para iniciar</span>
              </div>
            </div>
            <form>
              <label>
                Nome completo
                <input type="text" name="name" placeholder="Seu nome" required />
              </label>
              <label>
                E-mail corporativo
                <input type="email" name="email" placeholder="nome@empresa.com" required />
              </label>
              <label>
                Descreva o projeto
                <textarea name="project" rows="4" placeholder="App mobile, plataforma web, integrações..." />
              </label>
              <button type="submit" className="btn primary full">
                Enviar brief
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer" id="rodape">
        <div className="footer__brand" aria-label="Rodapé HUBFIVE">
          <div className="logo">
            <span className="dot" />
            HUBFIVE
          </div>
          <p>Software que combina estratégia, design e engenharia.</p>
          <div className="social">Logos de redes e selos (placeholder)</div>
        </div>
        <div className="footer__links">
          <a href="#portfolio">Portfólio</a>
          <a href="#pacotes">Pacotes</a>
          <a href="#lead">Contato</a>
          <a href="#beneficios">Benefícios</a>
        </div>
        <div className="footer__cta">
          <p>Pronto para lançar? Vamos conversar.</p>
          <a className="btn secondary" href="#lead">
            Falar com HUBFIVE
          </a>
        </div>
      </footer>
    </div>
  );
}
