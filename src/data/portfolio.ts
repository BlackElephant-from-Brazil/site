export type PortfolioCategory = 'apps' | 'sistemas' | 'sites';

export interface PortfolioImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: PortfolioCategory;
  client: string;
  year: number;
  technologies: string[];
  thumbnail: string;
  images: PortfolioImage[];
  featured: boolean;
  order: number;
}

export const portfolioItems: PortfolioItem[] = [
  // APPS
  {
    id: '1',
    slug: 'solumart-services',
    title: 'Solumart Services',
    shortDescription: 'Aplicativo para gerenciamento de serviços por prestadores',
    fullDescription: 'Desenvolvemos o aplicativo Solumart Services para a Solumart Tecnologia, uma solução completa para gerenciamento de serviços prestados em campo. O app permite que prestadores registrem atendimentos, acompanhem ordens de serviço, enviem fotos e relatórios em tempo real. Interface intuitiva e moderna, otimizada para uso rápido durante o trabalho.',
    category: 'apps',
    client: 'Solumart Tecnologia',
    year: 2025,
    technologies: ['FlutterFlow', 'Android', 'iOS', 'Firebase'],
    thumbnail: '/portfolio/solumart-services/thumb.jpg',
    images: [
      { src: '/portfolio/solumart-services/home.jpg', alt: 'Tela inicial', width: 390, height: 844 },
      { src: '/portfolio/solumart-services/services.jpg', alt: 'Lista de serviços', width: 390, height: 844 },
      { src: '/portfolio/solumart-services/details.jpg', alt: 'Detalhes do atendimento', width: 390, height: 844 },
      { src: '/portfolio/solumart-services/report.jpg', alt: 'Relatório de serviço', width: 390, height: 844 },
    ],
    featured: true,
    order: 1,
  },

  // SISTEMAS
  {
    id: '2',
    slug: 'dashboard-solumart',
    title: 'Dashboard Solumart',
    shortDescription: 'Sistema web para gerenciamento interno de operações',
    fullDescription: 'Sistema web completo desenvolvido para gerenciamento interno das operações da Solumart. Dashboard administrativo com visão 360° do negócio, gestão de prestadores, acompanhamento de serviços, relatórios gerenciais e indicadores de performance em tempo real. Plataforma no-code que permite atualizações ágeis.',
    category: 'sistemas',
    client: 'Solumart Tecnologia',
    year: 2025,
    technologies: ['Bubble', 'API REST', 'Integrações'],
    thumbnail: '/portfolio/dashboard-solumart/thumb.jpg',
    images: [
      { src: '/portfolio/dashboard-solumart/dashboard.jpg', alt: 'Dashboard principal', width: 1920, height: 1080 },
      { src: '/portfolio/dashboard-solumart/services.jpg', alt: 'Gestão de serviços', width: 1920, height: 1080 },
      { src: '/portfolio/dashboard-solumart/providers.jpg', alt: 'Gestão de prestadores', width: 1920, height: 1080 },
      { src: '/portfolio/dashboard-solumart/reports.jpg', alt: 'Relatórios', width: 1920, height: 1080 },
    ],
    featured: true,
    order: 2,
  },
  {
    id: '3',
    slug: 'sabas-mobilidade',
    title: 'Sabas Mobilidade',
    shortDescription: 'Sistema completo para gerenciamento de operações de viagens',
    fullDescription: 'Plataforma integrada para gerenciamento de todas as operações da Sabas, especializada em mobilidade e viagens. O sistema abrange desde o agendamento de viagens até o acompanhamento em tempo real, gestão de motoristas, controle financeiro e comunicação automatizada com clientes via WhatsApp. Automações inteligentes que otimizam processos e reduzem trabalho manual.',
    category: 'sistemas',
    client: 'Sabas Mobilidade',
    year: 2025,
    technologies: ['Bubble', 'Make', 'WhatsApp API', 'Automações'],
    thumbnail: '/portfolio/sabas-mobilidade/thumb.jpg',
    images: [
      { src: '/portfolio/sabas-mobilidade/dashboard.jpg', alt: 'Dashboard operacional', width: 1920, height: 1080 },
      { src: '/portfolio/sabas-mobilidade/trips.jpg', alt: 'Gestão de viagens', width: 1920, height: 1080 },
      { src: '/portfolio/sabas-mobilidade/drivers.jpg', alt: 'Gestão de motoristas', width: 1920, height: 1080 },
      { src: '/portfolio/sabas-mobilidade/automation.jpg', alt: 'Central de automações', width: 1920, height: 1080 },
    ],
    featured: true,
    order: 3,
  },
  {
    id: '4',
    slug: 'bhg-consultoria',
    title: 'BHG Consultoria',
    shortDescription: 'Sistema web com múltiplos dashboards para gestão de operações',
    fullDescription: 'Sistema web robusto desenvolvido para a BHG Consultoria, contendo 4 dashboards especializados para gerenciamento completo da operação. O sistema oferece acesso seguro dos clientes ao banco de dados da BHG, controle de permissões granular, visualização de dados em tempo real e relatórios personalizados. Arquitetura moderna e escalável.',
    category: 'sistemas',
    client: 'BHG Consultoria',
    year: 2025,
    technologies: ['Next.js', 'Supabase', 'TypeScript', 'PostgreSQL'],
    thumbnail: '/portfolio/bhg-consultoria/thumb.jpg',
    images: [
      { src: '/portfolio/bhg-consultoria/dashboard1.jpg', alt: 'Dashboard executivo', width: 1920, height: 1080 },
      { src: '/portfolio/bhg-consultoria/dashboard2.jpg', alt: 'Dashboard operacional', width: 1920, height: 1080 },
      { src: '/portfolio/bhg-consultoria/dashboard3.jpg', alt: 'Dashboard de clientes', width: 1920, height: 1080 },
      { src: '/portfolio/bhg-consultoria/security.jpg', alt: 'Gestão de acessos', width: 1920, height: 1080 },
    ],
    featured: true,
    order: 4,
  },

  // SITES
  {
    id: '5',
    slug: 'bhg-institucional',
    title: 'BHG Institucional',
    shortDescription: 'Site institucional moderno com foco em SEO',
    fullDescription: 'Site institucional desenvolvido para a BHG Consultoria, com design moderno e profissional que transmite credibilidade e expertise. Otimizado para mecanismos de busca (SEO), o site apresenta os serviços da empresa, cases de sucesso e facilita o contato de potenciais clientes. Performance otimizada e responsividade total.',
    category: 'sites',
    client: 'BHG Consultoria',
    year: 2025,
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'SEO'],
    thumbnail: '/portfolio/bhg-institucional/thumb.jpg',
    images: [
      { src: '/portfolio/bhg-institucional/home.jpg', alt: 'Página inicial', width: 1920, height: 1080 },
      { src: '/portfolio/bhg-institucional/about.jpg', alt: 'Sobre a empresa', width: 1920, height: 1080 },
      { src: '/portfolio/bhg-institucional/services.jpg', alt: 'Serviços', width: 1920, height: 1080 },
      { src: '/portfolio/bhg-institucional/contact.jpg', alt: 'Contato', width: 1920, height: 1080 },
    ],
    featured: true,
    order: 5,
  },
  {
    id: '6',
    slug: 'sabas-institucional',
    title: 'Sabas Institucional',
    shortDescription: 'Site institucional para empresa de mobilidade',
    fullDescription: 'Site institucional desenvolvido para a Sabas Mobilidade, destacando seus serviços de transporte e viagens. Design dinâmico e moderno que reflete a agilidade da empresa. SEO otimizado para posicionamento nos buscadores, integração com WhatsApp para contato rápido e apresentação clara dos serviços oferecidos.',
    category: 'sites',
    client: 'Sabas Mobilidade',
    year: 2025,
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'SEO'],
    thumbnail: '/portfolio/sabas-institucional/thumb.jpg',
    images: [
      { src: '/portfolio/sabas-institucional/home.jpg', alt: 'Página inicial', width: 1920, height: 1080 },
      { src: '/portfolio/sabas-institucional/services.jpg', alt: 'Serviços', width: 1920, height: 1080 },
      { src: '/portfolio/sabas-institucional/fleet.jpg', alt: 'Nossa frota', width: 1920, height: 1080 },
      { src: '/portfolio/sabas-institucional/contact.jpg', alt: 'Contato', width: 1920, height: 1080 },
    ],
    featured: true,
    order: 6,
  },
  {
    id: '7',
    slug: 'hub50-institucional',
    title: 'Hub 5.0 Institucional',
    shortDescription: 'Site institucional para hub de inovação',
    fullDescription: 'Site institucional desenvolvido para o Hub 5.0, um hub de inovação e tecnologia. Design futurista e tecnológico que reflete a proposta inovadora do espaço. Apresentação dos serviços, espaços disponíveis, eventos e comunidade. SEO otimizado e performance excepcional para garantir boa experiência do usuário.',
    category: 'sites',
    client: 'Hub 5.0',
    year: 2025,
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'SEO'],
    thumbnail: '/portfolio/hub50-institucional/thumb.jpg',
    images: [
      { src: '/portfolio/hub50-institucional/home.jpg', alt: 'Página inicial', width: 1920, height: 1080 },
      { src: '/portfolio/hub50-institucional/spaces.jpg', alt: 'Espaços', width: 1920, height: 1080 },
      { src: '/portfolio/hub50-institucional/community.jpg', alt: 'Comunidade', width: 1920, height: 1080 },
      { src: '/portfolio/hub50-institucional/events.jpg', alt: 'Eventos', width: 1920, height: 1080 },
    ],
    featured: true,
    order: 7,
  },
];

// Helpers
export const getPortfolioByCategory = (category: PortfolioCategory | 'all'): PortfolioItem[] => {
  if (category === 'all') return portfolioItems;
  return portfolioItems.filter((item) => item.category === category);
};

export const getLatestPortfolioItems = (count: number = 4): PortfolioItem[] => {
  return [...portfolioItems]
    .sort((a, b) => b.year - a.year || a.order - b.order)
    .slice(0, count);
};

export const getFeaturedPortfolioItems = (): PortfolioItem[] => {
  return portfolioItems.filter((item) => item.featured);
};

export const getPortfolioBySlug = (slug: string): PortfolioItem | undefined => {
  return portfolioItems.find((item) => item.slug === slug);
};

export const getPortfolioById = (id: string): PortfolioItem | undefined => {
  return portfolioItems.find((item) => item.id === id);
};

export const getCategoryLabel = (category: PortfolioCategory): string => {
  const labels: Record<PortfolioCategory, string> = {
    apps: 'Aplicativos',
    sistemas: 'Sistemas',
    sites: 'Sites',
  };
  return labels[category];
};

export const getAllCategories = (): { value: PortfolioCategory | 'all'; label: string }[] => [
  { value: 'all', label: 'Todos' },
  { value: 'sites', label: 'Sites' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'apps', label: 'Aplicativos' },
];
