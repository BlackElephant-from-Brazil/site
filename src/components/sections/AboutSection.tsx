export function AboutSection() {
  const highlights = [
    {
      title: 'DNA de produto',
      text: 'Time com experiência em scale-ups, squads ágeis e liderança de produto orientada a outcomes.',
      metric: '+120 releases',
      note: 'Em ciclos quinzenais'
    },
    {
      title: 'Cobertura end-to-end',
      text: 'Discovery, UX research, service design, arquitetura cloud, SRE, QA e growth.',
      metric: '12 disciplinas',
      note: 'Orquestradas por chapter leads'
    },
    {
      title: 'Time distribuído',
      text: 'Modelo híbrido nearshore com rituais diários e governança executiva mensal.',
      metric: '4 fusos',
      note: 'Américas e Europa'
    }
  ];

  return (
    <section className="section" aria-labelledby="about-title">
      <div className="container">
        <p className="tagline">QUEM SOMOS</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center' }}>
          <div>
            <h2 id="about-title" className="section-title">
              HUBFIVE é o estúdio de produto que conecta estratégia, design e engenharia.
            </h2>
            <p className="section-subtitle">
              Operamos como extensão do seu time, trazendo governança, rituais e métricas que mantêm negócio e tecnologia no
              mesmo ritmo.
            </p>
            <div className="stat-badges">
              <span className="badge">Discovery guiado por dados</span>
              <span className="badge">Squads plugáveis</span>
              <span className="badge">Playbooks reutilizáveis</span>
            </div>
          </div>
          {highlights.map((item) => (
            <div key={item.title} className="card">
              <p className="tagline" style={{ marginBottom: 6 }}>
                {item.metric}
              </p>
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <p style={{ marginBottom: 8, color: 'var(--muted)' }}>{item.text}</p>
              <strong>{item.note}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
