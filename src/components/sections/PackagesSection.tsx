export function PackagesSection() {
  const packages = [
    {
      name: 'Discovery Sprint',
      description: 'Imersão de 3 semanas para mapear problema, personas e validar proposta de valor com protótipos.',
      price: 'A partir de R$ 48k',
      features: ['Pesquisa qualitativa', 'Mapa de jornada', 'Prototipação validada', 'Roadmap priorizado']
    },
    {
      name: 'Produto recorrente',
      description: 'Squad completo para evolução contínua com releases quinzenais e métricas de negócio.',
      price: 'A partir de R$ 120k/mês',
      features: ['Squad multidisciplinar', 'Observabilidade e QA', 'Chapter lead dedicado', 'Backlog orientado a outcomes'],
      highlight: true
    },
    {
      name: 'Tech Leadership',
      description: 'Arquitetura, performance, cloud e devops para escalar plataformas com segurança.',
      price: 'Sob medida',
      features: ['Revisão arquitetural', 'SRE e automação', 'Playbook de qualidade', 'Cultura de experimentos']
    }
  ];

  return (
    <section className="section" id="packages" aria-labelledby="packages-title">
      <div className="container">
        <p className="tagline">PACOTES</p>
        <h2 id="packages-title" className="section-title">
          Escolha o melhor formato para acelerar sua próxima entrega
        </h2>
        <p className="section-subtitle">
          Modelos flexíveis que equilibram tempo de descoberta, profundidade técnica e governança executiva.
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {packages.map((pkg) => (
            <article key={pkg.name} className={`card ${pkg.highlight ? 'highlight-card' : ''}`} aria-label={pkg.name}>
              <div className="flex-between">
                <div>
                  <h3 style={{ margin: 0 }}>{pkg.name}</h3>
                  <p style={{ margin: 0, color: 'var(--muted)' }}>{pkg.description}</p>
                </div>
                {pkg.highlight && <span className="badge">Mais escolhido</span>}
              </div>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{pkg.price}</p>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)', display: 'grid', gap: 8 }}>
                {pkg.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a className="button secondary" style={{ marginTop: 16 }} href="#contato">
                Falar com especialista
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
