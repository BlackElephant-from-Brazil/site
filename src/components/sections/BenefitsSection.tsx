export function BenefitsSection() {
  const benefits = [
    {
      title: 'Ciclo rápido de aprendizado',
      description: 'Discovery contínuo e experimentos AB integrados a feature flags e telemetria.',
      icon: '⚡'
    },
    {
      title: 'Arquitetura resiliente',
      description: 'Cloud nativa, observabilidade e padrões de qualidade para escalar sem gargalos.',
      icon: '🛡️'
    },
    {
      title: 'Time augmentado',
      description: 'Capacitamos squads internos com coaching, documentação e playbooks reutilizáveis.',
      icon: '🤝'
    },
    {
      title: 'Design system vivo',
      description: 'Biblioteca de componentes com tokens, acessibilidade e animações suaves.',
      icon: '🎨'
    }
  ];

  return (
    <section className="section" aria-labelledby="benefits-title">
      <div className="container">
        <p className="tagline">BENEFÍCIOS</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div>
            <h2 id="benefits-title" className="section-title">
              Resultados mensuráveis em cada sprint
            </h2>
            <p className="section-subtitle">
              Conectamos business KPIs a métricas de produto, garantindo visibilidade e previsibilidade para lideranças.
            </p>
          </div>
          {benefits.map((benefit) => (
            <div key={benefit.title} className="card">
              <div className="banner" style={{ width: 'fit-content', marginBottom: 10 }}>
                <span aria-hidden>{benefit.icon}</span>
                <span>{benefit.title}</span>
              </div>
              <p style={{ margin: 0 }}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
