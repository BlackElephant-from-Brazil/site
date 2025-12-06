export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="columns">
          <div>
            <h3>HUBFIVE</h3>
            <p style={{ color: 'var(--muted)' }}>
              Estúdio de produto digital que combina estratégia, design e engenharia para acelerar negócios.
            </p>
            <div className="banner">
              <span>📍</span>
              <span>São Paulo · Global Remote</span>
            </div>
          </div>
          <div>
            <h4>Contato</h4>
            <p style={{ color: 'var(--muted)' }}>contato@hubfive.com</p>
            <p style={{ color: 'var(--muted)' }}>+55 (11) 99999-0000</p>
            <p style={{ color: 'var(--muted)' }}>Rua Exemplo, 123</p>
          </div>
          <div>
            <h4>Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--muted)', display: 'grid', gap: 8 }}>
              <li><a href="#portfolio">Portfólio</a></li>
              <li><a href="#packages">Pacotes</a></li>
              <li><a href="#contato">Fale com a gente</a></li>
            </ul>
          </div>
          <div>
            <h4>Assine novidades</h4>
            <form>
              <input className="input" type="email" name="newsletter" placeholder="Seu e-mail" aria-label="E-mail" />
              <button className="button primary" type="submit" style={{ marginTop: 10 }}>
                Quero receber
              </button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HUBFIVE. Todos os direitos reservados.</span>
          <span>Privacidade · Termos</span>
        </div>
      </div>
    </footer>
  );
}
