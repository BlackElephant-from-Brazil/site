export function EcosystemSection() {
  const partners = ['AWS', 'Figma', 'Segment', 'Datadog', 'Vercel', 'Firebase'];

  return (
    <section className="section" aria-labelledby="ecosystem-title">
      <div className="container">
        <p className="tagline">ECOSSISTEMA HUBFIVE</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center' }}>
          <div>
            <h2 id="ecosystem-title" className="section-title">
              Integrações e parceiros que aceleram sua operação
            </h2>
            <p className="section-subtitle">
              Conectamos ferramentas líderes de mercado para dados, deploy e colaboração. Prontos para inserir seu stack.
            </p>
            <div className="stat-badges">
              <span className="badge">SDKs prontos</span>
              <span className="badge">Pipelines de dados</span>
              <span className="badge">Governança & segurança</span>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Parcerias e integrações</h3>
            <div className="logo-cloud">
              {partners.map((partner) => (
                <div key={partner} className="banner" style={{ justifyContent: 'center' }}>
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
