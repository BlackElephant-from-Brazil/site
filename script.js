const portfolioItems = [
  {
    title: 'Plataforma de Pagamentos',
    tag: 'Fintech',
    description:
      'Gateway com onboarding KYC, antifraude e microsserviços escaláveis em nuvem.',
    highlight: 'API-first com dashboards em tempo real.'
  },
  {
    title: 'Marketplace B2B',
    tag: 'Comércio',
    description:
      'Arquitetura modular com catálogo dinâmico, pricing inteligente e logística integrada.',
    highlight: 'Design system multi-brand e checkout seguro.'
  },
  {
    title: 'Super App de Mobilidade',
    tag: 'Mobilidade',
    description:
      'Aplicativo híbrido com mapas, tracking ao vivo e motor de matching entre motoristas e clientes.',
    highlight: 'Pushes transacionais e monitoramento 24/7.'
  },
  {
    title: 'Plataforma Edtech',
    tag: 'Educação',
    description:
      'Aulas interativas, trilhas personalizadas por IA e pagamentos recorrentes.',
    highlight: 'Analytics de engajamento e certificação digital.'
  },
  {
    title: 'CRM de Saúde',
    tag: 'Health',
    description:
      'Gestão de pacientes, prontuários seguros e integrações com wearables e laboratórios.',
    highlight: 'LGPD by design e auditoria completa.'
  },
  {
    title: 'Portal de Dados',
    tag: 'Data',
    description: 'Data lake, catálogo de dados e camadas semânticas prontas para squads.',
    highlight: 'Governança e qualidade de dados automatizadas.'
  }
];

const reviewItems = [
  {
    name: 'Laura Martins',
    role: 'CEO, fintech Série A',
    text: 'A HUBFIVE entrou com squad completo e entregou o MVP em 8 semanas, já integrado aos PSPs que precisamos.',
    score: '5/5'
  },
  {
    name: 'Diego Lopes',
    role: 'Head de Produto, healthtech',
    text: 'O time trouxe clareza de roadmap e assumiu a operação com observabilidade e QA automatizado.',
    score: '5/5'
  },
  {
    name: 'Ana Souza',
    role: 'COO, marketplace B2B',
    text: 'Conseguimos lançar features críticas sem parar a operação. O design system vivo salvou nosso time.',
    score: '4.9/5'
  },
  {
    name: 'Rafael Moreira',
    role: 'CTO, scale-up',
    text: 'Squads disciplinadas, código limpo e foco em métricas de produto. Parceria estratégica de verdade.',
    score: '5/5'
  },
  {
    name: 'Isabela Freitas',
    role: 'CMO, edtech',
    text: 'Growth, dados e UX trabalhando juntos. Tivemos ganho de retenção em menos de dois ciclos.',
    score: '4.8/5'
  }
];

function createCard(content) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = content;
  return card;
}

function renderPortfolio(item) {
  return `
    <span class="tag">${item.tag}</span>
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <p><strong>${item.highlight}</strong></p>
  `;
}

function renderReview(item) {
  return `
    <div class="tag">${item.score}</div>
    <h3>${item.name}</h3>
    <p class="label">${item.role}</p>
    <p>“${item.text}”</p>
  `;
}

function setupCarousel({ key, items, renderer }) {
  const container = document.querySelector(`[data-carousel="${key}"]`);
  const controls = document.querySelector(`[data-carousel-controls="${key}"]`);
  if (!container || !controls) return;

  const track = document.createElement('div');
  track.className = 'carousel-track';
  items.forEach((item) => track.appendChild(createCard(renderer(item))));
  container.appendChild(track);

  const prev = document.createElement('button');
  prev.setAttribute('aria-label', `${key} anterior`);
  prev.textContent = '‹';
  const next = document.createElement('button');
  next.setAttribute('aria-label', `${key} próximo`);
  next.textContent = '›';
  controls.append(prev, next);

  const scrollStep = () => Math.max(container.clientWidth * 0.85, 260);
  const scrollByDir = (dir) => track.scrollBy({ left: scrollStep() * dir, behavior: 'smooth' });
  prev.addEventListener('click', () => scrollByDir(-1));
  next.addEventListener('click', () => scrollByDir(1));

  let timer = setInterval(() => scrollByDir(1), 6000);
  const pause = () => clearInterval(timer);
  const resume = () => {
    clearInterval(timer);
    timer = setInterval(() => scrollByDir(1), 6000);
  };

  [track, controls].forEach((el) => {
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
  });
}

function enableSmoothScroll() {
  document.documentElement.style.scrollBehavior = 'smooth';
  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

function handleForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.textContent = 'Recebido!';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = 'Quero falar com o HUB';
      button.disabled = false;
      form.reset();
    }, 2000);
  });
}

setupCarousel({ key: 'portfolio', items: portfolioItems, renderer: renderPortfolio });
setupCarousel({ key: 'reviews', items: reviewItems, renderer: renderReview });
enableSmoothScroll();
handleForm();
