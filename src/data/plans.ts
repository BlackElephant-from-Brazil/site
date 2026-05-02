export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanPricing {
  initial: number;
  monthly: number;
  additionalUserCost: number;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  pricing: PlanPricing;
  features: PlanFeature[];
  highlights: string[];
  recommended: boolean;
  ctaText: string;
  icon: 'rocket' | 'zap' | 'crown';
  color: 'lime' | 'blue' | 'purple';
}

export const plans: Plan[] = [
  {
    id: '1',
    slug: 'empresa-digital',
    name: 'Empresa Digital',
    tagline: 'O primeiro passo para sua presença online',
    description: 'Tudo que sua empresa precisa para começar no digital com profissionalismo e segurança.',
    fullDescription: `O plano Empresa Digital é a escolha perfeita para quem está dando os primeiros passos no mundo digital. Oferecemos uma solução completa que inclui site institucional moderno, emails profissionais e toda a infraestrutura de segurança que sua empresa precisa.

Com proteção Cloudflare integrada, seu site estará protegido contra ataques DDoS e terá performance otimizada globalmente. Você terá 5 emails profissionais com seu domínio (@suaempresa.com.br) e acesso ao webmail de qualquer lugar.

O site institucional é desenvolvido com as melhores práticas de SEO, garantindo que sua empresa seja encontrada no Google. Design responsivo que se adapta perfeitamente a qualquer dispositivo, do desktop ao smartphone.`,
    pricing: {
      initial: 497,
      monthly: 139.99,
      additionalUserCost: 9.99,
    },
    features: [
      { text: 'Site institucional completo e moderno', included: true, highlight: true },
      { text: 'Design responsivo com a cara da sua empresa', included: true },
      { text: 'Otimização SEO para Google', included: true },
      { text: '5 emails profissionais + webmail', included: true, highlight: true },
      { text: 'Proteção Cloudflare (DDoS, SSL, CDN)', included: true },
      { text: 'Hospedagem premium inclusa', included: true },
      { text: 'Domínio .com.br gratuito', included: true },
      { text: 'Painel de estatísticas do site', included: true },
      { text: 'Suporte via email e WhatsApp', included: true },
      { text: 'Ambiente Google/Microsoft', included: false },
      { text: 'Sistema de gestão próprio', included: false },
      { text: 'Área de clientes', included: false },
    ],
    highlights: [
      'Ideal para micro e pequenas empresas',
      'Presença profissional na internet',
      'Segurança de nível empresarial',
      'Sem surpresas - tudo incluso',
    ],
    recommended: false,
    ctaText: 'Começar Agora',
    icon: 'rocket',
    color: 'lime',
  },
  {
    id: '2',
    slug: 'empresa-digital-plus',
    name: 'Empresa Digital+',
    tagline: 'Produtividade e colaboração para seu time',
    description: 'Tudo do plano Digital, mais ambiente de trabalho completo com Google Workspace ou Microsoft 365.',
    fullDescription: `O Empresa Digital+ leva sua operação para o próximo nível. Além de tudo que o plano Digital oferece, você terá um ambiente de trabalho profissional completo com Google Workspace ou Microsoft 365 configurado e integrado.

Imagine ter emails com 30GB de armazenamento, Google Drive ou OneDrive ilimitado para sua equipe, videoconferências profissionais com Google Meet ou Microsoft Teams, e toda a suíte de produtividade (Docs, Sheets, Slides ou Word, Excel, PowerPoint) trabalhando de forma integrada.

Nós cuidamos de toda a configuração, migração de dados existentes e treinamento da sua equipe. Você escolhe entre Google Workspace ou Microsoft 365, e nós fazemos acontecer.`,
    pricing: {
      initial: 497,
      monthly: 238.99,
      additionalUserCost: 9.99,
    },
    features: [
      { text: 'Tudo do plano Empresa Digital', included: true, highlight: true },
      { text: 'Google Workspace ou Microsoft 365', included: true, highlight: true },
      { text: 'Email profissional com 30GB+', included: true },
      { text: 'Drive/OneDrive ilimitado', included: true },
      { text: 'Meet/Teams para videoconferências', included: true },
      { text: 'Docs, Sheets, Slides (ou Office)', included: true },
      { text: 'Calendário compartilhado', included: true },
      { text: 'Configuração e migração completa', included: true },
      { text: 'Treinamento da equipe', included: true },
      { text: 'Suporte prioritário', included: true, highlight: true },
      { text: 'Sistema de gestão próprio', included: false },
      { text: 'Área de clientes', included: false },
    ],
    highlights: [
      'Perfeito para equipes em crescimento',
      'Produtividade profissional',
      'Colaboração em tempo real',
      'Você escolhe Google ou Microsoft',
    ],
    recommended: true,
    ctaText: 'Escolher Digital+',
    icon: 'zap',
    color: 'blue',
  },
  {
    id: '3',
    slug: 'empresa-completa',
    name: 'Empresa Completa',
    tagline: 'Solução sob medida para sua operação',
    description: 'Sistema completo de gestão, agendamento e área de clientes. Sua empresa 100% digital.',
    fullDescription: `O plano Empresa Completa é a solução definitiva para empresas que querem se digitalizar por completo. Desenvolvemos um sistema sob medida para sua operação, integrando agendamentos, gestão de serviços, área de clientes e muito mais.

Imagine seus clientes agendando serviços online, acompanhando pedidos em tempo real, acessando histórico e documentos em uma área exclusiva. Enquanto isso, sua equipe gerencia tudo em um painel centralizado, com automações que eliminam trabalho manual.

Cada sistema é desenvolvido de acordo com as necessidades específicas do seu negócio. Não é uma solução genérica - é um sistema feito para você, que cresce junto com sua empresa.

O suporte é VIP: atendimento prioritário, reuniões mensais de acompanhamento e atualizações contínuas do sistema.`,
    pricing: {
      initial: 4997,
      monthly: 499.99,
      additionalUserCost: 9.99,
    },
    features: [
      { text: 'Tudo dos planos anteriores', included: true, highlight: true },
      { text: 'Sistema de gestão personalizado', included: true, highlight: true },
      { text: 'Agendamento online integrado', included: true },
      { text: 'Área exclusiva para clientes', included: true, highlight: true },
      { text: 'Dashboard gerencial em tempo real', included: true },
      { text: 'Automação de processos', included: true },
      { text: 'Integração com WhatsApp', included: true },
      { text: 'Notificações automáticas', included: true },
      { text: 'Relatórios personalizados', included: true },
      { text: 'API para integrações', included: true },
      { text: 'Suporte VIP dedicado', included: true, highlight: true },
      { text: 'Atualizações contínuas', included: true },
    ],
    highlights: [
      'Solução 100% personalizada',
      'Elimine trabalho manual com automação',
      'Seus clientes vão adorar a experiência',
      'Suporte VIP com atendimento dedicado',
    ],
    recommended: false,
    ctaText: 'Falar com Consultor',
    icon: 'crown',
    color: 'purple',
  },
];

// Helpers
export const getPlanBySlug = (slug: string): Plan | undefined => {
  return plans.find((plan) => plan.slug === slug);
};

export const getPlanById = (id: string): Plan | undefined => {
  return plans.find((plan) => plan.id === id);
};

export const getRecommendedPlan = (): Plan | undefined => {
  return plans.find((plan) => plan.recommended);
};

export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPriceShort = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
};
