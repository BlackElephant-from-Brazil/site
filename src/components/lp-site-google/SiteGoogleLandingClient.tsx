'use client';

/**
 * Landing page de captação (Google Ads) — serviço de criação de sites.
 * Slug: /[locale]/somos-uma-agencia-de-marketing-digital-e-web-design-que-cria-sites-em-lisboa-porto-braga-e-toda-portugal
 *
 * Design system PRÓPRIO desta LP (claro / teal / âmbar — "premium acessível"),
 * intencionalmente diferente do tema cyberpunk do site público. Todo o estilo
 * vive num <style> com escopo em `.lpg-root` para não colidir com globals.css.
 *
 * Idioma: seletor PT/EN que troca o conteúdo sem recarregar a página.
 * Padrão: português de Portugal (PT-PT).
 *
 * >>> PLACEHOLDERS A PREENCHER ANTES DE PUBLICAR (ver também o fim do arquivo):
 *   - WHATSAPP_NUMBER  (número PT em formato internacional, sem +)
 *   - LEAD_ENDPOINT    (endpoint do formulário: n8n / Formspree / API própria)
 *   - ID de conversão do formulário no Google Ads (ver fireLeadConversion)
 *   - Depoimentos e logos reais (ver bloco "PROVA / DEPOIMENTOS")
 *   - NIF e contactos no rodapé
 */

import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { reportContatoWhatsappConversion } from '@/lib/analytics/google-ads';
import { GlassEffect, GlassFilter } from '@/components/ui/liquid-glass';
import { SplineScene } from '@/components/ui/spline-scene';
import { MAIN_LP_SLUG, WHATSAPP_NUMBER } from './config';
import type { GoogleReviewsData } from './google-reviews';

// Fundos WebGL (three.js) só no cliente — code-split para não pesar no bundle inicial.
const GLSLHills = dynamic(() => import('@/components/ui/glsl-hills').then((m) => m.GLSLHills), {
  ssr: false,
});
const NoctuarySwarm = dynamic(() => import('@/components/ui/noctuary-swarm').then((m) => m.NoctuarySwarm), {
  ssr: false,
});
const CityScene = dynamic(() => import('@/components/ui/city-scene').then((m) => m.CityScene), {
  ssr: false,
});

// ============================================================================
// PLACEHOLDERS
// ============================================================================

// (WHATSAPP_NUMBER vem de ./config — partilhado com as páginas do cluster)

// TODO: endpoint do formulário de captação. Se ficar vazio, o formulário
// apenas mostra a mensagem de sucesso (útil para pré-visualizar). Ligue a um
// webhook (ex.: n8n), Formspree, ou a uma API própria.
const LEAD_ENDPOINT = '';

// (o antigo scrollToContact saiu com o CTA do cartão do robô — todos os CTAs
// restantes abrem o modal de contacto via openContact)

// Perfil no Google — botão "Ver todas no Google" (link partilhado pelo Gui).
const GOOGLE_MAPS_REVIEWS_URL = 'https://maps.app.goo.gl/t1vnnWwRCi6KwYE79';

// FALLBACK apenas: as avaliações reais chegam do servidor via Places API
// (ver ./google-reviews.ts — precisa de GOOGLE_PLACES_API_KEY no .env.local).
// Estes cartões só aparecem enquanto a chave não estiver configurada. Se quiser
// preencher manualmente, cole o texto EXATAMENTE como está no Google — nunca
// inventar avaliações (é enganoso e ilegal).
const GOOGLE_REVIEWS: { name: string; date: string; rating: number; text: string; photo?: string }[] = [
  { name: 'Cliente Google', date: '', rating: 5, text: 'Cole aqui a avaliação real do cliente, copiada do perfil do Google.' },
  { name: 'Cliente Google', date: '', rating: 5, text: 'Cole aqui a avaliação real do cliente, copiada do perfil do Google.' },
  { name: 'Cliente Google', date: '', rating: 5, text: 'Cole aqui a avaliação real do cliente, copiada do perfil do Google.' },
  { name: 'Cliente Google', date: '', rating: 5, text: 'Cole aqui a avaliação real do cliente, copiada do perfil do Google.' },
  { name: 'Cliente Google', date: '', rating: 5, text: 'Cole aqui a avaliação real do cliente, copiada do perfil do Google.' },
];

const AVATAR_COLORS = ['#1a73e8', '#e8710a', '#1e8e3e', '#a142f4', '#d93025'];

// ============================================================================
// i18n — conteúdo PT-PT e EN
// ============================================================================

type LangKey = 'pt' | 'en';

type FaqItem = { q: string; a: string };
type Step = { t: string; d: string };

/* Segmento tipográfico (tipografia expressiva / neobrutal):
   serif = itálico serifado, bold = Sora 700, black = Sora 800,
   accent = palavra de destaque (gradiente + sublinhado desenhado) */
type TitleSeg = { t: string; v: 'serif' | 'bold' | 'black' | 'accent' };

/* Copy do mockup de "página de busca" usado nas secções problema/solução. */
type MockResultCopy = { name: string; domain: string; desc: string };
type MockCopy = {
  query: string;
  tabs: string[];
  results: MockResultCopy[]; // 3 concorrentes, ordem A, B, C
  yourResult: MockResultCopy & { tag: string };
  alertTitle: string;
  alertText: string;
  successTitle: string;
  successText: string;
};

type Copy = {
  htmlLang: string;
  skipToContent: string;
  langSwitchLabel: string;
  headerCta: string;
  navAria: string;
  menuOpen: string;
  menuClose: string;
  hero: {
    titleLines: TitleSeg[][];
    sub: { pre: string; emph: string; post: string };
    cta: string;
    seals: string[];
  };
  /* Marquee de argumentos de venda (sem preço) entre hero e "o problema" */
  marquee: string[];
  pain: { badge: string; title: TitleSeg[]; text: string };
  solution: { badge: string; title: TitleSeg[]; text: string };
  /* Secção de destaque: visibilidade também nas respostas de IA (não só Google) */
  ai: { badge: string; title: TitleSeg[]; text: string };
  /* Mockup de página de busca (monitor) partilhado pelas secções pain/solution */
  mock: MockCopy;
  how: { badge: string; title: TitleSeg[]; steps: Step[] };
  /* Método de SEO — reforça o diferencial (otimização SEO, palavras-chave, conteúdo) */
  method: { badge: string; title: TitleSeg[]; text: string; points: Step[] };
  proof: {
    badge: string;
    title: TitleSeg[];
    items: { icon: 'price' | 'shield' | 'doc'; title: string; text: string }[];
    reviewsTitle: string;
    reviewsSummary: string;
    reviewsCta: string;
  };
  /* Resultados mensuráveis — números com efeito de contagem (CountUp) */
  results: {
    title: string;
    intro: string;
    metrics: { end: number; decimals?: number; prefix?: string; suffix?: string; label: string; note: string; isRating?: boolean }[];
  };
  offer: {
    badge: string;
    title: TitleSeg[];
    price: string;
    priceNote: string;
    desc: string;
    includesTitle: string;
    includes: string[];
    cta: string;
  };
  guarantee: { badge: string; title: TitleSeg[]; text: string };
  faq: { badge: string; title: TitleSeg[]; items: FaqItem[] };
  /* Tabela de serviços adicionais (upsell): blog, loja online, anúncios */
  extras: {
    badge: string;
    title: TitleSeg[];
    text: string;
    colService: string;
    colDesc: string;
    colTime: string;
    colPrice: string;
    rows: { icon: 'blog' | 'ecommerce' | 'ads'; name: string; desc: string; time: string; priceLines: string[] }[];
    cta: string;
  };
  /* Pilha de scroll: 4 secções que se sobrepõem antes do "Método" */
  stackRobot: { eyebrow: string; title: string; sub: string };
  /* Secção "experiência visual": fundo WebGL (colinas GLSL) + texto editorial */
  stackVisual: { titleA: string; titleB: string; sub: string };
  /* Secção "imaginação → realidade": enxame de traças 3D à volta de um candeeiro
     (estética Noctuary — fontes Archivo + Spectral SC, paleta noite/violeta) */
  stackNoctuary: { kicker: string; title: string; descPre: string; descAccent: string; caption: string };
  /* Secção final da pilha: cidade 3D navegável (estilo Expo Dubai virtual) */
  stackCity: { kicker: string; title: string; hint: string };
  form: {
    badge: string;
    title: TitleSeg[];
    subtitle: string;
    name: string;
    namePh: string;
    email: string;
    emailPh: string;
    phone: string;
    phonePh: string;
    business: string;
    businessPh: string;
    businessOptions: string[];
    message: string;
    messagePh: string;
    submit: string;
    submitting: string;
    or: string;
    whatsapp: string;
    consent: string;
    privacyLink: string;
    successTitle: string;
    successText: string;
    errName: string;
    errEmail: string;
    errPhone: string;
    errBusiness: string;
    errSubmit: string;
  };
  footer: {
    tagline: string;
    localLine: string;
    contact: string;
    privacy: string;
    terms: string;
    nif: string;
    compliance: string;
    rights: string;
  };
  cookie: { text: string; accept: string; reject: string; privacy: string };
};

const COPY: Record<LangKey, Copy> = {
  pt: {
    htmlLang: 'pt-PT',
    skipToContent: 'Saltar para o conteúdo',
    langSwitchLabel: 'Idioma',
    headerCta: 'Pedir orçamento',
    navAria: 'Navegação principal',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    hero: {
      titleLines: [
        [{ t: 'a melhor agência', v: 'serif' }],
        [{ t: 'de', v: 'serif' }, { t: 'marketing digital', v: 'black' }],
        [{ t: 'e web design que', v: 'serif' }],
        [{ t: 'cria sites em', v: 'serif' }, { t: 'portugal', v: 'accent' }],
      ],
      sub: {
        pre: 'Fazemos sites, landing pages, ecommerce, blog e Google Ads em Braga, Porto, Lisboa e toda Portugal. Tenha um site que aparece no Google e nas buscas de IA ',
        emph: 'sem pagar anúncios',
        post: '.',
      },
      cta: 'Quero o meu site a aparecer no Google',
      seals: ['Totalmente responsivo', 'SEO e AEO otimizados', 'Entrega em 14 dias'],
    },
    marquee: [
      'Textos otimizados para o Google',
      'Entrega em 14 dias',
      'Conforme o RGPD',
      'Design responsivo',
      'Faturação em Portugal',
      'Atendimento em português',
      'Até 8 páginas',
      'Sem mensalidade obrigatória',
    ],
    pain: {
      badge: 'O problema',
      title: [{ t: 'quando procuram o seu serviço,', v: 'serif' }, { t: 'quem aparece?', v: 'black' }],
      text: 'Quando alguém procura o seu serviço no Google, quem aparece? Se não for a sua empresa, é o concorrente a levar o cliente. E pagar anúncios todos os meses só para existir cansa e sai caro.',
    },
    solution: {
      badge: 'A solução',
      title: [{ t: 'a diferença está', v: 'serif' }, { t: 'no texto.', v: 'accent' }],
      text: 'Criar um site não chega: é preciso web design que o Google entenda. Escrevemos cada página com as palavras-chave que os seus clientes procuram, para o Google mostrar o seu negócio de forma orgânica. Um site para empresas que trabalha por si, todos os dias.',
    },
    ai: {
      badge: 'Além do Google',
      title: [{ t: 'fazemos você ser encontrado', v: 'serif' }, { t: 'também pela', v: 'black' }, { t: 'IA.', v: 'accent' }],
      text: 'Não trabalhamos apenas para o Google. Também otimizamos o seu site para ser encontrado pelas inteligências artificiais, nas respostas de ferramentas como o ChatGPT e o Gemini, quando alguém pergunta por uma empresa como a sua.',
    },
    mock: {
      query: 'serviços no local',
      tabs: ['Tudo', 'Mapas', 'Imagens', 'Notícias'],
      results: [
        { name: 'Concorrente A', domain: 'concorrentea.pt', desc: 'Avaliação 4,2 ★ · Aberto agora' },
        { name: 'Concorrente B', domain: 'concorrenteb.pt', desc: 'Avaliação 3,9 ★ · Aberto agora' },
        { name: 'Concorrente C', domain: 'concorrentec.pt', desc: 'Avaliação 4,5 ★ · Aberto agora' },
      ],
      yourResult: {
        name: 'A Sua Empresa',
        domain: 'asuaempresa.pt',
        desc: 'Site otimizado para aparecer no Google.',
        tag: 'Você está aqui',
      },
      alertTitle: 'Você não está aqui',
      alertText: 'A sua empresa não aparece nesta pesquisa. Enquanto isso, o concorrente fica com o cliente.',
      successTitle: 'Você foi encontrado',
      successText: 'A sua empresa passou a aparecer primeiro nesta pesquisa, sem pagar por anúncios.',
    },
    how: {
      badge: 'Como funciona',
      title: [{ t: 'três passos para', v: 'serif' }, { t: 'criar o seu site', v: 'black' }],
      steps: [
        { t: 'Conte-nos sobre o seu negócio', d: 'Tratamos de todo o resto por si.' },
        { t: 'Escrevemos e desenhamos o seu site', d: 'Cada página otimizada para o Google.' },
        { t: 'O seu site entra no ar', d: 'Pronto para ser encontrado e receber clientes.' },
      ],
    },
    method: {
      badge: 'O método',
      title: [{ t: 'como pomos o seu site a', v: 'serif' }, { t: 'aparecer no google', v: 'black' }],
      text: 'Não há truques: há otimização SEO feita com critério desde o primeiro dia da criação do site.',
      points: [
        { t: 'Palavras-chave certas', d: 'Investigamos o que os seus clientes escrevem no Google e usamos essas palavras-chave nos títulos e textos de cada página.' },
        { t: 'Conteúdo que responde', d: 'Escrevemos conteúdo claro, que responde às perguntas de quem procura. É exatamente isso que o Google quer mostrar.' },
        { t: 'Base técnica sólida', d: 'Web design leve, rápido e responsivo, com a estrutura técnica que os motores de busca exigem.' },
      ],
    },
    proof: {
      badge: 'Confiança',
      title: [{ t: 'transparência', v: 'black' }, { t: 'do início ao fim', v: 'serif' }],
      items: [
        {
          icon: 'price',
          title: 'Preço fixo e público',
          text: 'O valor está nesta página, igual para todos. Sem orçamentos-surpresa nem custos escondidos.',
        },
        {
          icon: 'shield',
          title: 'RGPD e acessibilidade',
          text: 'Sites em conformidade com o RGPD e com as normas europeias de acessibilidade, desde o primeiro dia.',
        },
        {
          icon: 'doc',
          title: 'Atendimento em português',
          text: 'Faturação em Portugal e acompanhamento na sua língua, do primeiro contacto ao suporte pós-entrega.',
        },
      ],
      reviewsTitle: 'O que dizem os clientes',
      reviewsSummary: 'avaliações reais de clientes no Google',
      reviewsCta: 'Ver todas no Google',
    },
    results: {
      title: 'Resultados que pode medir',
      intro: 'Não pedimos que confie só na nossa palavra. Estes são os números do compromisso que assumimos com cada site que entregamos.',
      metrics: [
        { end: 14, suffix: ' dias', label: 'Da aprovação ao site no ar', note: 'prazo de entrega garantido' },
        { end: 8, label: 'Páginas otimizadas', note: 'SEO e AEO incluídos no preço fixo' },
        { end: 5, decimals: 1, label: 'Classificação no Google', note: 'avaliações reais de clientes', isRating: true },
        { end: 2, suffix: ' h', label: 'Tempo de resposta', note: 'orçamentos e dúvidas, em português' },
      ],
    },
    offer: {
      badge: 'A oferta',
      title: [{ t: 'tudo incluído', v: 'serif' }, { t: 'por um preço único', v: 'black' }],
      price: '1.349 €',
      priceNote: 'pagamento único · sem mensalidade obrigatória',
      desc: 'Site institucional completo, até 8 páginas, com textos otimizados para o Google. Sem letras pequenas.',
      includesTitle: 'O que está incluído',
      includes: [
        'Até 8 páginas',
        'Textos otimizados para SEO',
        'Design responsivo (mobile)',
        'Formulário de contacto',
        'Conformidade RGPD e acessibilidade',
        'Entrega em 14 dias',
      ],
      cta: 'Quero este site',
    },
    guarantee: {
      badge: 'Garantia',
      title: [{ t: 'entregamos no prazo,', v: 'black' }, { t: 'ou 30% de desconto.', v: 'accent' }],
      text: 'Entregamos o seu site na data combinada, ou tem 30% de desconto. Simples assim.',
    },
    faq: {
      badge: 'Dúvidas',
      title: [{ t: 'perguntas', v: 'black' }, { t: 'frequentes', v: 'serif' }],
      items: [
        {
          q: 'Trabalham com empresas de fora de Portugal?',
          a: 'Sim. Trabalhamos com clientes de qualquer país. A faturação é emitida em Portugal e o atendimento pode ser em português ou inglês.',
        },
        {
          q: 'O que está incluído nos 1.349 €?',
          a: 'Até 8 páginas, textos otimizados para SEO, design responsivo, formulário de contacto, conformidade com o RGPD e acessibilidade, e a colocação do site online. Sem mensalidade obrigatória.',
        },
        {
          q: 'Em quanto tempo o meu site fica pronto?',
          a: 'Normalmente até 14 dias úteis depois de recebermos as informações do seu negócio.',
        },
        {
          q: 'Preciso de escrever os textos?',
          a: 'Não. Escrevemos nós todos os textos, otimizados para posicionar o seu site no Google. Só precisamos que nos conte sobre o seu negócio.',
        },
        {
          q: 'Vou mesmo aparecer no Google?',
          a: 'Construímos cada página seguindo boas práticas de SEO para que o Google a entenda e a mostre a quem procura. O ranking depende da concorrência e não é imediato, mas o site é feito para ser encontrado de forma orgânica, sem depender de anúncios pagos.',
        },
        {
          q: 'Emitem fatura em Portugal?',
          a: 'Sim. Emitimos fatura com NIF português.',
        },
      ],
    },
    extras: {
      badge: 'Personalize o seu site',
      title: [{ t: 'todos os', v: 'serif' }, { t: 'serviços', v: 'accent' }],
      text: 'Comece com o site base e adicione exatamente o que o seu negócio precisa, quando precisar.',
      colService: 'Serviço',
      colDesc: 'O que inclui',
      colTime: 'Prazo adicional',
      colPrice: 'Investimento',
      rows: [
        {
          icon: 'blog',
          name: 'Blog',
          desc: 'Publique artigos e novidades para reforçar o SEO do site com conteúdo novo.',
          time: '+4 dias',
          priceLines: ['+899 €'],
        },
        {
          icon: 'ecommerce',
          name: 'Loja online',
          desc: 'Venda os seus produtos diretamente pelo site, com carrinho e pagamento online.',
          time: '+4 dias',
          priceLines: ['+899 €'],
        },
        {
          icon: 'ads',
          name: 'Anúncios e marketing digital',
          desc: 'Configuração da página de captação e gestão contínua das suas campanhas de anúncios.',
          time: '+4 dias',
          priceLines: [
            '899 € setup de campanha',
            '350 €/mês até 10.000 € de investimento em tráfego',
            'Acima de 10.000 €: valor a combinar',
          ],
        },
      ],
      cta: 'Solicitar o meu orçamento agora',
    },
    // TODO (Gui): copy de placeholder — substituir por texto definitivo antes de publicar.
    stackRobot: {
      eyebrow: 'a mais alta tecnologia',
      title: 'Está pronto para impressionar?',
      sub: 'Criamos tudo do zero. Sem WordPress. Sem templates prontos. Tudo pensado para a sua necessidade.',
    },
    stackVisual: {
      titleA: 'o seu site deve ser',
      titleB: 'uma experiência visual única',
      sub: 'Os textos fazem-no ser encontrado no Google, mas são os visuais que vão impressionar o seu cliente.',
    },
    stackNoctuary: {
      kicker: 'estúdio de web design · da imaginação ao ecrã',
      title: 'a sua imaginação pode tornar-se realidade',
      descPre: 'Cada ideia que nos traz é desenhada, construída e posta a funcionar, pixel a pixel, até ficar exatamente como a imaginou.',
      descAccent: 'Centenas de sites já ganharam vida.',
      caption: 'Mova o cursor e leve consigo uma pequena luz. Parte do enxame vai segui-la.',
    },
    stackCity: {
      kicker: 'mundos, não apenas páginas',
      title: 'pense grande, nós construímos',
      hint: 'arraste para explorar a cidade',
    },
    form: {
      badge: 'Fale connosco',
      title: [{ t: 'peça o seu site', v: 'serif' }, { t: 'hoje', v: 'accent' }],
      subtitle: 'Preencha e entramos em contacto. Sem compromisso.',
      name: 'Nome',
      namePh: 'O seu nome',
      email: 'Email',
      emailPh: 'nome@email.pt',
      phone: 'Telefone / WhatsApp',
      phonePh: '+351 900 000 000',
      business: 'Tipo de negócio',
      businessPh: 'Selecione…',
      businessOptions: ['Clínica / Saúde', 'Restauração', 'Construção', 'Estética / Beleza', 'Advocacia', 'Contabilidade', 'Outro'],
      message: 'Mensagem (opcional)',
      messagePh: 'Conte-nos sobre o seu projeto',
      submit: 'Peça já o seu site',
      submitting: 'A enviar…',
      or: 'ou',
      whatsapp: 'Falar no WhatsApp',
      consent: 'Ao enviar, concorda com a nossa',
      privacyLink: 'Política de Privacidade',
      successTitle: 'Pedido recebido!',
      successText: 'Obrigado. A nossa equipa entra em contacto muito em breve.',
      errName: 'Introduza o seu nome',
      errEmail: 'Introduza um email válido',
      errPhone: 'Introduza um telefone válido',
      errBusiness: 'Selecione uma opção',
      errSubmit: 'Não foi possível enviar. Tente novamente ou fale no WhatsApp.',
    },
    footer: {
      tagline: 'Sites que aparecem no Google.',
      localLine: 'Criação de sites em Portugal. Lisboa, Porto, Braga e todo o país.',
      contact: 'Contacto',
      privacy: 'Política de Privacidade',
      terms: 'Termos',
      nif: 'NIF: 000 000 000', // TODO: NIF real
      compliance: 'Site em conformidade com o RGPD e a Lei Europeia da Acessibilidade.',
      rights: 'Todos os direitos reservados.',
    },
    cookie: {
      text: 'Usamos cookies para melhorar a sua experiência e medir o desempenho da página. Ao continuar, concorda com a nossa utilização de cookies.',
      accept: 'Aceitar',
      reject: 'Rejeitar',
      privacy: 'Política de Privacidade',
    },
  },
  en: {
    htmlLang: 'en',
    skipToContent: 'Skip to content',
    langSwitchLabel: 'Language',
    headerCta: 'Get a quote',
    navAria: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    hero: {
      titleLines: [
        [{ t: 'the best', v: 'serif' }, { t: 'digital marketing', v: 'black' }],
        [{ t: '& web design agency', v: 'serif' }],
        [{ t: 'that builds sites in', v: 'serif' }],
        [{ t: 'portugal', v: 'accent' }],
      ],
      sub: {
        pre: 'We build websites, landing pages, ecommerce, blogs and Google Ads in Braga, Porto, Lisbon and all of Portugal. Get a site that shows up on Google and in AI searches ',
        emph: 'without paying for ads',
        post: '.',
      },
      cta: 'Get my site ranking on Google',
      seals: ['Fully responsive', 'SEO & AEO optimized', 'Delivered in 14 days'],
    },
    marquee: [
      'Copy optimized for Google',
      'Delivered in 14 days',
      'GDPR compliant',
      'Responsive design',
      'Local invoicing in Portugal',
      'Support in your language',
      'Up to 8 pages',
      'No mandatory monthly fee',
    ],
    pain: {
      badge: 'The problem',
      title: [{ t: 'when people search for your service,', v: 'serif' }, { t: 'who shows up?', v: 'black' }],
      text: "When someone searches for your service on Google, who shows up? If it isn't you, it's your competitor winning the client. And paying for ads every month just to exist is exhausting and expensive.",
    },
    solution: {
      badge: 'The solution',
      title: [{ t: 'the difference is', v: 'serif' }, { t: 'in the words.', v: 'accent' }],
      text: 'Building a website is not enough: it takes web design Google understands. We write every page with the keywords your clients actually search for, so Google shows your business organically. A business website that works for you, every day.',
    },
    ai: {
      badge: 'Beyond Google',
      title: [{ t: 'we get you found', v: 'serif' }, { t: 'by AI too', v: 'accent' }],
      text: "We don't just work for Google. We also optimize your site to be found by artificial intelligence, in answers from tools like ChatGPT and Gemini, whenever someone asks for a business like yours.",
    },
    mock: {
      query: 'local services',
      tabs: ['All', 'Maps', 'Images', 'News'],
      results: [
        { name: 'Competitor A', domain: 'competitora.com', desc: 'Rating 4.2 ★ · Open now' },
        { name: 'Competitor B', domain: 'competitorb.com', desc: 'Rating 3.9 ★ · Open now' },
        { name: 'Competitor C', domain: 'competitorc.com', desc: 'Rating 4.5 ★ · Open now' },
      ],
      yourResult: {
        name: 'Your Business',
        domain: 'yourbusiness.com',
        desc: 'Website optimized to rank on Google.',
        tag: 'You are here',
      },
      alertTitle: "You're not here",
      alertText: "Your business doesn't show up in this search. Meanwhile, the competitor gets the client.",
      successTitle: "You've been found",
      successText: 'Your business now shows up first in this search, without paying for ads.',
    },
    how: {
      badge: 'How it works',
      title: [{ t: 'three steps to', v: 'serif' }, { t: 'build your site', v: 'black' }],
      steps: [
        { t: 'Tell us about your business', d: 'We handle all the rest for you.' },
        { t: 'We write and design your optimized site', d: 'Every page tuned for Google.' },
        { t: 'Your site goes live', d: 'Ready to be found and win clients.' },
      ],
    },
    method: {
      badge: 'The method',
      title: [{ t: 'how we get your site to', v: 'serif' }, { t: 'rank on google', v: 'black' }],
      text: 'No tricks: just careful SEO optimization from day one of building your website.',
      points: [
        { t: 'The right keywords', d: 'We research what your clients type into Google and use those keywords in the titles and copy of every page.' },
        { t: 'Content that answers', d: 'We write clear content that answers what people are searching for. Exactly what Google wants to show.' },
        { t: 'A solid technical base', d: 'Light, fast, responsive web design with the technical structure search engines demand.' },
      ],
    },
    proof: {
      badge: 'Trust',
      title: [{ t: 'transparent', v: 'black' }, { t: 'from start to finish', v: 'serif' }],
      items: [
        {
          icon: 'price',
          title: 'Fixed, public pricing',
          text: 'The price is on this page, the same for everyone. No surprise quotes, no hidden costs.',
        },
        {
          icon: 'shield',
          title: 'GDPR and accessibility',
          text: 'Websites compliant with GDPR and European accessibility standards, from day one.',
        },
        {
          icon: 'doc',
          title: 'Support in your language',
          text: 'Local invoicing in Portugal and guidance in your language, from first contact to after-launch support.',
        },
      ],
      reviewsTitle: 'What clients say',
      reviewsSummary: 'real client reviews on Google',
      reviewsCta: 'See all on Google',
    },
    results: {
      title: 'Results you can measure',
      intro: 'Do not just take our word for it. These are the numbers behind the commitment we make with every website we deliver.',
      metrics: [
        { end: 14, suffix: ' days', label: 'From approval to launch', note: 'guaranteed delivery time' },
        { end: 8, label: 'Optimized pages', note: 'SEO and AEO included in the fixed price' },
        { end: 5, decimals: 1, label: 'Google rating', note: 'real client reviews', isRating: true },
        { end: 2, suffix: ' h', label: 'Response time', note: 'quotes and questions answered fast' },
      ],
    },
    offer: {
      badge: 'The offer',
      title: [{ t: 'everything included,', v: 'serif' }, { t: 'one price', v: 'black' }],
      price: '€1,349',
      priceNote: 'one-time payment · no mandatory monthly fee',
      desc: 'Complete business website, up to 8 pages, with Google-optimized copy. No fine print.',
      includesTitle: "What's included",
      includes: [
        'Up to 8 pages',
        'SEO-optimized copy',
        'Responsive design (mobile)',
        'Contact form',
        'GDPR & accessibility compliant',
        'Delivered in 14 days',
      ],
      cta: 'I want this site',
    },
    guarantee: {
      badge: 'Guarantee',
      title: [{ t: 'we deliver on time,', v: 'black' }, { t: 'or you get 30% off.', v: 'accent' }],
      text: 'We deliver your site on the agreed date, or you get 30% off. It\'s that simple.',
    },
    faq: {
      badge: 'FAQ',
      title: [{ t: 'frequently', v: 'black' }, { t: 'asked questions', v: 'serif' }],
      items: [
        {
          q: 'Do you work with businesses outside Portugal?',
          a: 'Yes. We work with clients from any country. Invoicing is issued in Portugal and support can be in Portuguese or English.',
        },
        {
          q: "What's included in the €1,349?",
          a: 'Up to 8 pages, SEO-optimized copy, responsive design, contact form, GDPR and accessibility compliance, and putting your site live. No mandatory monthly fee.',
        },
        {
          q: 'How long until my site is ready?',
          a: 'Usually up to 14 business days after we receive your business information.',
        },
        {
          q: 'Do I need to write the copy?',
          a: 'No. We write all the copy for you, engineered to rank on Google. We just need you to tell us about your business.',
        },
        {
          q: 'Will I really show up on Google?',
          a: 'We build every page following SEO best practices so Google understands it and shows it to people searching. Ranking depends on competition and is not instant, but the site is built to be found organically, without relying on paid ads.',
        },
        {
          q: 'Do you invoice in Portugal?',
          a: 'Yes. We issue invoices with a Portuguese tax number (NIF).',
        },
      ],
    },
    extras: {
      badge: 'Customize your site',
      title: [{ t: 'all our', v: 'serif' }, { t: 'services', v: 'accent' }],
      text: 'Start with the base website and add exactly what your business needs, whenever you need it.',
      colService: 'Service',
      colDesc: "What's included",
      colTime: 'Extra time',
      colPrice: 'Investment',
      rows: [
        {
          icon: 'blog',
          name: 'Blog',
          desc: "Publish articles and updates to strengthen the site's SEO with fresh content.",
          time: '+4 days',
          priceLines: ['+€899'],
        },
        {
          icon: 'ecommerce',
          name: 'Online store',
          desc: 'Sell your products directly through the site, with cart and online payment.',
          time: '+4 days',
          priceLines: ['+€899'],
        },
        {
          icon: 'ads',
          name: 'Ads & digital marketing',
          desc: 'Landing page setup and ongoing management of your ad campaigns.',
          time: '+4 days',
          priceLines: [
            '€899 campaign setup',
            '€350/month up to €10,000 in traffic investment',
            'Above €10,000: custom quote',
          ],
        },
      ],
      cta: 'Request my quote now',
    },
    stackRobot: {
      eyebrow: 'cutting-edge technology',
      title: 'Ready to impress?',
      sub: 'We build everything from scratch. No WordPress. No pre-made templates. Everything designed around your needs.',
    },
    stackVisual: {
      titleA: 'your website should be',
      titleB: 'a unique visual experience',
      sub: 'The words get you found on Google, but it is the visuals that will impress your client.',
    },
    stackNoctuary: {
      kicker: 'web design studio · from imagination to screen',
      title: 'your imagination can become reality',
      descPre: 'Every idea you bring us is designed, built and set in motion, pixel by pixel, until it looks exactly as you imagined.',
      descAccent: 'Hundreds of sites already brought to life.',
      caption: 'Move your cursor and carry a small light with you. Part of the swarm will follow it.',
    },
    stackCity: {
      kicker: 'worlds, not just pages',
      title: 'think big, we build it',
      hint: 'drag to explore the city',
    },
    form: {
      badge: 'Get in touch',
      title: [{ t: 'request your website', v: 'serif' }, { t: 'today', v: 'accent' }],
      subtitle: 'Fill it in and we get back to you. No commitment.',
      name: 'Name',
      namePh: 'Your name',
      email: 'Email',
      emailPh: 'name@email.com',
      phone: 'Phone / WhatsApp',
      phonePh: '+351 900 000 000',
      business: 'Type of business',
      businessPh: 'Select…',
      businessOptions: ['Clinic / Health', 'Restaurant', 'Construction', 'Beauty / Aesthetics', 'Law', 'Accounting', 'Other'],
      message: 'Message (optional)',
      messagePh: 'Tell us about your project',
      submit: 'Request your website today',
      submitting: 'Sending…',
      or: 'or',
      whatsapp: 'Chat on WhatsApp',
      consent: 'By submitting, you agree to our',
      privacyLink: 'Privacy Policy',
      successTitle: 'Request received!',
      successText: 'Thank you. Our team will be in touch very soon.',
      errName: 'Please enter your name',
      errEmail: 'Please enter a valid email',
      errPhone: 'Please enter a valid phone number',
      errBusiness: 'Please select an option',
      errSubmit: 'Could not send. Please try again or chat on WhatsApp.',
    },
    footer: {
      tagline: 'Websites that get found on Google.',
      localLine: 'Website creation in Portugal. Lisbon, Porto, Braga and nationwide.',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms',
      nif: 'NIF: 000 000 000', // TODO: real NIF
      compliance: 'Website compliant with the GDPR and the European Accessibility Act.',
      rights: 'All rights reserved.',
    },
    cookie: {
      text: 'We use cookies to improve your experience and measure page performance. By continuing, you agree to our use of cookies.',
      accept: 'Accept',
      reject: 'Reject',
      privacy: 'Privacy Policy',
    },
  },
};

// ============================================================================
// Ícones (SVG inline, leves)
// ============================================================================

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

// ============================================================================
// Tipografia mista — sublinhado desenhado + títulos em segmentos
// ============================================================================

/* Sublinhado ondulado com gradiente (o mesmo da palavra-destaque).
   `bright` usa stops mais claros para secções escuras. */
function AccentUnderline({ gradId, bright = false }: { gradId: string; bright?: boolean }) {
  return (
    <svg className="lpg-underline" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={bright ? '#4cc6b6' : '#1F6F6B'} />
          <stop offset="100%" stopColor={bright ? '#ffd98a' : '#E8A93C'} />
        </linearGradient>
      </defs>
      <path
        d="M3 9 C 30 3, 62 11, 100 6 S 168 3, 197 7"
        pathLength="1"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Ícones pequenos do mockup (cadeado, lupa, alerta) — inline, sem depender de IconCheck. */
function IconLock() {
  return (
    <svg viewBox="0 0 16 16" width="10" height="10" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4.8-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconAlertTriangle() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <path d="M12 3.5 21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r=".9" fill="currentColor" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.7 12.3l2.8 2.8 5.8-6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Mockup de "monitor" mostrando uma página de busca (nas secções problema/solução).
   Puramente decorativo (aria-hidden) — a mensagem já está no h2/p ao lado. */
function BrowserMockup({ variant, mock }: { variant: 'problem' | 'solution'; mock: MockCopy }) {
  const rows =
    variant === 'problem'
      ? mock.results.map((r) => ({ ...r, tag: undefined as string | undefined }))
      : [
          { ...mock.yourResult },
          { ...mock.results[0], tag: undefined as string | undefined },
          { ...mock.results[1], tag: undefined as string | undefined },
        ];

  return (
    <div className="lpg-mock" aria-hidden="true">
      <div className="lpg-mock-monitor">
        <span className="lpg-mock-cam" />
        <div className="lpg-mock-screen">
          <div className="lpg-mock-chrome">
            <span className="lpg-mock-dot lpg-mock-dot--1" />
            <span className="lpg-mock-dot lpg-mock-dot--2" />
            <span className="lpg-mock-dot lpg-mock-dot--3" />
            <div className="lpg-mock-addr"><IconLock />google.com/search</div>
          </div>
          <div className="lpg-mock-page">
            <div className="lpg-mock-searchrow">
              <GoogleG className="lpg-gicon" />
              <span className="lpg-mock-query">{mock.query}</span>
              <IconSearch />
            </div>
            <div className="lpg-mock-tabs">
              {mock.tabs.map((tab, i) => (
                <span key={tab} className={i === 0 ? 'is-active' : ''}>{tab}</span>
              ))}
            </div>
            <div className="lpg-mock-results">
              {rows.map((r, i) => (
                <div className={`lpg-mock-result${r.tag ? ' is-you' : ''}`} key={i}>
                  <div className="lpg-mock-result-head">
                    <span className="lpg-mock-result-domain">{r.domain}</span>
                    {r.tag && <span className="lpg-mock-tag">{r.tag}</span>}
                  </div>
                  <div className="lpg-mock-result-title">{r.name}</div>
                  <div className="lpg-mock-result-desc">{r.desc}</div>
                </div>
              ))}
            </div>
            {variant === 'problem' ? (
              <div className="lpg-mock-banner lpg-mock-banner--alert">
                <IconAlertTriangle />
                <div><strong>{mock.alertTitle}</strong><p>{mock.alertText}</p></div>
              </div>
            ) : (
              <div className="lpg-mock-banner lpg-mock-banner--success">
                <IconCheckCircle />
                <div><strong>{mock.successTitle}</strong><p>{mock.successText}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lpg-mock-stand">
        <div className="lpg-mock-neck" />
        <div className="lpg-mock-base" />
      </div>
    </div>
  );
}

/* Ícone "sparkle" (IA) — estrela de 4 pontas + companheira pequena. */
function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
      <path d="M12 2c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6z" fill="#fff" />
      <path d="M19 15c.3 2 .9 2.6 2.9 2.9-2 .3-2.6.9-2.9 2.9-.3-2-.9-2.6-2.9-2.9 2-.3 2.6-.9 2.9-2.9z" fill="#fff" opacity=".85" />
    </svg>
  );
}

/* Ícone miniatura de "site encontrado" (favicon + título + linhas de texto). */
function IconSiteMini() {
  return (
    <svg viewBox="0 0 40 28" width="100%" height="auto" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="38" height="26" rx="5" fill="#fff" stroke="rgba(18,59,79,.14)" />
      <circle cx="9" cy="9" r="2.4" fill="var(--teal)" />
      <rect x="15" y="7" width="18" height="2.6" rx="1.3" fill="rgba(18,59,79,.35)" />
      <rect x="8" y="16" width="24" height="2.4" rx="1.2" fill="rgba(18,59,79,.16)" />
      <rect x="8" y="21" width="16" height="2.4" rx="1.2" fill="rgba(18,59,79,.16)" />
    </svg>
  );
}

/* Ilustração da secção "também encontrado pela IA": orbe central a escanear
   e a encontrar sites à volta (ligações em ping âmbar). Puramente decorativo. */
function AiOrb() {
  return (
    <div className="lpg-ai-illus" aria-hidden="true">
      <div className="lpg-ai-glow" />
      <div className="lpg-ai-ring lpg-ai-ring--1" />
      <div className="lpg-ai-ring lpg-ai-ring--2" />
      <div className="lpg-ai-sweep" />

      <div className="lpg-ai-site lpg-ai-site--1"><IconSiteMini /></div>
      <div className="lpg-ai-site lpg-ai-site--2"><IconSiteMini /></div>
      <div className="lpg-ai-site lpg-ai-site--3"><IconSiteMini /></div>
      <div className="lpg-ai-site lpg-ai-site--4"><IconSiteMini /></div>

      <span className="lpg-ai-ping lpg-ai-ping--1" />
      <span className="lpg-ai-ping lpg-ai-ping--2" />
      <span className="lpg-ai-ping lpg-ai-ping--3" />
      <span className="lpg-ai-ping lpg-ai-ping--4" />

      <div className="lpg-ai-orb"><IconSparkle /></div>
    </div>
  );
}

/* Ícones da tabela de serviços adicionais (blog / loja online / anúncios). */
function IconBlog() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="4" y="3.5" width="16" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M3 4h2.2l1.6 10.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L20.6 7H6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20" r="1.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="20" r="1.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconMegaphone() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path d="M3 10v4a1.5 1.5 0 0 0 1.5 1.5H6l3.5 4V4.5L6 8.5H4.5A1.5 1.5 0 0 0 3 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12.5 6.5a7 7 0 0 1 0 11M15.5 8.7a3.6 3.6 0 0 1 0 6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
const EXTRA_ICONS = { blog: <IconBlog />, ecommerce: <IconCart />, ads: <IconMegaphone /> } as const;

/* Relógio: usado junto ao prazo na tabela de extras (legenda visual no
   telemóvel, onde o rótulo "Prazo" acima do valor é substituído pelo ícone). */
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Tabela de serviços adicionais (upsell): blog, loja online, anúncios.
   <table> semântica real (não grid de divs) para leitores de ecrã; envolvida
   num scroller horizontal para nunca causar overflow da página no mobile. */
function ExtrasTable({ extras, onCta }: { extras: Copy['extras']; onCta: (e: React.MouseEvent) => void }) {
  return (
    <div className="lpg-extras-card lpg-reveal">
      <div className="lpg-extras-scroll">
        <table className="lpg-extras-table">
          <thead>
            <tr>
              <th scope="col">{extras.colService}</th>
              <th scope="col">{extras.colDesc}</th>
              <th scope="col">{extras.colTime}</th>
              <th scope="col" className="is-price">{extras.colPrice}</th>
            </tr>
          </thead>
          <tbody>
            {extras.rows.map((r) => (
              <tr key={r.name}>
                <th scope="row" className="lpg-extras-service">
                  <span className="lpg-extras-icon">{EXTRA_ICONS[r.icon]}</span>
                  {r.name}
                </th>
                <td data-label={extras.colDesc}>{r.desc}</td>
                <td className="lpg-extras-time" data-label={extras.colTime}>
                  <IconClock />
                  {r.time}
                </td>
                <td className="is-price" data-label={extras.colPrice}>
                  {r.priceLines.map((line, li) => (
                    <div key={li} className={li === 0 ? 'lpg-extras-price-main' : 'lpg-extras-price-note'}>{line}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="#lpg-contacto" onClick={onCta} className="lpg-btn lpg-btn-amber lpg-extras-cta">{extras.cta}</a>
    </div>
  );
}

/* Título de secção com fontes misturadas (serif itálico / bold / black / accent). */
function MixedTitle({ segs, gradId, bright = false }: { segs: readonly TitleSeg[]; gradId: string; bright?: boolean }) {
  return (
    <>
      {segs.map((seg, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className={`lpg-t-seg lpg-t-seg--${seg.v}`}>
            {seg.t}
            {seg.v === 'accent' && <AccentUnderline gradId={gradId} bright={bright} />}
          </span>
        </Fragment>
      ))}
    </>
  );
}

/* Logótipo "G" do Google (atribuição das avaliações). */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/* Estrelas de avaliação (âmbar preenchidas + cinza vazias). */
function StarRating({ value }: { value: number }) {
  return (
    <span className="lpg-stars" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < value ? 'var(--amber)' : '#dfe4e7' }}>★</span>
      ))}
    </span>
  );
}

/* Ícones dos cartões de confiança (preço fixo / RGPD / atendimento PT). */
const PROOF_ICONS: Record<'price' | 'shield' | 'doc', React.ReactNode> = {
  price: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12.6 3.2 20 10.6a2 2 0 0 1 0 2.8l-6.6 6.6a2 2 0 0 1-2.8 0L3.2 12.6A2 2 0 0 1 2.6 11l.3-5.6a2 2 0 0 1 1.9-1.9L10.4 3a2 2 0 0 1 2.2.2z" strokeLinejoin="round" />
      <circle cx="8.4" cy="8.4" r="1.6" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.2-2.9 7.6-7 8.9C7.9 18.6 5 15.2 5 11V6l7-3z" strokeLinejoin="round" />
      <path d="m9 11.6 2.1 2.1L15.3 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 2.8h9.2L19 6.6V21.2H6z" strokeLinejoin="round" />
      <path d="M9 9.5h6M9 13h6M9 16.5h3.6" strokeLinecap="round" />
    </svg>
  ),
};

/* Número com efeito de contagem (CountUp): sobe de 0 até `end` quando entra
   no ecrã. Respeita prefers-reduced-motion (salta direto para o valor final)
   e usa easing easeOutCubic. Formato PT usa vírgula decimal. */
function CountUp({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1600,
  lang,
}: {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  lang: LangKey;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started.current) return;
        started.current = true;
        if (reduce) {
          setVal(end);
          return;
        }
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(end * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  const fixed = val.toFixed(decimals);
  const num = lang === 'pt' ? fixed.replace('.', ',') : fixed;
  return (
    <span ref={ref}>
      {prefix}
      {num}
      {suffix}
    </span>
  );
}

type ReviewItem = { name: string; date: string; rating: number; text: string; photo?: string };

/* Carrossel horizontal das avaliações do Google: scroll-snap nativo (arrastar/
   roda/swipe), no máximo 3 cartões visíveis de cada vez no desktop (cada
   slide = 1/3 da largura da faixa) e ~1 no telemóvel (com um bocado do
   próximo à mostra, como pista de que há mais). Bullets por baixo — um por
   avaliação — indicam a posição na lista; clicar num bullet leva a esse
   cartão. O estado "ativo" vem de um IntersectionObserver com root na própria
   faixa: o bullet aceso é sempre o cartão mais à esquerda visível. */
function ReviewsCarousel({ reviews, lang }: { reviews: ReviewItem[]; lang: LangKey }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = Number((e.target as HTMLElement).dataset.idx);
          if (e.isIntersecting) visible.add(idx);
          else visible.delete(idx);
        });
        if (visible.size) setActive(Math.min(...visible));
      },
      { root: track, threshold: 0.6 }
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [reviews.length]);

  const goTo = (i: number) => {
    const el = itemRefs.current[i];
    const track = trackRef.current;
    if (!el || !track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: el.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="lpg-testi-carousel lpg-reveal">
      <div className="lpg-testi-track" ref={trackRef}>
        {reviews.map((r, i) => (
          <figure
            className="lpg-review lpg-testi-slide"
            key={i}
            data-idx={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <div className="lpg-review-top">
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar externo do Google (42px), sem ganho em otimizar
                <img
                  className="lpg-review-avatar-img"
                  src={r.photo}
                  alt=""
                  width={42}
                  height={42}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  className="lpg-review-avatar"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  aria-hidden="true"
                >
                  {r.name.charAt(0)}
                </span>
              )}
              <span className="lpg-review-meta">
                <span className="lpg-review-name">{r.name}</span>
                {r.date && <span className="lpg-review-date">{r.date}</span>}
              </span>
              <GoogleG className="lpg-review-g" />
            </div>
            <StarRating value={r.rating} />
            <p className="lpg-review-text">“{r.text}”</p>
          </figure>
        ))}
      </div>
      {reviews.length > 1 && (
        <div className="lpg-testi-dots" role="tablist" aria-label={lang === 'pt' ? 'Avaliações' : 'Reviews'}>
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              className={`lpg-testi-dot${i === active ? ' is-active' : ''}`}
              aria-label={lang === 'pt' ? `Avaliação ${i + 1} de ${reviews.length}` : `Review ${i + 1} of ${reviews.length}`}
              aria-selected={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Fundo animado do hero: rede de conexões ("a rede onde os clientes te
// encontram"). Canvas 2D procedural, sem dependências: nós em teal/petróleo,
// ligações por proximidade, ligações âmbar ao cursor e pulsos âmbar que viajam
// pelas linhas (clientes a chegar). Legibilidade garantida por opacidades
// baixas + máscara radial atrás do título (CSS .lpg-hero-net).
// Performance: DPR limitado a 2, pausa fora do viewport (IntersectionObserver)
// e em separadores ocultos; prefers-reduced-motion desenha 1 frame estático.
// ============================================================================

/* PRNG determinística (mulberry32): o layout da rede é composto, não sorteado.
   Seed 1349 — o preço da oferta. */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function HeroNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    type NetNode = { x: number; y: number; vx: number; vy: number; r: number; amber: boolean; phase: number };
    type Pulse = { a: number; b: number; t: number; dur: number };

    let w = 0, h = 0, dpr = 1;
    let nodes: NetNode[] = [];
    let pulses: Pulse[] = [];
    let ripples: { n: number; t: number }[] = [];
    let linkDist = 120;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let pulseTimer = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const parallax = { x: 0, y: 0 };

    function build() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width; h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = mulberry32(1349);
      const count = Math.max(30, Math.min(90, Math.round((w * h) / 19000)));
      linkDist = Math.max(100, Math.min(160, Math.sqrt(w * h) / 7.8));
      nodes = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 22,
        vy: (rand() - 0.5) * 22,
        r: 1.2 + rand() * 1.4,
        amber: rand() < 0.09,
        phase: rand() * Math.PI * 2,
      }));
      pulses = [];
      ripples = [];
    }

    function drawnPos(n: NetNode, out: { x: number; y: number }) {
      // repulsão suave de "lente" à volta do cursor + parallax global
      let dx = 0, dy = 0;
      if (mouse.active) {
        const mx = n.x - mouse.x, my = n.y - mouse.y;
        const d = Math.hypot(mx, my);
        if (d < 140 && d > 0.001) {
          const f = ((140 - d) / 140) * 12;
          dx = (mx / d) * f; dy = (my / d) * f;
        }
      }
      out.x = n.x + dx + parallax.x;
      out.y = n.y + dy + parallax.y;
    }

    const pa = { x: 0, y: 0 }, pb = { x: 0, y: 0 };

    function draw(dt: number, t: number) {
      ctx!.clearRect(0, 0, w, h);

      // parallax segue o cursor com inércia
      const tx = mouse.active ? (mouse.x - w / 2) * 0.014 : 0;
      const ty = mouse.active ? (mouse.y - h / 2) * 0.014 : 0;
      parallax.x += (tx - parallax.x) * Math.min(1, dt * 2.4);
      parallax.y += (ty - parallax.y) * Math.min(1, dt * 2.4);

      // ligações entre nós próximos
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ddx = nodes[i].x - nodes[j].x, ddy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(ddx, ddy);
          if (d < linkDist) {
            drawnPos(nodes[i], pa); drawnPos(nodes[j], pb);
            ctx!.strokeStyle = `rgba(31,111,107,${((1 - d / linkDist) * 0.22).toFixed(3)})`;
            ctx!.beginPath(); ctx!.moveTo(pa.x, pa.y); ctx!.lineTo(pb.x, pb.y); ctx!.stroke();
          }
        }
      }

      // ligações âmbar do cursor aos nós próximos
      if (mouse.active) {
        ctx!.lineWidth = 1.2;
        for (const n of nodes) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < 170) {
            drawnPos(n, pa);
            ctx!.strokeStyle = `rgba(232,169,60,${((1 - d / 170) * 0.36).toFixed(3)})`;
            ctx!.beginPath(); ctx!.moveTo(mouse.x, mouse.y); ctx!.lineTo(pa.x, pa.y); ctx!.stroke();
          }
        }
      }

      // nós (respiração subtil no raio)
      for (const n of nodes) {
        drawnPos(n, pa);
        const breath = 1 + Math.sin(t * 0.0012 + n.phase) * 0.18;
        if (n.amber) {
          const halo = ctx!.createRadialGradient(pa.x, pa.y, 0, pa.x, pa.y, n.r * 6);
          halo.addColorStop(0, 'rgba(232,169,60,.22)');
          halo.addColorStop(1, 'rgba(232,169,60,0)');
          ctx!.fillStyle = halo;
          ctx!.beginPath(); ctx!.arc(pa.x, pa.y, n.r * 6, 0, Math.PI * 2); ctx!.fill();
          ctx!.fillStyle = 'rgba(212,148,31,.7)';
        } else {
          ctx!.fillStyle = 'rgba(18,59,79,.4)';
        }
        ctx!.beginPath(); ctx!.arc(pa.x, pa.y, n.r * breath, 0, Math.PI * 2); ctx!.fill();
      }

      // pulsos âmbar a viajar pelas ligações (clientes a chegar)
      for (const p of pulses) {
        const a = nodes[p.a], b = nodes[p.b];
        drawnPos(a, pa); drawnPos(b, pb);
        const x = pa.x + (pb.x - pa.x) * p.t, y = pa.y + (pb.y - pa.y) * p.t;
        const g = ctx!.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, 'rgba(232,169,60,.85)');
        g.addColorStop(1, 'rgba(232,169,60,0)');
        ctx!.fillStyle = g;
        ctx!.beginPath(); ctx!.arc(x, y, 7, 0, Math.PI * 2); ctx!.fill();
      }

      // ondas de chegada: círculo que expande e desvanece no nó de destino
      ctx!.lineWidth = 1.4;
      for (const r of ripples) {
        drawnPos(nodes[r.n], pa);
        ctx!.strokeStyle = `rgba(232,169,60,${((1 - r.t) * 0.4).toFixed(3)})`;
        ctx!.beginPath(); ctx!.arc(pa.x, pa.y, 3 + r.t * 26, 0, Math.PI * 2); ctx!.stroke();
      }
    }

    function step(dt: number) {
      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt;
        // wrap com margem para não "nascer" no meio do ecrã
        if (n.x < -30) n.x = w + 30; else if (n.x > w + 30) n.x = -30;
        if (n.y < -30) n.y = h + 30; else if (n.y > h + 30) n.y = -30;
      }
      // novo pulso a cada ~1.3s numa ligação ativa (máx. 4 em simultâneo)
      pulseTimer -= dt;
      if (pulseTimer <= 0 && pulses.length < 4) {
        pulseTimer = 1.3;
        for (let tries = 0; tries < 12; tries++) {
          const a = Math.floor(Math.random() * nodes.length);
          const b = Math.floor(Math.random() * nodes.length);
          if (a === b) continue;
          const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
          if (d < linkDist) { pulses.push({ a, b, t: 0, dur: 0.9 + d / 160 }); break; }
        }
      }
      for (const p of pulses) {
        p.t += dt / p.dur;
        // pulso chegou ao destino: emite uma onda ("o cliente chegou")
        if (p.t >= 1) ripples.push({ n: p.b, t: 0 });
      }
      pulses = pulses.filter((p) => p.t < 1);
      for (const r of ripples) r.t += dt / 0.7;
      ripples = ripples.filter((r) => r.t < 1);
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw(dt, now);
    }

    build();

    if (reduced) {
      // frame único, legível e estático (sem listeners de rato nem loop)
      draw(0, 0);
      const ro = new ResizeObserver(() => { build(); draw(0, 0); });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    // primeiro frame imediato (rAF não corre em separadores ocultos)
    draw(0, performance.now());

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { build(); draw(0, performance.now()); });
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.y > -80 && mouse.y < rect.height + 80;
    };
    const onLeave = () => { mouse.active = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="lpg-hero-net" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

// ============================================================================
// CSS com escopo em .lpg-root
// ============================================================================

const STYLES = `
.lpg-root {
  --bg: #F7F9FA;
  --teal: #1F6F6B;
  --teal-dark: #16544f;
  --white: #FFFFFF;
  --deep: #123B4F;
  --amber: #E8A93C;
  --amber-dark: #d4941f;
  --amber-ink: #2B2F33;
  --ink: #2B2F33;
  --muted: #55606a;
  --line: #e4e9ec;
  --card-border: 1px solid rgba(18, 59, 79, 0.08);
  --soft: 0 1px 2px rgba(18,59,79,.04), 0 16px 34px -18px rgba(18,59,79,.20);
  --soft-lg: 0 2px 6px rgba(18,59,79,.06), 0 30px 60px -24px rgba(18,59,79,.28);
  --nav-offset: 84px; /* folga do topo (padding-root + navbar) p/ o hero cobrir atrás */

  background: var(--bg);
  color: var(--ink);
  position: relative;
  z-index: 0;
  font-family: var(--font-primary, 'Inter'), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  letter-spacing: -0.01em;
  min-height: 100vh;
  overflow-x: clip; /* clip (não hidden) p/ não quebrar o position:sticky da navbar ilha */
  padding-top: 16px; /* folga do topo p/ a ilha flutuar (padding não sofre margin-collapse) */
  -webkit-font-smoothing: antialiased;
}
.lpg-root * { box-sizing: border-box; }
.lpg-root p { color: inherit; margin: 0; }
.lpg-root h1, .lpg-root h2, .lpg-root h3, .lpg-root h4 {
  font-family: var(--font-title, 'Sora'), system-ui, -apple-system, sans-serif;
  color: var(--deep);
  line-height: 1.14;
  letter-spacing: -0.02em;
  margin: 0;
}
.lpg-root a { color: inherit; text-decoration: none; }
.lpg-root :focus-visible {
  outline: 3px solid var(--teal);
  outline-offset: 2px;
  border-radius: 6px;
}
.lpg-root ::selection { background: rgba(31,111,107,0.18); color: var(--ink); }

.lpg-skip {
  position: absolute; left: -9999px; top: 0; z-index: 300;
  background: var(--deep); color: #fff; padding: 12px 18px; border-radius: 0 0 8px 0;
  font-weight: 700;
}
.lpg-skip:focus { left: 0; }

.lpg-wrap { width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }

/* ---------- Botões ---------- */
.lpg-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  font-weight: 700; font-size: 1rem; line-height: 1;
  border-radius: 999px; padding: 17px 26px; min-height: 54px;
  cursor: pointer; border: 2px solid transparent;
  transition: transform .15s ease, box-shadow .2s ease, background-color .2s ease;
  text-align: center;
}
.lpg-btn:active { transform: scale(.98); }
/* CTA âmbar — texto SEMPRE escuro (contraste AA); look sóbrio/executivo:
   sólido, sombra suave e leve elevação no hover (sem borda dura nem offset) */
.lpg-btn-amber { background: var(--amber); color: var(--amber-ink); box-shadow: 0 8px 20px -8px rgba(232,169,60,.75); }
.lpg-btn-amber:hover { background: var(--amber-dark); transform: translateY(-2px); box-shadow: 0 14px 28px -10px rgba(232,169,60,.85); }
.lpg-btn-amber:active { transform: translateY(0); }
.lpg-btn-teal { background: var(--teal); color: #fff; }
.lpg-btn-teal:hover { background: var(--teal-dark); }
.lpg-btn-outline { background: transparent; color: var(--teal); border: 1px solid var(--teal); }
.lpg-btn-outline:hover { background: rgba(31,111,107,.06); }
.lpg-btn-wa { background: #25D366; color: #08331b; box-shadow: 0 8px 20px -8px rgba(37,211,102,.7); }
.lpg-btn-wa:hover { background: #1eb757; transform: translateY(-2px); box-shadow: 0 14px 28px -10px rgba(37,211,102,.8); }
.lpg-btn-wa:active { transform: translateY(0); }
.lpg-btn-block { width: 100%; }

.lpg-badge {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: .74rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  color: var(--teal); background: transparent;
  border: 1px solid rgba(31,111,107,.28); border-radius: 999px; padding: 6px 15px;
}

/* ---------- Linguagem visual: grão + tipografia mista ---------- */
/* Grão de textura por secção ("honestidade digital") */
.lpg-grain { position: relative; }
.lpg-grain::after {
  content: ""; position: absolute; inset: 0; z-index: 0; opacity: .06;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: multiply; pointer-events: none;
}
.lpg-dark.lpg-grain::after, .lpg-final.lpg-grain::after, .lpg-ai-sec.lpg-grain::after { mix-blend-mode: overlay; opacity: .09; }

/* Sublinhado desenhado (palavra-destaque do hero e dos títulos) */
.lpg-underline { position: absolute; left: 0; bottom: -0.12em; width: 100%; height: .19em; overflow: visible; }

/* Títulos de secção com fontes misturadas */
.lpg-t-seg--serif { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; letter-spacing: -0.01em; }
.lpg-t-seg--bold { font-weight: 700; }
.lpg-t-seg--black { font-weight: 800; letter-spacing: -0.035em; }
.lpg-t-seg--accent {
  display: inline-block; position: relative; padding: 0 .04em .08em; white-space: nowrap;
  background: linear-gradient(92deg, #1F6F6B 8%, #2f9d8f 42%, #E8A93C 92%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
/* Em secções escuras, stops mais claros para contraste */
.lpg-dark .lpg-t-seg--accent, .lpg-final .lpg-t-seg--accent {
  background: linear-gradient(92deg, #4cc6b6 8%, #ffd98a 92%);
  -webkit-background-clip: text; background-clip: text;
}

/* ---------- Header: navbar ILHA (liquid glass) ---------- */
/* Container de posicionamento: sticky com folga, sem encostar nas bordas. */
.lpg-header {
  position: sticky;
  top: 16px;             /* fica preso a 16px do topo ao rolar (ilha flutuante) */
  z-index: 200;
  padding: 0 20px;       /* folga lateral: a ilha não encosta nas bordas */
}
.lpg-nav-wrap { position: relative; max-width: 1120px; margin: 0 auto; }

/* A pílula em vidro usa <GlassEffect> (refração real via filtro SVG, ver
   @/components/ui/liquid-glass) — aqui só o layout do conteúdo por cima.
   Tint branco: mantém o texto/logo escuros legíveis (WCAG AA). */
.lpg-nav-shell { border: 1px solid rgba(18, 59, 79, 0.10); }
.lpg-header .lpg-nav {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 20px;
}

.lpg-logo { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-title,'Sora'),sans-serif; font-weight: 800; font-size: 1.12rem; color: var(--deep); letter-spacing: -0.02em; }
.lpg-logo-img { display: block; height: 38px; width: 38px; object-fit: contain; }
.lpg-logo-img--invert { filter: invert(1); } /* elefante branco sobre o rodapé escuro */
.lpg-header-right { display: flex; align-items: center; gap: 10px; }
.lpg-lang { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.7); }
.lpg-lang button { border: 0; background: transparent; padding: 7px 12px; font-weight: 700; font-size: .82rem; color: var(--muted); cursor: pointer; }
.lpg-lang button[aria-pressed="true"] { background: var(--teal); color: #fff; }
.lpg-header .lpg-btn { min-height: 44px; padding: 11px 18px; font-size: .9rem; }
/* Dentro da pílula de vidro: sombra âmbar suave, sem deslocamento */
.lpg-header .lpg-btn-amber { box-shadow: 0 4px 12px -6px rgba(232,169,60,.7); }
.lpg-header .lpg-btn-amber:hover { transform: none; box-shadow: 0 6px 16px -6px rgba(232,169,60,.85); }
.lpg-header-cta-desktop { display: inline-flex; }

/* Hamburger (só mobile) */
.lpg-burger { display: none; align-items: center; justify-content: center; width: 42px; height: 42px; padding: 0; border: 1px solid var(--line); border-radius: 12px; background: rgba(255,255,255,0.6); cursor: pointer; }
.lpg-burger-box { position: relative; display: block; width: 20px; height: 14px; }
.lpg-burger-box span { position: absolute; left: 0; height: 2px; width: 100%; background: var(--deep); border-radius: 2px; transition: transform .25s ease, opacity .2s ease, top .25s ease; }
.lpg-burger-box span:nth-child(1) { top: 0; }
.lpg-burger-box span:nth-child(2) { top: 6px; }
.lpg-burger-box span:nth-child(3) { top: 12px; }
.lpg-burger-box.is-open span:nth-child(1) { top: 6px; transform: rotate(45deg); }
.lpg-burger-box.is-open span:nth-child(2) { opacity: 0; }
.lpg-burger-box.is-open span:nth-child(3) { top: 6px; transform: rotate(-45deg); }

/* Dropdown mobile em vidro líquido (GlassEffect) */
.lpg-nav-menu-glass {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0;
  border: 1px solid rgba(18, 59, 79, 0.10);
}
.lpg-nav-menu { padding: 14px; }

/* ---------- Secções ---------- */
.lpg-section { padding: 76px 0; scroll-margin-top: 80px; }
.lpg-eyebrow-center { text-align: center; }
.lpg-h2 { font-size: clamp(2.1rem, 5.4vw, 3.5rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; }
.lpg-lead { color: var(--muted); font-size: clamp(1.02rem, 2.4vw, 1.18rem); font-family: Georgia, 'Times New Roman', serif; font-style: italic; }

/* ---------- Hero: editorial, sóbrio, com colagem de portefólio ---------- */
/* margin-top negativo + padding compensatório: o fundo do hero sobe para trás
   da navbar flutuante (sem cortes de cor no topo). */
.lpg-hero { position: relative; margin-top: calc(-1 * var(--nav-offset)); padding: calc(60px + var(--nav-offset)) 0 88px; overflow: hidden; }
/* fundo: gradientes suaves (morfismo discreto) */
.lpg-hero::before {
  content: ""; position: absolute; inset: -12% -6%; z-index: 0;
  background:
    radial-gradient(42% 48% at 90% 6%, rgba(31,111,107,.12), transparent 64%),
    radial-gradient(38% 44% at 0% 88%, rgba(232,169,60,.13), transparent 64%);
  pointer-events: none;
}
/* Rede animada de fundo: entre os blobs (::before) e o conteúdo (z1).
   A máscara radial esvanece a rede atrás do título para não custar leitura. */
.lpg-hero-net {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  -webkit-mask-image: radial-gradient(58% 74% at 26% 42%, rgba(0,0,0,.24), rgba(0,0,0,.82) 58%, #000 80%);
  mask-image: radial-gradient(58% 74% at 26% 42%, rgba(0,0,0,.24), rgba(0,0,0,.82) 58%, #000 80%);
}
.lpg-hero-net canvas { display: block; width: 100%; height: 100%; }
/* (grão do hero vem da utility .lpg-grain aplicada na section) */
.lpg-hero-in {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1.02fr 0.98fr; gap: 52px; align-items: center;
}
.lpg-hero-copy { min-width: 0; }

/* Título editorial: fontes misturadas, sem rotações (limpo e confiante) */
.lpg-h1 { font-size: clamp(2rem, 4.2vw, 3.35rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; }
.lpg-h1-line { display: block; }
.lpg-h1-line + .lpg-h1-line { margin-top: .02em; }
.lpg-h1-seg { display: inline-block; }
.lpg-h1-seg--serif { font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: 400; letter-spacing: -0.02em; }
.lpg-h1-seg--bold { font-weight: 700; }
.lpg-h1-seg--black { font-weight: 800; letter-spacing: -0.05em; }
/* Palavra de destaque: gradiente interno + sublinhado desenhado */
.lpg-h1 .lpg-h1-seg.lpg-h1-seg--accent {
  position: relative; font-weight: 800; padding: 0 .02em .05em;
  background: linear-gradient(92deg, #1F6F6B 6%, #2f9d8f 46%, #E8A93C 96%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}

/* Subtítulo: serifado itálico; "SEM" em Sora com realce discreto */
.lpg-hero-sub {
  margin-top: 24px; font-size: clamp(1.06rem, 1.4vw, 1.24rem); color: var(--muted);
  max-width: 520px; font-family: Georgia, 'Times New Roman', serif; font-style: italic; line-height: 1.55;
}
.lpg-sub-emph {
  font-family: var(--font-title,'Sora'), sans-serif; font-style: normal; font-weight: 800;
  text-transform: uppercase; color: var(--deep); position: relative; padding: 0 .06em; white-space: nowrap;
}
.lpg-sub-emph::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: .04em; height: .32em;
  background: linear-gradient(90deg, rgba(232,169,60,.5), rgba(232,169,60,.16));
  z-index: -1; border-radius: 2px;
}

.lpg-hero-cta { margin-top: 32px; }

/* Colagem de portefólio (screenshots reais de sites criados) */
.lpg-hero-collage { position: relative; min-height: 440px; }
.lpg-collage-item {
  position: absolute; border-radius: 14px; overflow: hidden; background: #fff;
  border: 1px solid rgba(18,59,79,.06); box-shadow: var(--soft-lg);
}
.lpg-collage-item img { object-fit: cover; object-position: top center; }
.lpg-collage-back { width: 64%; aspect-ratio: 16 / 11; top: 0; left: 0; z-index: 1; }
.lpg-collage-front { width: 72%; aspect-ratio: 16 / 11; bottom: 0; right: 0; z-index: 2; }
.lpg-collage-chip {
  position: absolute; z-index: 3; left: -3%; bottom: 22%;
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 13px 17px;
  background: var(--amber); color: var(--amber-ink); border-radius: 13px;
  box-shadow: 0 18px 36px -12px rgba(232,169,60,.75);
}
.lpg-collage-chip .big { font-family: var(--font-title,'Sora'),sans-serif; font-weight: 800; font-size: 1.2rem; line-height: 1; }
.lpg-collage-chip .sm { font-size: .66rem; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; opacity: .82; }

/* Tipografia cinética: entrada em cascata + sublinhado que se desenha.
   opacity:0 SÓ dentro de no-preference — com reduced-motion tudo fica visível. */
@media (prefers-reduced-motion: no-preference) {
  .lpg-h1-seg { opacity: 0; animation: lpgSegIn .65s cubic-bezier(.22,1,.36,1) forwards; }
  .lpg-hero-sub, .lpg-hero-cta, .lpg-seals { opacity: 0; animation: lpgFadeUp .7s ease forwards; }
  .lpg-hero-sub { animation-delay: .55s; }
  .lpg-hero-cta { animation-delay: .7s; }
  .lpg-seals { animation-delay: .85s; }
  .lpg-underline path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: lpgDraw .8s ease .75s forwards; }
}
@keyframes lpgSegIn { from { opacity: 0; transform: translateY(26px) rotate(0deg); } to { opacity: 1; transform: translateY(0) rotate(var(--seg-r, 0deg)); } }
@keyframes lpgFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes lpgDraw { to { stroke-dashoffset: 0; } }
.lpg-seals { display: flex; flex-wrap: wrap; gap: 12px 22px; margin-top: 30px; }
.lpg-seal { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: .92rem; color: var(--deep); }
.lpg-seal .ic { color: var(--teal); display: inline-flex; }

/* Dor (secção âncora escura) */
.lpg-dark { background: var(--deep); color: #eaf1f3; }
.lpg-dark h1, .lpg-dark h2, .lpg-dark h3 { color: #fff; }
.lpg-dark .lpg-badge { color: #ffd98a; background: rgba(232,169,60,.14); border-color: rgba(232,169,60,.3); }
.lpg-dark .lpg-lead { color: #c5d3d8; }
/* Secções com o mockup de monitor: grid de 2 colunas totalmente CONTIDO
   (nunca corta o banner de alerta/sucesso — esse é o ponto da secção). */
.lpg-img-sec .lpg-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
.lpg-sec-copy { min-width: 0; max-width: 480px; }
.lpg-sec-illus { min-width: 0; width: 100%; pointer-events: none; }

/* ---- Mockup "monitor com página de busca" (secções problema/solução) ---- */
.lpg-mock { display: flex; flex-direction: column; align-items: center; width: 100%; }
.lpg-mock-monitor {
  width: 100%; background: #232b30; border-radius: 16px; padding: 12px 12px 0;
  box-shadow: var(--soft-lg); position: relative;
}
.lpg-mock-cam { position: absolute; top: 5px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.22); }
.lpg-mock-screen { background: #fff; border-radius: 8px 8px 3px 3px; overflow: hidden; }
.lpg-mock-chrome { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; background: #eef0f1; border-bottom: 1px solid #e1e4e6; }
.lpg-mock-dot { width: 8px; height: 8px; border-radius: 50%; }
.lpg-mock-dot--1 { background: #ff5f57; }
.lpg-mock-dot--2 { background: #febc2e; }
.lpg-mock-dot--3 { background: #28c840; }
.lpg-mock-addr {
  flex: 1; margin-left: 8px; display: flex; align-items: center; gap: 6px;
  background: #fff; border: 1px solid #dfe1e5; border-radius: 14px; padding: 4px 10px;
  font-size: .66rem; color: #5f6368; white-space: nowrap; overflow: hidden;
}
.lpg-mock-page { padding: 20px 22px 22px; }
.lpg-mock-searchrow {
  display: flex; align-items: center; gap: 10px; border: 1px solid #dfe1e5; border-radius: 24px;
  padding: 9px 16px; box-shadow: 0 1px 5px rgba(0,0,0,.08); margin-bottom: 14px; color: #9aa0a6;
}
.lpg-mock-query { flex: 1; font-size: .86rem; color: #202124; font-family: var(--font-primary,'Inter'),sans-serif; }
.lpg-mock-tabs { display: flex; gap: 16px; font-size: .68rem; color: #5f6368; padding-bottom: 9px; border-bottom: 1px solid #ebebeb; margin-bottom: 14px; }
.lpg-mock-tabs .is-active { color: var(--teal); font-weight: 700; padding-bottom: 8px; border-bottom: 2px solid var(--teal); }
.lpg-mock-results { display: flex; flex-direction: column; gap: 14px; }
.lpg-mock-result-head { display: flex; align-items: center; gap: 8px; }
.lpg-mock-result-domain { font-size: .64rem; color: #202124; opacity: .65; }
.lpg-mock-result-title { font-size: .88rem; font-weight: 700; color: var(--teal-dark); margin-top: 1px; }
.lpg-mock-result-desc { font-size: .72rem; color: #4d5156; margin-top: 2px; }
.lpg-mock-result.is-you {
  background: rgba(31,111,107,.06); border-left: 3px solid var(--teal); border-radius: 6px;
  padding: 8px 10px; margin: -8px -10px -8px -13px;
}
.lpg-mock-tag {
  display: inline-flex; align-items: center; font-size: .6rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: .04em; color: #146c2e; background: rgba(30,142,62,.14); padding: 2px 8px; border-radius: 999px;
}
.lpg-mock-banner { display: flex; gap: 10px; align-items: flex-start; margin-top: 18px; padding: 12px 14px; border-radius: 10px; }
.lpg-mock-banner strong { display: block; font-size: .82rem; }
.lpg-mock-banner p { margin: 2px 0 0; font-size: .74rem; line-height: 1.4; opacity: .92; }
.lpg-mock-banner--alert { background: #fdecea; color: #a3271b; border: 1px solid #f5c6c0; }
.lpg-mock-banner--success { background: #e6f4ea; color: #1e4620; border: 1px solid #bfe3c9; }
.lpg-mock-stand { display: flex; flex-direction: column; align-items: center; }
.lpg-mock-neck { width: 13%; height: 20px; background: #232b30; border-radius: 0 0 5px 5px; margin-top: -2px; }
.lpg-mock-base { width: 32%; height: 9px; background: #232b30; border-radius: 6px; margin-top: 3px; box-shadow: 0 5px 12px rgba(0,0,0,.18); }

/* Solução */
.lpg-solution-text { max-width: 760px; }

/* Como funciona */
.lpg-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 44px; position: relative; }
/* linha de fluxo tracejada a ligar os 3 passos (só desktop, visível nos intervalos) */
@media (min-width: 861px) {
  .lpg-steps::before {
    content: ""; position: absolute; top: 57px; left: 0; right: 0; height: 2px; z-index: 0;
    background: repeating-linear-gradient(90deg, rgba(31,111,107,.38) 0 8px, transparent 8px 16px);
  }
  .lpg-steps .lpg-step { position: relative; z-index: 1; }
}
.lpg-steps .lpg-step {
  background: var(--white); border: var(--card-border); border-radius: 18px; padding: 32px 28px;
  box-shadow: var(--soft);
  transition: transform .25s ease, box-shadow .25s ease, opacity .5s ease;
}
.lpg-steps .lpg-step:hover { transform: translateY(-4px); box-shadow: var(--soft-lg); }
.lpg-step-ic { width: 52px; height: 52px; border-radius: 13px; background: rgba(31,111,107,.09); color: var(--teal); display: grid; place-items: center; }
/* número do passo — discreto e tipográfico (sem "autocolante") */
.lpg-step-n { display: block; margin-top: 22px; font-size: .78rem; font-weight: 800; letter-spacing: .18em; color: var(--teal); }
.lpg-step h3 { font-size: 1.18rem; font-weight: 700; margin-top: 4px; }
.lpg-step p { color: var(--muted); margin-top: 8px; font-size: .98rem; }

/* Prova / confiança: cartões com ícone em "chip", título + texto e fio de
   gradiente no topo; hover eleva ligeiramente. */
.lpg-proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 42px; }
.lpg-proof-card {
  position: relative; overflow: hidden;
  background: var(--white); border: var(--card-border); border-radius: 18px;
  padding: 28px 26px; display: flex; align-items: flex-start; gap: 16px;
  box-shadow: var(--soft);
  transition: transform .25s ease, box-shadow .25s ease;
}
.lpg-proof-card::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--teal), var(--amber));
}
.lpg-proof-card:hover { transform: translateY(-4px); box-shadow: var(--soft-lg); }
.lpg-proof-ic {
  width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
  display: grid; place-items: center; color: var(--teal);
  background: rgba(31,111,107,.09); border: 1px solid rgba(31,111,107,.16);
}
h3.lpg-proof-title { font-size: 1.02rem; color: var(--deep); letter-spacing: -0.01em; }
.lpg-proof-card p { color: var(--muted); font-weight: 500; margin-top: 6px; font-size: .93rem; line-height: 1.55; }
.lpg-stars { color: var(--amber); letter-spacing: 2px; font-size: 1rem; }

/* Avaliações do Google */
.lpg-reviews-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-top: 56px; }
.lpg-reviews-title { color: var(--deep); font-family: var(--font-title,'Sora'),sans-serif; font-weight: 800; font-size: 1.5rem; }
.lpg-reviews-summary { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 8px; color: var(--muted); font-weight: 600; font-size: .95rem; }
.lpg-reviews-summary strong { color: var(--deep); font-weight: 800; font-size: 1.1rem; }
.lpg-gicon { width: 18px; height: 18px; flex-shrink: 0; }
/* max-content (não "fit-content": em Chrome, a keyword bare "fit-content"
   resolve para o espaço disponível em vez de min(max-content,disponível)
   quando o item é o eixo cruzado de um flex container column — comportamento
   verificado, "max-content" é o fix robusto) + alinhado à esquerda quando a
   cabeça empilha (ver media query mobile mais abaixo). Seletor qualificado
   com o pai (.lpg-reviews-head): há uma regra genérica ".lpg-btn{width:100%}"
   em @media(max-width:560px) — mesma especificidade (0,1,0) que um simples
   ".lpg-reviews-cta" perderia por ordem no ficheiro (essa vem depois). Aqui
   com o pai ganhamos (0,2,0), sem tocar na regra genérica (usada por outros
   CTAs que DEVEM continuar full-width no telemóvel). */
.lpg-reviews-head .lpg-reviews-cta { align-self: flex-start; width: max-content; min-height: 46px; padding: 12px 20px; font-size: .9rem; gap: 9px; }

/* Carrossel: faixa com scroll-snap horizontal + bullets por baixo. No desktop
   cada slide ocupa 1/3 da faixa (3 visíveis); no telemóvel ~88% (1 visível,
   com um bocado do próximo espreitando). */
.lpg-testi-carousel { margin-top: 34px; }
.lpg-testi-track {
  display: flex; gap: 18px; margin: 0 -4px; padding: 4px 4px 6px;
  overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.lpg-testi-track::-webkit-scrollbar { display: none; }
.lpg-testi-slide { scroll-snap-align: start; flex: 0 0 calc((100% - 2 * 18px) / 3); min-width: 0; }
.lpg-testi-dots { display: flex; justify-content: center; gap: 9px; margin-top: 18px; }
.lpg-testi-dot { width: 9px; height: 9px; padding: 0; border: 0; border-radius: 50%; background: var(--line); cursor: pointer; transition: background .2s ease, transform .2s ease; }
.lpg-testi-dot:hover { background: rgba(31,111,107,.5); }
.lpg-testi-dot.is-active { background: var(--teal); transform: scale(1.3); }
@media (max-width: 860px) {
  /* flex-wrap:nowrap explícito: com wrap, um container column só com este botão
     "sobrando" numa 2ª linha ficava a ocupar a largura toda da linha (bug de
     cross-size em linhas de wrap), ignorando visualmente o width:fit-content. */
  .lpg-reviews-head { flex-direction: column; flex-wrap: nowrap; align-items: flex-start; }
  .lpg-testi-slide { flex-basis: 88%; }
}

.lpg-review { background: var(--white); border: var(--card-border); border-radius: 16px; padding: 24px; box-shadow: var(--soft); height: 100%; }
.lpg-review-top { display: flex; align-items: center; gap: 12px; }
.lpg-review-avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 1.05rem; flex-shrink: 0; text-transform: uppercase; }
.lpg-review-avatar-img { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; object-fit: cover; }
.lpg-review-meta { display: flex; flex-direction: column; line-height: 1.25; flex: 1; min-width: 0; }
.lpg-review-name { font-weight: 700; color: var(--deep); font-size: .95rem; }
.lpg-review-date { color: var(--muted); font-size: .8rem; }
.lpg-review-g { width: 18px; height: 18px; flex-shrink: 0; }
.lpg-review .lpg-stars { display: inline-block; margin-top: 14px; }
.lpg-review-text { color: var(--ink); margin-top: 8px; font-family: Georgia, 'Times New Roman', serif; font-style: italic; line-height: 1.55; }

/* ---- Secção de destaque: "também encontrado pela IA" ----
   Usa .lpg-dark para herdar cores base + gradiente claro do texto-destaque;
   .lpg-ai-sec só sobrepõe o fundo (gradiente mais rico) e o layout. */
.lpg-ai-sec {
  position: relative; overflow: hidden; text-align: center;
  background: linear-gradient(155deg, var(--deep) 0%, #103f52 55%, #17565f 100%);
}
.lpg-ai-copy { max-width: 620px; margin: 0 auto; position: relative; z-index: 2; }

/* Ilustração: orbe central de IA a "escanear" e a encontrar sites à volta */
.lpg-ai-illus { position: relative; width: min(400px, 88vw); aspect-ratio: 1; margin: 56px auto 0; z-index: 2; }
.lpg-ai-glow {
  position: absolute; inset: 8%; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,169,60,.55), rgba(31,111,107,.35) 55%, transparent 75%);
  filter: blur(28px);
}
.lpg-ai-ring { position: absolute; inset: 14%; border-radius: 50%; border: 1px dashed rgba(255,255,255,.22); }
.lpg-ai-ring--2 { inset: 26%; border-color: rgba(232,169,60,.3); }
.lpg-ai-sweep {
  position: absolute; inset: 14%; border-radius: 50%; overflow: hidden;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(232,169,60,.4) 22deg, transparent 68deg);
}
.lpg-ai-orb {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 30%; aspect-ratio: 1; border-radius: 50%;
  background: linear-gradient(145deg, var(--teal) 0%, #2f9d8f 45%, var(--amber) 100%);
  display: grid; place-items: center;
  box-shadow: 0 0 0 6px rgba(255,255,255,.07), 0 20px 50px -10px rgba(0,0,0,.5);
}
.lpg-ai-orb svg { width: 44%; height: 44%; }
.lpg-ai-site { position: absolute; width: 62px; filter: drop-shadow(0 10px 18px rgba(0,0,0,.35)); }
.lpg-ai-site--1 { top: 3%;  left: 64%; }
.lpg-ai-site--2 { top: 58%; left: 76%; }
.lpg-ai-site--3 { top: 72%; left: 8%;  }
.lpg-ai-site--4 { top: 6%;  left: 4%;  }
.lpg-ai-ping {
  position: absolute; top: 50%; left: 50%; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px;
  border-radius: 50%; background: #ffd98a; opacity: 0;
  box-shadow: 0 0 8px 2px rgba(255,217,138,.7);
}
.lpg-ai-ping--1 { --tx: 93px;  --ty: -153px; }
.lpg-ai-ping--2 { --tx: 138px; --ty: 60px; }
.lpg-ai-ping--3 { --tx: -120px; --ty: 113px; }
.lpg-ai-ping--4 { --tx: -135px; --ty: -138px; }
/* Todas as animações do orbe ficam SÓ aqui: reduced-motion vê uma cena estática e legível. */
@media (prefers-reduced-motion: no-preference) {
  .lpg-ai-glow { animation: lpgAiGlow 4s ease-in-out infinite; }
  .lpg-ai-ring--1 { animation: lpgAiSpin 42s linear infinite; }
  .lpg-ai-ring--2 { animation: lpgAiSpinRev 30s linear infinite; }
  .lpg-ai-sweep { animation: lpgAiSpin 6s linear infinite; }
  .lpg-ai-orb { animation: lpgAiPulse 3.2s ease-in-out infinite; }
  .lpg-ai-site--1 { animation: lpgAiFloat 5s ease-in-out infinite; animation-delay: .2s; }
  .lpg-ai-site--2 { animation: lpgAiFloat 5.6s ease-in-out infinite; animation-delay: 1s; }
  .lpg-ai-site--3 { animation: lpgAiFloat 4.6s ease-in-out infinite; animation-delay: .6s; }
  .lpg-ai-site--4 { animation: lpgAiFloat 5.2s ease-in-out infinite; animation-delay: 1.4s; }
  .lpg-ai-ping--1 { animation: lpgAiPing 3.6s ease-out infinite; animation-delay: .2s; }
  .lpg-ai-ping--2 { animation: lpgAiPing 3.6s ease-out infinite; animation-delay: 1.1s; }
  .lpg-ai-ping--3 { animation: lpgAiPing 3.6s ease-out infinite; animation-delay: 2s; }
  .lpg-ai-ping--4 { animation: lpgAiPing 3.6s ease-out infinite; animation-delay: 2.9s; }
}
@keyframes lpgAiGlow { 0%, 100% { opacity: .7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
@keyframes lpgAiSpin { to { transform: rotate(360deg); } }
@keyframes lpgAiSpinRev { to { transform: rotate(-360deg); } }
@keyframes lpgAiFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes lpgAiPulse {
  0%, 100% { box-shadow: 0 0 0 6px rgba(255,255,255,.07), 0 20px 50px -10px rgba(0,0,0,.5); transform: translate(-50%,-50%) scale(1); }
  50% { box-shadow: 0 0 0 14px rgba(232,169,60,.14), 0 24px 60px -8px rgba(0,0,0,.55); transform: translate(-50%,-50%) scale(1.05); }
}
@keyframes lpgAiPing {
  0% { opacity: 0; transform: translate(0,0) scale(.6); }
  15% { opacity: 1; }
  85% { opacity: .9; }
  100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(1); }
}

/* Método (SEO) */
.lpg-method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 36px; }
.lpg-method-card { background: var(--white); border: var(--card-border); border-radius: 16px; padding: 26px; box-shadow: var(--soft); }
.lpg-method-card h3 { font-size: 1.05rem; }
.lpg-method-card p { color: var(--muted); margin-top: 8px; font-size: .95rem; }

/* Resultados que pode medir: banda escura destacada com métricas em contagem
   (CountUp). Tiles separados por fios verticais no desktop. */
.lpg-results-band {
  position: relative; overflow: hidden; margin-top: 64px;
  border-radius: 24px; padding: 46px 44px; color: #eaf1f3;
  background: linear-gradient(150deg, #123b4f 0%, #0e2f3f 58%, #14424d 100%);
  box-shadow: var(--soft-lg);
}
.lpg-results-band::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(60% 90% at 86% 0%, rgba(232,169,60,.16), transparent 62%);
}
.lpg-results-head { position: relative; max-width: 600px; }
h3.lpg-results-title { color: #fff; font-family: var(--font-title,'Sora'),sans-serif; font-weight: 800; font-size: 1.45rem; letter-spacing: -0.01em; }
p.lpg-results-intro { color: #b9cdd4; margin-top: 10px; font-size: 1rem; line-height: 1.55; }
.lpg-results-grid { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 38px; }
.lpg-result-tile { padding: 6px 26px; border-left: 1px solid rgba(255,255,255,.14); }
.lpg-result-tile:first-child { border-left: 0; padding-left: 0; }
.lpg-result-tile .val {
  font-family: var(--font-title,'Sora'),sans-serif; font-weight: 800;
  font-size: clamp(2rem, 3.4vw, 2.7rem); color: var(--amber);
  letter-spacing: -0.02em; line-height: 1; font-variant-numeric: tabular-nums;
}
.lpg-result-tile .lpg-stars { display: inline-block; margin-top: 8px; font-size: .8rem; }
.lpg-result-tile .lbl { color: #fff; font-weight: 700; margin-top: 10px; font-size: .95rem; }
.lpg-result-tile .nt { color: #9fb6bd; font-size: .82rem; margin-top: 4px; line-height: 1.45; }
@media (max-width: 1000px) {
  .lpg-results-grid { grid-template-columns: repeat(2, 1fr); row-gap: 30px; }
  .lpg-result-tile:nth-child(odd) { border-left: 0; padding-left: 0; }
}
@media (max-width: 560px) {
  .lpg-results-band { padding: 34px 26px; }
  .lpg-results-grid { grid-template-columns: 1fr; row-gap: 0; }
  .lpg-result-tile { border-left: 0; padding: 18px 0; border-top: 1px solid rgba(255,255,255,.12); }
  .lpg-result-tile:first-child { border-top: 0; padding-top: 0; }
}

/* Oferta / preço (fundo transparente: deixa ver a rede animada) */
/* Cartão de oferta em formato "bilhete": canhoto escuro (preço+CTA) + talão branco */
.lpg-offer-card {
  position: relative; max-width: 900px; margin: 48px auto 0;
  display: grid; grid-template-columns: 0.82fr 1.18fr;
  border-radius: 24px; box-shadow: var(--soft-lg); overflow: hidden;
}
.lpg-offer-left {
  position: relative; overflow: hidden; color: #fff; padding: 46px 38px;
  background: linear-gradient(155deg, #17516a 0%, #0e2f3f 100%);
  display: flex; flex-direction: column; align-items: flex-start;
}
.lpg-offer-left::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(72% 55% at 12% -5%, rgba(232,169,60,.24), transparent 62%);
}
.lpg-offer-left > * { position: relative; z-index: 1; }
.lpg-offer-eyebrow { font-family: Georgia, serif; font-style: italic; color: #cfe0e4; font-size: 1.05rem; }
.lpg-offer-price { font-family: var(--font-title,'Sora'),sans-serif; font-weight: 800; font-size: clamp(2.9rem, 6vw, 3.9rem); line-height: .95; margin-top: 4px; letter-spacing: -0.035em; }
.lpg-offer-note { color: #a9c0c7; font-weight: 600; font-size: .84rem; margin-top: 12px; }
.lpg-offer-cta { margin-top: 26px; }
.lpg-offer-fine { color: #8fa8b0; font-size: .8rem; margin-top: 14px; font-family: Georgia, serif; font-style: italic; }
.lpg-offer-right {
  position: relative; background: #fff; padding: 42px 40px;
  border-left: 2px dashed rgba(18,59,79,.16);
}
/* entalhes tipo "picotado" no encontro das metades */
.lpg-offer-right::before, .lpg-offer-right::after {
  content: ""; position: absolute; left: -12px; width: 22px; height: 22px; border-radius: 50%; background: var(--bg);
}
.lpg-offer-right::before { top: -11px; }
.lpg-offer-right::after { bottom: -11px; }
.lpg-offer-ribbon {
  position: absolute; top: 20px; right: -36px; z-index: 3;
  background: var(--amber); color: var(--amber-ink); font-weight: 800; font-size: .7rem;
  text-transform: uppercase; letter-spacing: .12em; padding: 7px 42px; transform: rotate(45deg);
}
.lpg-includes { text-align: left; display: grid; grid-template-columns: 1fr; gap: 13px; margin: 20px 0 0; }
.lpg-includes li { display: flex; align-items: flex-start; gap: 10px; list-style: none; font-weight: 500; color: var(--ink); }
.lpg-includes .ic { color: var(--teal); flex-shrink: 0; margin-top: 2px; }
.lpg-includes-title { font-weight: 700; color: var(--deep); margin-top: 22px; text-transform: uppercase; letter-spacing: .1em; font-size: .78rem; }

/* Garantia */
.lpg-guarantee-card {
  max-width: 760px; margin: 0 auto; background: rgba(31,111,107,.05);
  border: 1px solid rgba(31,111,107,.18); border-radius: 20px; padding: 40px; text-align: center;
  box-shadow: var(--soft);
}
.lpg-guarantee-ic { width: 60px; height: 60px; margin: 0 auto 16px; border-radius: 50%; background: var(--teal); color: #fff; display: grid; place-items: center; }
.lpg-guarantee-card h2 { font-size: clamp(1.4rem, 4vw, 2rem); }
.lpg-guarantee-card p { color: var(--muted); margin-top: 12px; font-size: 1.08rem; font-family: Georgia, 'Times New Roman', serif; font-style: italic; }

/* FAQ */
.lpg-faq { max-width: 780px; margin: 40px auto 0; }
.lpg-faq-item { border: var(--card-border); border-radius: 14px; background: var(--white); margin-bottom: 12px; overflow: hidden; box-shadow: var(--soft); transition: box-shadow .2s ease, border-color .2s ease; }
/* item aberto: acento teal discreto */
.lpg-faq-item:has(.lpg-faq-q[aria-expanded="true"]) { border-color: rgba(31,111,107,.35); box-shadow: var(--soft-lg); }
.lpg-faq-q { width: 100%; text-align: left; background: transparent; border: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 20px 22px; font-weight: 700; font-size: 1.02rem; color: var(--deep);
  font-family: var(--font-title,'Sora'),sans-serif; }
.lpg-faq-q .chev { flex-shrink: 0; transition: transform .25s ease; color: var(--teal); }
.lpg-faq-q[aria-expanded="true"] .chev { transform: rotate(180deg); }
.lpg-faq-panel { max-height: 0; overflow: hidden; transition: max-height .3s ease; }
.lpg-faq-panel[data-open="true"] { max-height: 420px; }
.lpg-faq-panel-in { padding: 0 22px 20px; color: var(--muted); }

/* ---- Tabela de serviços adicionais (upsell): blog, loja online, anúncios ---- */
.lpg-extras-card {
  position: relative; max-width: 1000px; margin: 44px auto 0; background: var(--white);
  border: var(--card-border); border-radius: 22px; padding: 12px; box-shadow: var(--soft-lg);
}
/* scroller próprio: uma tabela larga nunca deve alargar a página no mobile */
.lpg-extras-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
/* dica visual de que há mais colunas (a coluna do preço) fora do ecrã no mobile */
.lpg-extras-card::after {
  content: ""; position: absolute; top: 12px; right: 12px; bottom: 12px; width: 28px;
  background: linear-gradient(to right, transparent, var(--white));
  pointer-events: none; border-radius: 0 22px 22px 0;
}
.lpg-extras-table { width: 100%; min-width: 640px; border-collapse: collapse; }
.lpg-extras-table thead th {
  text-align: left; font-size: .74rem; font-weight: 800; text-transform: uppercase; letter-spacing: .1em;
  color: var(--muted); padding: 16px 20px; border-bottom: 2px solid var(--line);
}
.lpg-extras-table thead th.is-price { color: var(--amber-dark); }
.lpg-extras-table tbody tr:nth-child(even) { background: var(--bg); }
.lpg-extras-table tbody th, .lpg-extras-table tbody td {
  text-align: left; font-weight: 400; padding: 20px; vertical-align: top;
  border-bottom: 1px solid var(--line); color: var(--ink); font-size: .94rem;
}
.lpg-extras-table tbody tr:last-child th, .lpg-extras-table tbody tr:last-child td { border-bottom: 0; }
.lpg-extras-service { display: flex; align-items: center; gap: 12px; font-weight: 700; color: var(--deep); font-family: var(--font-title,'Sora'),sans-serif; white-space: nowrap; }
.lpg-extras-icon { display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 11px; background: rgba(31,111,107,.1); color: var(--teal); }
.lpg-extras-table td:nth-child(2) { color: var(--muted); max-width: 340px; }
.lpg-extras-table td.is-price { background: rgba(232,169,60,.06); border-left: 2px solid rgba(232,169,60,.25); white-space: nowrap; }
.lpg-extras-price-main { font-weight: 800; color: var(--amber-dark); font-size: 1.05rem; font-family: var(--font-title,'Sora'),sans-serif; }
.lpg-extras-price-note { color: var(--muted); font-size: .78rem; margin-top: 4px; font-family: Georgia, 'Times New Roman', serif; font-style: italic; white-space: normal; max-width: 220px; }
.lpg-extras-cta { display: flex; margin: 20px 16px 12px; }
/* Mobile: a tabela deixa de ser scroll horizontal (má visibilidade) e passa a
   pilha de cartões, um por serviço. Cada cartão reordena os campos (via CSS
   order, o DOM/leitor de ecrã mantém a ordem lógica original: serviço →
   descrição → prazo → preço): nome no topo, depois uma legenda compacta de
   prazo (ícone, sem rótulo repetido), a descrição, e o preço a fechar num
   destaque âmbar — mais fácil de "escanear" do que rótulo+valor repetido
   quatro vezes. Breakpoint alinhado ao resto da página (860px, não 680px):
   uma tabela desta densidade beneficia do formato cartão em qualquer telemóvel. */
@media (max-width: 860px) {
  .lpg-extras-card::after { display: none; }
  .lpg-extras-scroll { overflow-x: visible; }
  .lpg-extras-table { min-width: 0; }
  .lpg-extras-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .lpg-extras-table, .lpg-extras-table tbody { display: block; width: 100%; }
  .lpg-extras-table tr {
    display: flex; flex-direction: column;
    background: var(--white); border: var(--card-border); border-radius: 16px;
    padding: 18px; margin-bottom: 14px; box-shadow: var(--soft);
  }
  .lpg-extras-table tbody tr:nth-child(even) { background: var(--white); }
  .lpg-extras-table tbody tr:last-child { margin-bottom: 0; }
  .lpg-extras-table th, .lpg-extras-table td { display: block; width: 100%; padding: 0; border-bottom: 0; }

  /* qualificado com .lpg-extras-table th: a especificidade do reset acima
     (.lpg-extras-table th, .lpg-extras-table td) é (0,1,1) — um seletor de
     classe isolado (0,1,0) perderia o border-bottom sem este prefixo. */
  .lpg-extras-table th.lpg-extras-service { order: 1; white-space: normal; padding-bottom: 14px; border-bottom: 1px dashed var(--line); margin-bottom: 12px; }
  .lpg-extras-table td.lpg-extras-time {
    order: 2; display: flex; align-items: center; gap: 6px;
    color: var(--muted); font-size: .85rem; margin-bottom: 12px;
  }
  .lpg-extras-table td.lpg-extras-time svg { color: var(--teal); opacity: .85; flex-shrink: 0; }
  .lpg-extras-table td:nth-child(2) { order: 3; max-width: none; padding-bottom: 14px !important; border-bottom: 1px dashed var(--line); }
  .lpg-extras-table td.is-price {
    order: 4; margin-top: 4px; background: rgba(232,169,60,.08) !important;
    border: 1px solid rgba(232,169,60,.25) !important; border-radius: 12px;
    padding: 14px 16px !important; white-space: normal;
  }
  .lpg-extras-table td[data-label]::before {
    content: attr(data-label); display: block; font-size: .7rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 6px;
  }
  .lpg-extras-table td.is-price[data-label]::before { color: var(--amber-dark); }
  /* Vem DEPOIS da regra genérica acima (mesma especificidade (0,2,2); a
     ordem no ficheiro decide) — o ícone do relógio substitui o rótulo "Prazo". */
  .lpg-extras-table td.lpg-extras-time::before { display: none; }
  .lpg-extras-cta { margin: 4px 4px 0; }
}

/* Pilha de scroll: "Personalize o seu site" + 4 secções que se sobrepõem.
   Cada cartão é sticky (top: 0) com altura mínima de 100vh — ao rolar,
   o cartão fica "preso" no topo enquanto o próximo (z-index maior, por vir
   depois no DOM) sobe a partir do fundo do ecrã e cobre-o por completo.
   .lpg-stack-group é o "containing block" desta pilha (ver comentário no
   JSX) e .lpg-stack-spacer dá ao último cartão espaço para largar antes do
   Método — sem isto ficaria preso até ao fim da página. */
.lpg-stack-group { position: relative; }
.lpg-stack-spacer { height: 100vh; background: var(--amber); }
.lpg-stack { position: sticky; top: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
/* Todos os painéis colam pelo TOPO com z-index crescente: o painel seguinte
   sobe e cobre o anterior (que fica preso). REGRA: sticky pelo topo só cobre
   de forma limpa painéis ≤ 100vh — um painel mais alto que o ecrã cortaria o
   conteúdo ao ficar preso; ver .lpg-stack-1 (compactado para caber). */
.lpg-stack-1 { z-index: 10; }
.lpg-stack-2 { z-index: 11; }
.lpg-stack-3 { z-index: 12; }
.lpg-stack-4 { z-index: 13; }
.lpg-stack-5 { z-index: 14; }

/* "Personalize o seu site": compactar o conteúdo (título + tabela + CTA) para
   caber em ~100vh, para que o painel do robô o cubra de forma limpa em vez de
   ele simplesmente rolar para fora. */
.lpg-stack-1 { padding-top: 30px; padding-bottom: 30px; }
.lpg-stack-1 .lpg-h2 { font-size: clamp(1.7rem, 4vw, 2.3rem); }
.lpg-stack-1 .lpg-lead { font-size: 1rem; margin-top: 12px !important; }
.lpg-stack-1 .lpg-extras-card { margin-top: 22px; }
.lpg-stack-1 .lpg-extras-table thead th { padding-top: 12px; padding-bottom: 12px; }
.lpg-stack-1 .lpg-extras-table tbody th,
.lpg-stack-1 .lpg-extras-table tbody td { padding-top: 13px; padding-bottom: 13px; }
.lpg-stack-1 .lpg-extras-cta { margin-top: 14px; margin-bottom: 2px; }

/* Reset de base no mobile: por omissão TODAS as secções da pilha deixam de
   ser sticky (position:static). Só a "Personalize" (.lpg-stack-1) fica assim
   — a tabela empilhada em cartões é mais alta do que um ecrã, por isso
   sobrepor-se não funcionaria de forma limpa (perde-se o efeito aqui, aceitável
   no telemóvel). As 4 secções de destaque (robô/montanhas/candeeiro/cidade)
   REPÕEM o sticky mais abaixo, no bloco "MOBILE das 4 secções de destaque"
   — na mesma especificidade, a ordem no ficheiro decide, e esse bloco vem
   depois dos estilos base dessas secções. */
@media (max-width: 860px) {
  .lpg-stack { position: static; min-height: auto; overflow: visible; }
  .lpg-stack-spacer { display: none; }
  .lpg-stack-1 { padding: 56px 0; }
  .lpg-stack-1 .lpg-h2 { font-size: clamp(2.1rem, 5.4vw, 3.2rem); }
  .lpg-stack-1 .lpg-extras-table tbody th,
  .lpg-stack-1 .lpg-extras-table tbody td { padding-top: 18px; padding-bottom: 18px; }
}

/* Cartão 1 da pilha: robô 3D (Spline) + legenda em vidro líquido, encostada
   ao fundo do ecrã (40px de folga) — não centrada. */
.lpg-stack-robot { background: #0a0a0a; align-items: flex-end; padding-bottom: 40px; }
.lpg-stack-robot-scene { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.lpg-stack-robot-spline { width: min(920px, 100%); height: 100%; }
.lpg-stack-card {
  /* box-shadow (não clipado pelo overflow:hidden do GlassEffect, ao contrário
     de um ::before) dá o brilho ambiente âmbar por trás do cartão. */
  position: relative; z-index: 1; max-width: 520px; margin: 0 24px; padding: 30px 44px 34px;
  text-align: center; border: 1px solid rgba(255,255,255,.16);
  box-shadow:
    0 40px 90px -28px rgba(0,0,0,.75),
    0 0 150px -30px rgba(232,169,60,.5),
    inset 0 1px 0 rgba(255,255,255,.2);
}
/* Badge/eyebrow do cartão do robô: pílula âmbar com sparkle */
.lpg-stack-badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: .72rem;
  text-transform: uppercase; letter-spacing: .16em; color: var(--amber);
  padding: 7px 15px; border-radius: 999px;
  border: 1px solid rgba(232,169,60,.4); background: rgba(232,169,60,.12);
  margin-bottom: 16px;
}
.lpg-stack-badge svg { flex-shrink: 0; }
/* Tipografia própria desta secção (grotesk), distinta do resto da LP */
h2.lpg-grotesk-title { font-family: 'Bricolage Grotesque', 'Space Grotesk', sans-serif; font-optical-sizing: auto; font-weight: 800; font-size: clamp(2.05rem, 4.7vw, 3rem); letter-spacing: -0.02em; line-height: 1.03; color: #fff; }
p.lpg-grotesk-sub { font-family: 'Space Grotesk', sans-serif; font-weight: 400; font-size: clamp(.92rem, 1.6vw, 1.02rem); line-height: 1.5; color: rgba(255,255,255,.68); margin: 14px auto 0; max-width: 38ch; }

/* Secção "experiência visual" (stack-3): fundo WebGL de colinas (GLSLHills) +
   texto editorial centrado, sem cartão. Fundo branco a contrastar com o painel
   preto do robô. Tipografia Cormorant (serif elegante) — itálico fino no
   arranque, display grande a fechar. */
.lpg-stack-visual { background: #fff; }
.lpg-visual-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.lpg-visual-copy { position: relative; z-index: 2; text-align: center; padding: 0 28px; max-width: 960px; }
.lpg-visual-title { margin: 0; line-height: 1; }
.lpg-visual-title-a {
  display: block; font-family: 'Cormorant', Georgia, serif; font-style: italic; font-weight: 300;
  font-size: clamp(1.6rem, 4.4vw, 3rem); color: var(--muted); letter-spacing: .01em;
}
.lpg-visual-title-b {
  display: block; font-family: 'Cormorant', Georgia, serif; font-weight: 600;
  font-size: clamp(2.8rem, 8.5vw, 5.6rem); color: var(--deep); letter-spacing: -.01em;
  line-height: 1.02; margin-top: 4px;
}
.lpg-visual-sub {
  font-family: 'Cormorant', Georgia, serif; font-style: italic; font-weight: 500;
  font-size: clamp(1.1rem, 2.6vw, 1.55rem); color: var(--muted);
  margin: 26px auto 0; max-width: 30em; line-height: 1.45;
}

/* Secção "imaginação → realidade" (estética Noctuary de fable-25, stack-4):
   enxame de traças 3D à volta de um candeeiro + texto à esquerda. Paleta noite
   (#0b0a12) / violeta e fontes Archivo (grotesco leve) + Spectral SC (small caps)
   — as MESMAS do site original. Scrim de gradiente à esquerda p/ legibilidade
   (não text-shadow). */
.lpg-noctuary { background: #0b0a12; color: #e8e5f2; }
.lpg-noctuary-scene { position: absolute; inset: 0; z-index: 0; }
.lpg-noctuary-scrim {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(100deg, rgba(11,10,18,.94) 0%, rgba(11,10,18,.78) 30%, rgba(11,10,18,0) 62%);
}
.lpg-noctuary-inner { position: relative; z-index: 2; width: 100%; }
.lpg-noctuary-copy { max-width: 600px; }
/* p-selectors qualificados com a tag: a regra global .lpg-root p {color:inherit}
   tem especificidade (0,1,1) e venceria uma classe só (0,1,0). */
p.lpg-noctuary-kicker {
  font-family: 'Spectral SC', serif; font-weight: 400; font-size: .72rem;
  letter-spacing: .3em; text-transform: lowercase; color: #9b8cff; margin: 0 0 24px;
}
h2.lpg-noctuary-title {
  font-family: 'Archivo', system-ui, sans-serif; font-weight: 200;
  font-size: clamp(2.5rem, 6vw, 4.6rem); line-height: 1.03; letter-spacing: -0.025em;
  color: #e8e5f2; margin: 0;
}
p.lpg-noctuary-desc {
  font-family: 'Archivo', system-ui, sans-serif; font-weight: 300;
  font-size: clamp(1rem, 1.6vw, 1.15rem); line-height: 1.62; color: #cfc4b4;
  margin: 28px 0 0; max-width: 34em;
}
.lpg-noctuary-accent { color: #c4baff; }
p.lpg-noctuary-hint {
  font-family: 'Spectral SC', serif; font-weight: 300; font-size: .72rem;
  letter-spacing: .14em; color: #9a94ae; margin: 34px 0 0; max-width: 27em; line-height: 1.7;
  display: flex; align-items: flex-start; gap: 9px;
}
p.lpg-noctuary-hint svg { color: #9b8cff; flex-shrink: 0; margin-top: 2px; }

/* Último painel da pilha (stack-5): cidade 3D navegável (estilo Expo Dubai
   virtual). Fundo navy; overlay de texto no canto inferior-esquerdo (kicker +
   título + hint de "arraste"). O spacer que a segue herda a mesma cor escura
   para a transição de release ser invisível. */
.lpg-city { background: #080b1a; }
.lpg-stack-spacer--city { background: #080b1a; }
.lpg-city-scene { position: absolute; inset: 0; z-index: 0; }
.lpg-city-scene canvas { cursor: grab; }
.lpg-city-scrim {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(0deg, rgba(8,11,26,.88) 0%, rgba(8,11,26,.2) 24%, rgba(8,11,26,0) 44%);
}
.lpg-city-inner { position: absolute; left: 0; right: 0; bottom: clamp(38px, 8vh, 90px); z-index: 2; pointer-events: none; }
.lpg-city-copy { max-width: 560px; }
p.lpg-city-kicker {
  font-family: 'Spectral SC', serif; font-weight: 400; font-size: .72rem;
  letter-spacing: .3em; text-transform: lowercase; color: #7fb0ff; margin: 0 0 14px;
}
h2.lpg-city-title {
  font-family: var(--font-title,'Sora'), sans-serif; font-weight: 800;
  font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.05; letter-spacing: -0.02em;
  color: #eaf1ff; margin: 0;
}
p.lpg-city-hint {
  font-family: 'Spectral SC', serif; font-weight: 300; font-size: .72rem;
  letter-spacing: .14em; color: #9fb3d8; margin: 18px 0 0;
  display: flex; align-items: center; gap: 9px;
}
p.lpg-city-hint svg { color: #7fb0ff; flex-shrink: 0; }

/* ============ MOBILE das 4 secções de destaque ============
   Cada uma ocupa exatamente um ecrã (100svh evita o salto da barra de URL do
   browser) e nunca passa de 100vh. Este bloco vem DEPOIS dos estilos base das
   secções de propósito: na mesma especificidade, a ordem decide. */
@media (max-width: 860px) {
  /* Sticky reativado: as 4 secções de destaque sobrepõem-se ao rolar, tal como
     no desktop (só a secção "Personalize" — .lpg-stack-1 — fica static, porque
     a tabela em cartões é mais alta do que um ecrã). O spacer devolve-se para
     dar à última (cidade) o seu "turno" antes de a secção seguinte a cobrir —
     ver nota grande mais acima, junto a .lpg-stack-group. */
  .lpg-stack-robot, .lpg-stack-visual, .lpg-noctuary, .lpg-city {
    position: sticky; top: 0;
    height: 100svh; max-height: 100vh; min-height: 0; overflow: hidden;
  }
  .lpg-stack-spacer { display: block; height: 100svh; max-height: 100vh; }

  /* Robô: a cena ocupa o espaço ACIMA do cartão (o robô aparece inteiro) e o
     cartão, compacto e sem CTA, cola ao fundo. Reserva de 230px (era 158px
     antes do subtítulo) — com badge + título + subtítulo o cartão cresce. */
  .lpg-stack-robot { padding: 0 14px 14px; }
  .lpg-stack-robot-scene { inset: 0 0 230px 0; }
  .lpg-stack-card { margin: 0; width: 100%; max-width: none; padding: 20px 18px 24px; }
  h2.lpg-grotesk-title { font-size: clamp(1.7rem, 7.4vw, 2.1rem); }
  p.lpg-grotesk-sub { font-size: .85rem; line-height: 1.45; margin-top: 12px; }

  /* Montanhas: o fundo mantém proporção de paisagem — renderiza mais largo que
     o ecrã e corta as laterais, em vez de espremer a cena. */
  .lpg-visual-bg { inset: 0 auto 0 50%; width: 175vw; transform: translateX(-50%); }
  .lpg-visual-copy { padding: 0 22px; }

  /* Candeeiro: a câmara recentra e aproxima no candeeiro (feito no componente,
     aspect estreito — halo maior, lê como mais luminoso); o texto desce para
     o fundo com scrim vertical mais suave que a versão anterior. */
  .lpg-noctuary { align-items: flex-end; }
  /* padding-right extra: o botão flutuante do WhatsApp (fixed, 60px, a 22px do
     canto) ficava por cima do fim das linhas de texto, que se estendiam até à
     margem direita do ecrã — este espaço mantém o texto sempre à esquerda dele. */
  .lpg-noctuary-inner { padding-bottom: 28px; padding-right: 100px; }
  h2.lpg-noctuary-title { font-size: clamp(2rem, 8.6vw, 2.8rem); }
  p.lpg-noctuary-desc { margin-top: 16px; font-size: .98rem; }
  p.lpg-noctuary-hint { display: none; } /* fala do cursor: não faz sentido no touch */
  .lpg-noctuary-scrim { background: linear-gradient(180deg, rgba(11,10,18,.1) 0%, rgba(11,10,18,.3) 52%, rgba(11,10,18,.86) 100%); }

  /* Cidade: a câmara aproxima-se e olha mais de cima (feito no componente,
     aspect estreito) para preencher o ecrã de cor; scrim de fundo ligeiramente
     mais suave do que no desktop (mantém a legibilidade do texto no fundo). */
  .lpg-city-scrim { background: linear-gradient(0deg, rgba(8,11,26,.82) 0%, rgba(8,11,26,.14) 24%, rgba(8,11,26,0) 44%); }
}

.lpg-spline-loader {
  width: 34px; height: 34px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,.2); border-top-color: #fff;
  animation: lpg-spin 0.8s linear infinite;
}
@keyframes lpg-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .lpg-spline-loader { animation: none; } }

/* Cobre o último cartão da pilha (z-index 14) assim que entra no ecrã — aplicado
   à secção que segue a pilha (agora o "Fale connosco"). Ver nota no JSX. */
.lpg-cover-next { position: relative; z-index: 15; }

/* Formulário / CTA final */
.lpg-final { background: var(--deep); color: #eaf1f3; }
.lpg-final h2 { color: #fff; }
.lpg-final .lpg-badge { color: #ffd98a; background: rgba(232,169,60,.14); border-color: rgba(232,169,60,.3); }
.lpg-final-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: start; margin-top: 30px; }
.lpg-final-copy p { color: #c5d3d8; margin-top: 16px; font-size: 1.05rem; font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
.lpg-final-wa { margin-top: 28px; padding: 24px; border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: linear-gradient(158deg, rgba(255,255,255,.08), rgba(255,255,255,.028)); box-shadow: 0 22px 44px -30px rgba(0,0,0,.65); }
.lpg-final-wa p { color: #c5d3d8; margin-bottom: 14px; font-size: .95rem; }
/* Apresentação do fundador dentro do card do WhatsApp */
.lpg-final-wa-me { display: flex; align-items: center; gap: 18px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,.1); }
.lpg-final-wa-photo { display: block; width: 104px; height: 104px; border-radius: 18px; overflow: hidden; border: 2px solid rgba(232,169,60,.5); box-shadow: 0 10px 26px -10px rgba(0,0,0,.6), 0 0 0 5px rgba(232,169,60,.08); flex-shrink: 0; }
.lpg-final-wa-img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.lpg-final-wa-bio { display: flex; flex-direction: column; min-width: 0; }
.lpg-final-wa-bio strong { color: #fff; font-family: var(--font-title,'Sora'),sans-serif; font-weight: 700; font-size: 1.15rem; letter-spacing: -0.01em; }
.lpg-final-wa-bio span { color: #9fb6bd; font-size: .89rem; margin-top: 5px; line-height: 1.42; }
.lpg-card { background: var(--white); border-radius: 20px; padding: 32px; box-shadow: 0 30px 60px -24px rgba(0,0,0,.5); }
.lpg-field { margin-bottom: 16px; }
.lpg-field label { display: block; font-weight: 700; color: var(--deep); font-size: .9rem; margin-bottom: 7px; }
.lpg-field input, .lpg-field select, .lpg-field textarea {
  width: 100%; border: 1.5px solid var(--line); border-radius: 11px; padding: 13px 14px;
  font-size: 1rem; font-family: inherit; color: var(--ink); background: #fbfcfd;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.lpg-field input:focus, .lpg-field select:focus, .lpg-field textarea:focus {
  outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px rgba(31,111,107,.15);
}
.lpg-field textarea { resize: vertical; min-height: 92px; }
.lpg-field input[aria-invalid="true"], .lpg-field select[aria-invalid="true"] { border-color: #c0392b; }
.lpg-err { color: #c0392b; font-size: .82rem; font-weight: 600; margin-top: 6px; }
/* p.lpg-consent (não só .lpg-consent): a regra global .lpg-root p {color:inherit}
   (linha ~1557) tem especificidade (0,1,1) e vencia a classe isolada (0,1,0) —
   o texto herdava a cor clara de .lpg-final (#eaf1f3) mesmo dentro do cartão
   BRANCO do formulário, ficando ilegível. Com a tag, empata em especificidade
   e ganha por vir depois no ficheiro. */
p.lpg-consent { font-size: .82rem; color: var(--muted); margin-top: 4px; }
.lpg-consent a { color: var(--teal); text-decoration: underline; }
.lpg-form-error { background: #fdecea; color: #a3271b; border: 1px solid #f5c6c0; border-radius: 10px; padding: 12px 14px; font-size: .9rem; font-weight: 600; margin-bottom: 14px; }
.lpg-success { text-align: center; padding: 24px 6px; }
.lpg-success-ic { width: 64px; height: 64px; margin: 0 auto 18px; border-radius: 50%; background: rgba(31,111,107,.12); color: var(--teal); display: grid; place-items: center; }
.lpg-success h3 { font-size: 1.5rem; color: var(--deep); }
.lpg-success p { color: var(--muted); margin-top: 10px; }

/* Modal flutuante de contacto (abre pelos CTAs; reutiliza o <ContactForm>) */
.lpg-modal-overlay {
  position: fixed; inset: 0; z-index: 400;
  display: flex; align-items: center; justify-content: center; padding: 22px;
  background: rgba(9, 20, 26, .55);
  -webkit-backdrop-filter: blur(6px) saturate(120%); backdrop-filter: blur(6px) saturate(120%);
  animation: lpg-modal-fade .22s ease;
}
.lpg-modal {
  position: relative; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;
  background: var(--white); border-radius: 24px; border: var(--card-border);
  box-shadow: 0 44px 110px -30px rgba(18,59,79,.6), inset 0 1px 0 rgba(255,255,255,.6);
  padding: 36px 34px 30px;
  animation: lpg-modal-pop .34s cubic-bezier(.2,.9,.3,1.15);
}
.lpg-modal-close {
  position: absolute; top: 14px; right: 14px; width: 38px; height: 38px; z-index: 2;
  display: grid; place-items: center; border-radius: 999px;
  border: 1px solid var(--line); background: var(--bg); color: var(--muted);
  cursor: pointer; transition: background .15s ease, color .15s ease, transform .15s ease;
}
.lpg-modal-close:hover { background: var(--line); color: var(--deep); transform: rotate(90deg); }
.lpg-modal-head { margin-bottom: 22px; padding-right: 34px; }
.lpg-modal-title { font-size: clamp(1.5rem, 4.4vw, 2rem); margin: 12px 0 0; line-height: 1.08; }
.lpg-modal-sub { color: var(--muted); margin-top: 8px; font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
@keyframes lpg-modal-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes lpg-modal-pop { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .lpg-modal-overlay, .lpg-modal { animation: none; }
}
@media (max-width: 560px) {
  .lpg-modal { padding: 30px 20px 24px; border-radius: 18px; }
}

/* Rodapé */
.lpg-footer { background: #0e2f3f; color: #b7c6cd; padding: 60px 0 30px; }
.lpg-footer-grid { display: grid; grid-template-columns: 1.7fr 1fr; gap: 32px; }
.lpg-footer .lpg-logo { color: #fff; }
.lpg-footer-brand { max-width: 340px; }
.lpg-footer-tag { color: #8ea3ac; margin-top: 10px; font-size: .95rem; line-height: 1.55; }
.lpg-footer-col h3 { color: #fff; font-size: .8rem; text-transform: uppercase; letter-spacing: .14em; margin: 4px 0 14px; }
.lpg-footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.lpg-footer-col a { color: #b7c6cd; font-size: .92rem; transition: color .15s ease; }
.lpg-footer-col a:hover { color: #fff; }
.lpg-footer-bottom { border-top: 1px solid rgba(255,255,255,.1); margin-top: 44px; padding-top: 20px; font-size: .82rem; color: #8ea3ac; display: flex; flex-wrap: wrap; gap: 8px 20px; justify-content: space-between; }

/* Cookie banner */
.lpg-cookie {
  position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 250;
  max-width: 620px; margin: 0 auto; background: var(--deep); color: #eaf1f3;
  border-radius: 16px; padding: 18px 20px; box-shadow: 0 16px 44px rgba(0,0,0,.32);
  display: flex; flex-wrap: wrap; align-items: center; gap: 14px;
}
.lpg-cookie p { font-size: .88rem; color: #d3dee2; flex: 1 1 260px; }
.lpg-cookie a { color: #ffd98a; text-decoration: underline; }
.lpg-cookie-actions { display: flex; gap: 10px; }
.lpg-cookie-actions button { min-height: 42px; padding: 10px 18px; font-size: .88rem; border-radius: 999px; font-weight: 700; cursor: pointer; border: 1px solid transparent; }
.lpg-cookie-accept { background: var(--amber); color: var(--amber-ink); }
.lpg-cookie-reject { background: transparent; color: #eaf1f3; border-color: rgba(255,255,255,.28); }

/* Reveal simples (respeitando reduced-motion) */
.lpg-reveal { opacity: 1; }
@media (min-width: 1px) {
  /* --rot permite rotações "imperfeitas" persistentes (cartões colados) */
  .lpg-reveal { opacity: 0; transform: translateY(16px) rotate(var(--rot, 0deg)); transition: opacity .6s ease, transform .6s ease; }
  .lpg-reveal.is-in { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)); }
}
/* Títulos cinéticos: cada palavra entra em cascata quando a secção aparece.
   Guardado em no-preference — com reduced-motion os títulos ficam sempre visíveis. */
@media (prefers-reduced-motion: no-preference) {
  .lpg-reveal .lpg-t-seg {
    display: inline-block; opacity: 0; transform: translateY(22px);
    transition: opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1);
  }
  .lpg-reveal.is-in .lpg-t-seg { opacity: 1; transform: none; }
  .lpg-reveal.is-in .lpg-t-seg:nth-child(2) { transition-delay: .1s; }
  .lpg-reveal.is-in .lpg-t-seg:nth-child(3) { transition-delay: .2s; }
  .lpg-reveal.is-in .lpg-t-seg:nth-child(4) { transition-delay: .3s; }
}
@media (prefers-reduced-motion: reduce) {
  .lpg-root * { transition: none !important; animation: none !important; }
  .lpg-reveal { opacity: 1 !important; transform: none !important; }
  .lpg-root { scroll-behavior: auto; }
}

/* Marquee de argumentos de venda (direita → esquerda, loop infinito) */
.lpg-marquee { overflow: hidden; background: var(--teal); border-top: 1px solid rgba(255,255,255,.14); border-bottom: 1px solid rgba(255,255,255,.14); }
.lpg-marquee-track { display: flex; width: max-content; animation: lpgMarquee 36s linear infinite; }
@keyframes lpgMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.lpg-marquee-item { display: inline-flex; align-items: center; gap: 16px; padding: 15px 26px; white-space: nowrap; color: #fff; font-family: var(--font-title,'Sora'),sans-serif; font-weight: 700; font-size: .86rem; letter-spacing: .06em; text-transform: uppercase; }
.lpg-marquee-star { color: #ffd98a; font-size: .72rem; }
@media (prefers-reduced-motion: reduce) {
  .lpg-marquee-track { animation: none; flex-wrap: wrap; justify-content: center; width: 100%; }
  .lpg-marquee-item--dup { display: none; } /* sem loop, a 2ª cópia é redundante */
}

/* Botão flutuante de WhatsApp — redondo, neon, pulsante */
.lpg-wa-float {
  position: fixed; right: 22px; bottom: 22px; z-index: 240;
  width: 60px; height: 60px; border-radius: 50%;
  display: grid; place-items: center; background: #25D366; color: #fff;
  box-shadow: 0 0 20px rgba(37,211,102,.85), 0 10px 24px rgba(0,0,0,.28);
  animation: lpgWaPulse 2.2s ease-out infinite; transition: transform .18s ease;
}
.lpg-wa-float svg { width: 30px; height: 30px; }
.lpg-wa-float:hover { transform: scale(1.08); }
@keyframes lpgWaPulse {
  0%   { box-shadow: 0 0 18px rgba(37,211,102,.9), 0 0 0 0 rgba(37,211,102,.55), 0 10px 24px rgba(0,0,0,.28); }
  70%  { box-shadow: 0 0 28px rgba(37,211,102,1), 0 0 0 16px rgba(37,211,102,0), 0 10px 24px rgba(0,0,0,.28); }
  100% { box-shadow: 0 0 18px rgba(37,211,102,.9), 0 0 0 0 rgba(37,211,102,0), 0 10px 24px rgba(0,0,0,.28); }
}
@media (prefers-reduced-motion: reduce) { .lpg-wa-float { animation: none; } }

/* Selos de confiança na secção "fale connosco" (fundo escuro) */
.lpg-final-seals { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-top: 22px; }
.lpg-final-seal { display: inline-flex; align-items: center; gap: 7px; font-weight: 600; font-size: .9rem; color: #eaf1f3; }
.lpg-final-seal svg { color: #ffd98a; }

/* Responsivo */
@media (min-width: 861px) {
  .lpg-nav-menu-glass { display: none !important; } /* dropdown é só mobile */
}
@media (max-width: 860px) {
  .lpg-steps, .lpg-proof-grid, .lpg-method-grid { grid-template-columns: 1fr; }
  .lpg-final-grid { grid-template-columns: 1fr; }
  .lpg-header-cta-desktop { display: none; }
  .lpg-burger { display: inline-flex; }
  /* hero passa a uma coluna; colagem por baixo do texto */
  .lpg-hero-in { grid-template-columns: 1fr; gap: 40px; }
  .lpg-hero-collage { min-height: 340px; max-width: 460px; }
  /* secções com o mockup: 1 coluna, texto sempre antes do monitor */
  .lpg-img-sec .lpg-wrap { grid-template-columns: 1fr; gap: 28px; }
  .lpg-sec-copy { order: 1; max-width: none; }
  .lpg-sec-illus { order: 2; max-width: 380px; margin: 0 auto; }
  /* oferta "bilhete" empilha: canhoto em cima, talão em baixo */
  .lpg-offer-card { grid-template-columns: 1fr; }
  .lpg-offer-right { border-left: 0; border-top: 2px dashed rgba(18,59,79,.16); }
  .lpg-offer-right::before { top: -11px; left: -11px; }
  .lpg-offer-right::after { top: -11px; bottom: auto; left: auto; right: -11px; }
}
@media (max-width: 560px) {
  .lpg-section { padding: 56px 0; }
  .lpg-hero { padding-top: calc(20px + var(--nav-offset)); }
  .lpg-offer-left, .lpg-offer-right { padding: 32px 26px; }
  .lpg-card { padding: 22px; }
  .lpg-btn { width: 100%; }
  .lpg-footer-grid { grid-template-columns: 1fr; }
}
@media (max-width: 400px) {
  .lpg-header .lpg-logo-text { display: none; } /* só o elefante na ilha em telas estreitas */
}
`;

// ============================================================================
// Componente
// ============================================================================

type Props = { locale: string; googleReviews?: GoogleReviewsData | null };

const SLUG = MAIN_LP_SLUG;

/* Formulário de captação de lead — componentizado para ser reutilizado tanto na
   secção "Fale connosco" como no modal flutuante. Estado, validação e conversão
   (Google Ads / dataLayer) vivem aqui dentro. IDs de campo únicos via useId()
   para poder existir mais do que uma instância na página sem colidir. */
function ContactForm({ t, locale, lang }: { t: Copy['form']; locale: string; lang: LangKey }) {
  const uid = useId();
  const [form, setForm] = useState({ name: '', email: '', phone: '', business: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t.errName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t.errEmail;
    if (form.phone.replace(/\D/g, '').length < 6) e.phone = t.errPhone;
    if (!form.business) e.business = t.errBusiness;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function fireLeadConversion() {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: 'lead_form_submit', form: SLUG, value: 1349, currency: 'EUR' });
    // TODO Google Ads: descomente e troque o send_to pelo ID de conversão do
    // formulário (Ads → Conversões). O gtag global (AW-18077342694) já é carregado.
    // w.gtag?.('event', 'conversion', { send_to: 'AW-18077342694/XXXX', value: 1349, currency: 'EUR' });
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError(false);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (LEAD_ENDPOINT) {
        const res = await fetch(LEAD_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, source: SLUG, lang }),
        });
        if (!res.ok) throw new Error('bad status');
      }
      fireLeadConversion();
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="lpg-success" role="status" aria-live="polite">
        <div className="lpg-success-ic" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="34" height="34" fill="none">
            <path d="M7 16.5l6 6 12-13" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>{t.successTitle}</h3>
        <p>{t.successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {submitError && <div className="lpg-form-error" role="alert">{t.errSubmit}</div>}

      <div className="lpg-field">
        <label htmlFor={`${uid}-name`}>{t.name}</label>
        <input
          id={`${uid}-name`} name="name" type="text" autoComplete="name"
          placeholder={t.namePh} value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${uid}-name-err` : undefined}
          required
        />
        {errors.name && <div className="lpg-err" id={`${uid}-name-err`}>{errors.name}</div>}
      </div>

      <div className="lpg-field">
        <label htmlFor={`${uid}-email`}>{t.email}</label>
        <input
          id={`${uid}-email`} name="email" type="email" autoComplete="email" inputMode="email"
          placeholder={t.emailPh} value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${uid}-email-err` : undefined}
          required
        />
        {errors.email && <div className="lpg-err" id={`${uid}-email-err`}>{errors.email}</div>}
      </div>

      <div className="lpg-field">
        <label htmlFor={`${uid}-phone`}>{t.phone}</label>
        <input
          id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel"
          placeholder={t.phonePh} value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
          required
        />
        {errors.phone && <div className="lpg-err" id={`${uid}-phone-err`}>{errors.phone}</div>}
      </div>

      <div className="lpg-field">
        <label htmlFor={`${uid}-business`}>{t.business}</label>
        <select
          id={`${uid}-business`} name="business" value={form.business}
          onChange={(e) => setForm({ ...form, business: e.target.value })}
          aria-invalid={Boolean(errors.business)}
          aria-describedby={errors.business ? `${uid}-business-err` : undefined}
          required
        >
          <option value="" disabled>{t.businessPh}</option>
          {t.businessOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {errors.business && <div className="lpg-err" id={`${uid}-business-err`}>{errors.business}</div>}
      </div>

      <div className="lpg-field">
        <label htmlFor={`${uid}-message`}>{t.message}</label>
        <textarea
          id={`${uid}-message`} name="message" placeholder={t.messagePh}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <button type="submit" className="lpg-btn lpg-btn-amber lpg-btn-block" disabled={submitting}>
        {submitting ? t.submitting : t.submit}
      </button>

      <p className="lpg-consent">
        {t.consent}{' '}
        <a href={`/${locale}/privacy-policy`} target="_blank" rel="noopener noreferrer">{t.privacyLink}</a>.
      </p>
    </form>
  );
}

/* Modal flutuante que embrulha o <ContactForm>. Fecha com Esc, clique fora e no
   X; bloqueia o scroll do body enquanto aberto. */
function ContactModal({
  open,
  onClose,
  t,
  locale,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  t: Copy['form'];
  locale: string;
  lang: LangKey;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lpg-modal-overlay" onMouseDown={onClose}>
      <div
        className="lpg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lpg-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="lpg-modal-close" onClick={onClose} aria-label={lang === 'pt' ? 'Fechar' : 'Close'}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <div className="lpg-modal-head">
          <span className="lpg-badge">{t.badge}</span>
          <h2 id="lpg-modal-title" className="lpg-modal-title"><MixedTitle segs={t.title} gradId="lpg-ug-modal" /></h2>
          <p className="lpg-modal-sub">{t.subtitle}</p>
        </div>
        <ContactForm t={t} locale={locale} lang={lang} />
      </div>
    </div>
  );
}

export function SiteGoogleLandingClient({ locale, googleReviews }: Props) {
  const [lang, setLang] = useState<LangKey>(locale === 'en' ? 'en' : 'pt');
  const t = COPY[lang];

  // Avaliações reais (Places API, vindas do servidor) ou fallback estático.
  const gr = googleReviews && googleReviews.reviews.length ? googleReviews : null;
  const reviewCards = gr ? gr.reviews : GOOGLE_REVIEWS;
  // A métrica "Classificação no Google" usa a nota real quando existe.
  const resultMetrics = t.results.metrics.map((m) =>
    m.isRating && gr
      ? {
          ...m,
          end: gr.rating,
          note: lang === 'pt' ? `${gr.count} avaliações no Google` : `${gr.count} reviews on Google`,
        }
      : m
  );

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cookieDecided, setCookieDecided] = useState(true); // esconde por defeito até ler o storage
  const [isScrolled, setIsScrolled] = useState(false);       // navbar ilha: estado "scrolled"
  const [menuOpen, setMenuOpen] = useState(false);           // menu mobile (hamburger)

  // Formulário de contacto: modal flutuante (aberto pelos CTAs) + secção "Fale connosco".
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = (e?: React.MouseEvent) => { e?.preventDefault(); setContactOpen(true); };

  // Link do WhatsApp com mensagem pré-preenchida (vai para o número do Guilherme)
  const waHref = useMemo(() => {
    const msg = lang === 'pt'
      ? 'Olá, Guilherme da BlackElephant. Quero um site impecável em minhas mãos.'
      : 'Hi Guilherme from BlackElephant. I want a flawless website in my hands.';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [lang]);

  // Consentimento de cookies (RGPD) — lê a preferência guardada no mount.
  // Feito num effect (e não em lazy init) de propósito: durante o SSR não há
  // localStorage, e ler no mount evita um mismatch de hidratação do banner.
  useEffect(() => {
    let decided = false;
    try {
      decided = Boolean(localStorage.getItem('lpg-cookie-consent'));
    } catch {
      decided = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCookieDecided(decided);
  }, []);

  // Mantém o atributo lang do documento em sincronia com o seletor
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);

  // Navbar ilha: ativa o estado "scrolled" (> 20px) p/ reforçar o vidro e a legibilidade
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll (leve, com IntersectionObserver)
  useEffect(() => {
    const els = document.querySelectorAll('.lpg-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function decideCookies(value: 'accepted' | 'rejected') {
    try {
      localStorage.setItem('lpg-cookie-consent', value);
    } catch {
      /* ignore */
    }
    setCookieDecided(true);
  }

  function onWhatsAppClick() {
    reportContatoWhatsappConversion();
  }

  // JSON-LD: ProfessionalService + FAQPage + Product/Offer (geo: Portugal)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'BlackElephant',
      description: t.hero.sub.pre + t.hero.sub.emph + t.hero.sub.post,
      areaServed: { '@type': 'Country', name: 'Portugal' },
      url: `https://blackelephant.com.br/${locale}/${SLUG}`,
      image: 'https://blackelephant.com.br/logo.png',
      priceRange: '€€',
      telephone: `+${WHATSAPP_NUMBER}`,
      makesOffer: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: '1349',
        description: lang === 'pt' ? 'Criação de site institucional até 8 páginas com textos otimizados para SEO' : 'Business website up to 8 pages with SEO-optimized copy',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: t.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: lang === 'pt' ? 'Site institucional até 8 páginas' : 'Business website up to 8 pages',
      description: t.offer.desc,
      image: 'https://blackelephant.com.br/logo.png',
      brand: { '@type': 'Brand', name: 'BlackElephant' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: '1349',
        availability: 'https://schema.org/InStock',
        url: `https://blackelephant.com.br/${locale}/${SLUG}`,
      },
    },
  ];

  return (
    <div className="lpg-root" lang={t.htmlLang}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />


      <GlassFilter />

      <a href="#lpg-main" className="lpg-skip">{t.skipToContent}</a>

      {/* ============ HEADER — navbar ILHA em vidro líquido (GlassEffect) ============ */}
      {/* Só a casca visual mudou (agora com refração real via filtro SVG): logo,
          links, aria e lógica permanecem intactos. */}
      <header className="lpg-header">
        <div className="lpg-nav-wrap">
          <GlassEffect
            className="lpg-nav-shell rounded-full"
            blur={isScrolled ? 14 : 9}
            tint={isScrolled ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.34)'}
            style={{
              boxShadow: isScrolled
                ? 'inset 0 1px 0 rgba(255,255,255,.6), 0 14px 40px -14px rgba(18,59,79,.5)'
                : 'inset 0 1px 0 rgba(255,255,255,.55), 0 8px 24px -12px rgba(18,59,79,.35)',
            }}
          >
            <nav className="lpg-nav" aria-label={t.navAria}>
              <a href="#lpg-top" className="lpg-logo">
                <Image
                  src="/logo-elephant.png"
                  alt={lang === 'pt' ? 'BlackElephant,criação de sites profissionais em Portugal' : 'BlackElephant,professional web design in Portugal'}
                  width={38}
                  height={38}
                  className="lpg-logo-img"
                  priority
                />
                <span className="lpg-logo-text">BlackElephant</span>
              </a>
              <div className="lpg-header-right">
                <div className="lpg-lang" role="group" aria-label={t.langSwitchLabel}>
                  <button type="button" aria-pressed={lang === 'pt'} onClick={() => setLang('pt')} lang="pt-PT">PT</button>
                  <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">EN</button>
                </div>
                {/* CONVERSÃO: CTA do topo → formulário */}
                <a href="#lpg-contacto" onClick={openContact} className="lpg-btn lpg-btn-amber lpg-header-cta-desktop">{t.headerCta}</a>
                {/* Hamburger: colapsa o CTA num menu no mobile, mantendo a pílula em vidro */}
                <button
                  type="button"
                  className="lpg-burger"
                  aria-expanded={menuOpen}
                  aria-controls="lpg-nav-menu"
                  aria-label={menuOpen ? t.menuClose : t.menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span className={`lpg-burger-box${menuOpen ? ' is-open' : ''}`} aria-hidden="true">
                    <span /><span /><span />
                  </span>
                </button>
              </div>
            </nav>
          </GlassEffect>

          {/* Menu mobile em vidro líquido — contém o CTA colapsado */}
          <GlassEffect
            hidden={!menuOpen}
            className="lpg-nav-menu-glass rounded-[22px]"
            blur={14}
            tint="rgba(255, 255, 255, 0.82)"
          >
            <div id="lpg-nav-menu" className="lpg-nav-menu">
              <a
                href="#lpg-contacto"
                className="lpg-btn lpg-btn-amber lpg-btn-block"
                onClick={(e) => { setMenuOpen(false); openContact(e); }}
              >
                {t.headerCta}
              </a>
            </div>
          </GlassEffect>
        </div>
      </header>

      <main id="lpg-main">
        <span id="lpg-top" aria-hidden="true" />

        {/* ============ HERO — editorial + colagem de portefólio ============ */}
        <section className="lpg-hero lpg-grain" aria-labelledby="lpg-h1">
          <HeroNetwork />
          <div className="lpg-wrap lpg-hero-in">
            <div className="lpg-hero-copy">
              <h1 id="lpg-h1" className="lpg-h1">
                {t.hero.titleLines.map((line, li) => (
                  <span className="lpg-h1-line" key={li}>
                    {line.map((seg, si) => (
                      <Fragment key={si}>
                        {si > 0 && ' '}
                        <span
                          className={`lpg-h1-seg lpg-h1-seg--${seg.v}`}
                          style={{ animationDelay: `${(li * 3 + si) * 0.09}s` }}
                        >
                          {seg.t}
                          {seg.v === 'accent' && <AccentUnderline gradId="lpg-ug-hero" />}
                        </span>
                      </Fragment>
                    ))}
                  </span>
                ))}
              </h1>
              <p className="lpg-hero-sub">
                {t.hero.sub.pre}
                <span className="lpg-sub-emph">{t.hero.sub.emph}</span>
                {t.hero.sub.post}
              </p>
              {/* CONVERSÃO: CTA principal do hero */}
              <div className="lpg-hero-cta">
                <a href="#lpg-contacto" onClick={openContact} className="lpg-btn lpg-btn-amber">{t.hero.cta}</a>
              </div>
              <div className="lpg-seals">
                {t.hero.seals.map((s) => (
                  <span className="lpg-seal" key={s}>
                    <span className="ic"><IconCheck /></span>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Colagem: screenshots reais de sites criados pela BlackElephant.
                TODO (Gui): trocar por trabalhos que queiras destacar em public/portfolio/. */}
            <div className="lpg-hero-collage">
              <div className="lpg-collage-item lpg-collage-back">
                <Image
                  src="/portfolio/lps/hubfive.png"
                  alt={lang === 'pt' ? 'Site de consultoria financeira criado pela BlackElephant' : 'Financial consulting website built by BlackElephant'}
                  fill
                  sizes="(max-width: 860px) 55vw, 28vw"
                />
              </div>
              <div className="lpg-collage-item lpg-collage-front">
                <Image
                  src="/portfolio/lps/viana-consultancy.png"
                  alt={lang === 'pt' ? 'Site de advocacia criado pela BlackElephant, otimizado para o Google' : 'Law firm website built by BlackElephant, optimized for Google'}
                  fill
                  sizes="(max-width: 860px) 68vw, 34vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE (argumentos de venda, esquerda → direita) ============ */}
        <div className="lpg-marquee" aria-hidden="true">
          <div className="lpg-marquee-track">
            {[...t.marquee, ...t.marquee].map((item, i) => (
              <span
                className={`lpg-marquee-item${i >= t.marquee.length ? ' lpg-marquee-item--dup' : ''}`}
                key={i}
              >
                <span className="lpg-marquee-star">✦</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ============ DOR (secção âncora escura) ============ */}
        <section className="lpg-section lpg-dark lpg-grain lpg-img-sec">
          <div className="lpg-wrap">
            <div className="lpg-reveal lpg-sec-copy">
              <span className="lpg-badge">{t.pain.badge}</span>
              <h2 className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.pain.title} gradId="lpg-ug-pain" bright /></h2>
              <p className="lpg-lead" style={{ marginTop: 18 }}>{t.pain.text}</p>
            </div>
            {/* mockup do monitor à direita: página de busca onde a empresa NÃO
                aparece (3 concorrentes + alerta vermelho, bem visível) */}
            <div className="lpg-sec-illus lpg-reveal">
              <BrowserMockup variant="problem" mock={t.mock} />
            </div>
          </div>
        </section>

        {/* ============ SOLUÇÃO / DIFERENCIAL ============ */}
        <section className="lpg-section lpg-img-sec">
          <div className="lpg-wrap">
            {/* mesmo mockup, agora à esquerda: a empresa aparece em primeiro
                lugar (marcada "Você está aqui") + banner de sucesso */}
            <div className="lpg-sec-illus lpg-reveal">
              <BrowserMockup variant="solution" mock={t.mock} />
            </div>
            <div className="lpg-reveal lpg-sec-copy">
              <span className="lpg-badge">{t.solution.badge}</span>
              <h2 className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.solution.title} gradId="lpg-ug-solution" /></h2>
              <p className="lpg-lead" style={{ marginTop: 18 }}>{t.solution.text}</p>
            </div>
          </div>
        </section>

        {/* ============ DESTAQUE: TAMBÉM ENCONTRADO PELA IA ============ */}
        <section className="lpg-section lpg-dark lpg-ai-sec lpg-grain" aria-labelledby="lpg-ai-title">
          <div className="lpg-wrap">
            <div className="lpg-reveal lpg-ai-copy">
              <span className="lpg-badge">{t.ai.badge}</span>
              <h2 id="lpg-ai-title" className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.ai.title} gradId="lpg-ug-ai" bright /></h2>
              <p className="lpg-lead" style={{ marginTop: 18 }}>{t.ai.text}</p>
            </div>
            <div className="lpg-reveal">
              <AiOrb />
            </div>
          </div>
        </section>

        {/* ============ PROVA / CONFIANÇA ============ */}
        <section className="lpg-section" aria-labelledby="lpg-proof">
          <div className="lpg-wrap">
            <div className="lpg-reveal" style={{ maxWidth: 640 }}>
              <span className="lpg-badge">{t.proof.badge}</span>
              <h2 id="lpg-proof" className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.proof.title} gradId="lpg-ug-proof" /></h2>
            </div>
            <div className="lpg-proof-grid">
              {t.proof.items.map((item) => (
                <div className="lpg-proof-card lpg-reveal" key={item.title}>
                  <span className="lpg-proof-ic" aria-hidden="true">{PROOF_ICONS[item.icon]}</span>
                  <div>
                    <h3 className="lpg-proof-title">{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== AVALIAÇÕES DO GOOGLE =====
                Com GOOGLE_PLACES_API_KEY configurada chegam do servidor (nota,
                nº de avaliações e os 3 cartões); sem chave, cartões de fallback
                do array GOOGLE_REVIEWS. O botão liga ao perfil no Maps. */}
            <div className="lpg-reviews-head lpg-reveal">
              <div>
                <h3 className="lpg-reviews-title">{t.proof.reviewsTitle}</h3>
                {gr ? (
                  <span className="lpg-reviews-summary">
                    <GoogleG className="lpg-gicon" />
                    <strong>{lang === 'pt' ? gr.rating.toFixed(1).replace('.', ',') : gr.rating.toFixed(1)}</strong>
                    <StarRating value={Math.round(gr.rating)} />
                    {lang === 'pt' ? `${gr.count} avaliações no Google` : `${gr.count} reviews on Google`}
                  </span>
                ) : (
                  <span className="lpg-reviews-summary">
                    <GoogleG className="lpg-gicon" />
                    {t.proof.reviewsSummary}
                  </span>
                )}
              </div>
              <a
                className="lpg-btn lpg-btn-outline lpg-reviews-cta"
                href={GOOGLE_MAPS_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GoogleG className="lpg-gicon" />
                {t.proof.reviewsCta}
              </a>
            </div>
            <ReviewsCarousel reviews={reviewCards} lang={lang} />
            {/* (logótipos de clientes podem entrar aqui no futuro) */}

            {/* ===== RESULTADOS QUE PODE MEDIR =====
                Banda destacada com CountUp: os números sobem quando entram no
                ecrã. A métrica isRating usa a nota real do Google quando a
                Places API está configurada. */}
            <div className="lpg-results-band lpg-reveal">
              <div className="lpg-results-head">
                <h3 className="lpg-results-title">{t.results.title}</h3>
                <p className="lpg-results-intro">{t.results.intro}</p>
              </div>
              <div className="lpg-results-grid">
                {resultMetrics.map((m) => (
                  <div className="lpg-result-tile" key={m.label}>
                    <div className="val">
                      <CountUp end={m.end} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} lang={lang} />
                    </div>
                    {m.isRating && <StarRating value={5} />}
                    <div className="lbl">{m.label}</div>
                    <div className="nt">{m.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ OFERTA + GARANTIA ============ */}
        <section className="lpg-section lpg-offer lpg-grain" aria-labelledby="lpg-offer-title">
          <div className="lpg-wrap">
            <div className="lpg-reveal lpg-eyebrow-center" style={{ maxWidth: 640, margin: '0 auto' }}>
              <span className="lpg-badge">{t.offer.badge}</span>
              <h2 id="lpg-offer-title" className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.offer.title} gradId="lpg-ug-offer" /></h2>
              <p className="lpg-lead" style={{ marginTop: 18 }}>{t.offer.desc}</p>
            </div>
            {/* Cartão de oferta em formato "bilhete": canhoto (preço+CTA) + talão (incluídos) */}
            <div className="lpg-offer-card lpg-reveal">
              <span className="lpg-offer-ribbon" aria-hidden="true">{lang === 'pt' ? 'preço fixo' : 'fixed price'}</span>
              <div className="lpg-offer-left">
                <span className="lpg-offer-eyebrow">{lang === 'pt' ? 'tudo por' : 'all for'}</span>
                <div className="lpg-offer-price">{t.offer.price}</div>
                <div className="lpg-offer-note">{t.offer.priceNote}</div>
                {/* CONVERSÃO: CTA da secção de preço */}
                <a href="#lpg-contacto" onClick={openContact} className="lpg-btn lpg-btn-amber lpg-btn-block lpg-offer-cta">{t.offer.cta}</a>
                <p className="lpg-offer-fine">{lang === 'pt' ? 'Sem letras pequenas.' : 'No fine print.'}</p>
              </div>
              <div className="lpg-offer-right">
                <div className="lpg-includes-title">{t.offer.includesTitle}</div>
                <ul className="lpg-includes">
                  {t.offer.includes.map((inc) => (
                    <li key={inc}>
                      <span className="ic"><IconCheck /></span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ===== GARANTIA ===== */}
            <div className="lpg-guarantee-card lpg-reveal" style={{ marginTop: 56 }}>
              <div className="lpg-guarantee-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                  <path d="M12 3l7 3v5c0 4.2-2.9 7.6-7 8.9C7.9 18.6 5 15.2 5 11V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 11.5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="lpg-badge">{t.guarantee.badge}</span>
              <h2 style={{ marginTop: 14 }}><MixedTitle segs={t.guarantee.title} gradId="lpg-ug-guar" /></h2>
              <p>{t.guarantee.text}</p>
            </div>
          </div>
        </section>

        {/* ============ PILHA DE SCROLL ============
            "Personalize o seu site" + 4 secções que se sobrepõem (cada uma cobre a
            anterior ao rolar) — 1ª com conteúdo definido (robô 3D + vidro líquido),
            as restantes 3 com copy de placeholder simples (título + descrição).
            O wrapper `.lpg-stack-group` delimita o "containing block" dos cartões
            sticky: sem ele, o ÚLTIMO cartão (sem nada por cima para o cobrir)
            ficaria preso no topo até ao fim da página inteira, em vez de largar
            depois do seu próprio "turno" — o spacer final dá-lhe esse turno. */}
        <div className="lpg-stack-group">
          <section className="lpg-section lpg-stack lpg-stack-1" aria-labelledby="lpg-extras-title">
            <div className="lpg-wrap">
              <div className="lpg-reveal lpg-eyebrow-center" style={{ maxWidth: 640, margin: '0 auto' }}>
                <span className="lpg-badge">{t.extras.badge}</span>
                <h2 id="lpg-extras-title" className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.extras.title} gradId="lpg-ug-extras" /></h2>
                <p className="lpg-lead" style={{ marginTop: 18 }}>{t.extras.text}</p>
              </div>
              <ExtrasTable extras={t.extras} onCta={openContact} />
            </div>
          </section>

          <section
            className="lpg-stack lpg-stack-2 lpg-stack-robot"
            aria-labelledby="lpg-stack-robot-title"
          >
            <div className="lpg-stack-robot-scene" aria-hidden="true">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="lpg-stack-robot-spline"
              />
            </div>
            <GlassEffect
              className="lpg-stack-card rounded-[30px]"
              tint="rgba(14, 16, 20, 0.55)"
              blur={20}
            >
              <span className="lpg-stack-badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M12 2c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6z" />
                </svg>
                {t.stackRobot.eyebrow}
              </span>
              <h2 id="lpg-stack-robot-title" className="lpg-grotesk-title">{t.stackRobot.title}</h2>
              <p className="lpg-grotesk-sub">{t.stackRobot.sub}</p>
            </GlassEffect>
          </section>

          {/* Secção "experiência visual": fundo WebGL (colinas GLSL) + texto
              editorial centrado, sem cartão. Fundo branco a contrastar com o
              painel preto do robô que a antecede. */}
          <section className="lpg-stack lpg-stack-3 lpg-stack-visual" aria-labelledby="lpg-visual-title">
            <div className="lpg-visual-bg" aria-hidden="true">
              <GLSLHills color={[0.16, 0.23, 0.27]} opacity={1.6} />
            </div>
            <div className="lpg-visual-copy">
              <h2 id="lpg-visual-title" className="lpg-visual-title">
                <span className="lpg-visual-title-a">{t.stackVisual.titleA}</span>
                <span className="lpg-visual-title-b">{t.stackVisual.titleB}</span>
              </h2>
              <p className="lpg-visual-sub">{t.stackVisual.sub}</p>
            </div>
          </section>

          {/* Secção "imaginação → realidade" (estética Noctuary de fable-25): enxame
              de traças 3D (three.js) a orbitar um candeeiro e a seguir o cursor.
              Texto à esquerda (Archivo + Spectral SC), candeeiro à direita. */}
          <section className="lpg-stack lpg-stack-4 lpg-noctuary" aria-labelledby="lpg-noctuary-title">
            <div className="lpg-noctuary-scene" aria-hidden="true">
              <NoctuarySwarm />
            </div>
            <div className="lpg-noctuary-scrim" aria-hidden="true" />
            <div className="lpg-wrap lpg-noctuary-inner">
              <div className="lpg-noctuary-copy">
                <p className="lpg-noctuary-kicker">{t.stackNoctuary.kicker}</p>
                <h2 id="lpg-noctuary-title" className="lpg-noctuary-title">{t.stackNoctuary.title}</h2>
                <p className="lpg-noctuary-desc">
                  {t.stackNoctuary.descPre}{' '}
                  <span className="lpg-noctuary-accent">{t.stackNoctuary.descAccent}</span>
                </p>
                <p className="lpg-noctuary-hint">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" strokeLinecap="round" />
                  </svg>
                  {t.stackNoctuary.caption}
                </p>
              </div>
            </div>
          </section>

          {/* Último painel da pilha: cidade 3D navegável (estilo Expo Dubai virtual).
              Substituiu o filler "E depois? Continuamos consigo." — cena three.js
              com órbita mínima (auto-rotação + arrastar). */}
          <section className="lpg-stack lpg-stack-5 lpg-city" aria-labelledby="lpg-city-title">
            <div className="lpg-city-scene" aria-hidden="true">
              <CityScene />
            </div>
            <div className="lpg-city-scrim" aria-hidden="true" />
            <div className="lpg-wrap lpg-city-inner">
              <div className="lpg-city-copy">
                <p className="lpg-city-kicker">{t.stackCity.kicker}</p>
                <h2 id="lpg-city-title" className="lpg-city-title">{t.stackCity.title}</h2>
                <p className="lpg-city-hint">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M7 8l-3 4 3 4M17 8l3 4-3 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t.stackCity.hint}
                </p>
              </div>
            </div>
          </section>

          {/* Dá ao último painel (cidade) o seu "turno" antes de largar — ver nota acima. */}
          <div className="lpg-stack-spacer lpg-stack-spacer--city" aria-hidden="true" />
        </div>

        {/* ============ CTA FINAL + FORMULÁRIO (Fale connosco) ============ */}
        {/* .lpg-cover-next (z-index acima do último cartão da pilha, z14): cobre-o
            assim que entra no ecrã — este papel era antes da secção "Método". */}
        <section className="lpg-section lpg-final lpg-grain lpg-cover-next" id="lpg-contacto" aria-labelledby="lpg-form-title">
          <div className="lpg-wrap">
            <div className="lpg-final-grid">
              <div className="lpg-final-copy">
                <span className="lpg-badge">{t.form.badge}</span>
                <h2 id="lpg-form-title" className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.form.title} gradId="lpg-ug-form" bright /></h2>
                <p>{t.form.subtitle}</p>
                <div className="lpg-final-seals">
                  {t.hero.seals.map((s) => (
                    <span className="lpg-final-seal" key={s}><IconCheck />{s}</span>
                  ))}
                </div>

                {/* Falar diretamente com o fundador — foto + apresentação + WhatsApp */}
                <div className="lpg-final-wa">
                  <div className="lpg-final-wa-me">
                    {/* Avatar mostra a foto inteira (a foto é quase quadrada, então
                        object-fit:cover num box quadrado exibe-a por completo). */}
                    <span className="lpg-final-wa-photo">
                      <Image
                        src="/guilherme-kodenvis.jpg"
                        alt={lang === 'pt' ? 'Guilherme Kodenvis, Gestor de TI e fundador da BlackElephant' : 'Guilherme Kodenvis, IT Manager and founder of BlackElephant'}
                        width={280}
                        height={280}
                        className="lpg-final-wa-img"
                      />
                    </span>
                    <div className="lpg-final-wa-bio">
                      <strong>Guilherme Kodenvis</strong>
                      <span>{lang === 'pt' ? 'Gestor de TI e fundador da BlackElephant' : 'IT Manager & founder of BlackElephant'}</span>
                    </div>
                  </div>
                  <p>{lang === 'pt' ? 'Fale diretamente comigo pelo WhatsApp' : 'Talk to me directly on WhatsApp'}</p>
                  {/* CONVERSÃO: clique no WhatsApp dispara conversão (gtag) */}
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lpg-btn lpg-btn-wa lpg-btn-block"
                    onClick={onWhatsAppClick}
                  >
                    <IconWhatsApp /> {t.form.whatsapp}
                  </a>
                </div>
              </div>

              {/* Formulário de captação de lead (componentizado — reutilizado no modal) */}
              <div className="lpg-card">
                <ContactForm t={t.form} locale={locale} lang={lang} />
              </div>
            </div>
          </div>
        </section>

        {/* ============ DÚVIDAS FREQUENTES (FAQ) — reposicionada abaixo do "Fale connosco" ============ */}
        <section className="lpg-section" style={{ background: 'var(--white)' }} aria-labelledby="lpg-faq-title">
          <div className="lpg-wrap">
            <div className="lpg-reveal lpg-eyebrow-center" style={{ maxWidth: 640, margin: '0 auto' }}>
              <span className="lpg-badge">{t.faq.badge}</span>
              <h2 id="lpg-faq-title" className="lpg-h2" style={{ marginTop: 16 }}><MixedTitle segs={t.faq.title} gradId="lpg-ug-faq" /></h2>
            </div>
            <div className="lpg-faq">
              {t.faq.items.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div className="lpg-faq-item" key={i}>
                    <h3 style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="lpg-faq-q"
                        aria-expanded={open}
                        aria-controls={`lpg-faq-p-${i}`}
                        id={`lpg-faq-q-${i}`}
                        onClick={() => setOpenFaq(open ? null : i)}
                      >
                        {item.q}
                        <svg className="chev" viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
                          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </h3>
                    <div
                      className="lpg-faq-panel"
                      id={`lpg-faq-p-${i}`}
                      role="region"
                      aria-labelledby={`lpg-faq-q-${i}`}
                      data-open={open}
                    >
                      <div className="lpg-faq-panel-in">{item.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ============ RODAPÉ ============ */}
      <footer className="lpg-footer">
        <div className="lpg-wrap">
          <div className="lpg-footer-grid">
            <div className="lpg-footer-brand">
              <span className="lpg-logo">
                <Image
                  src="/logo-elephant.png"
                  alt={lang === 'pt' ? 'Logótipo da BlackElephant, agência de criação de sites em Portugal' : 'BlackElephant logo, web design agency in Portugal'}
                  width={38}
                  height={38}
                  className="lpg-logo-img lpg-logo-img--invert"
                />
                BlackElephant
              </span>
              <p className="lpg-footer-tag">{t.footer.tagline}</p>
              {/* Sinal local (geo-targeting Portugal) */}
              <p className="lpg-footer-tag">{t.footer.localLine}</p>
            </div>
            <div className="lpg-footer-col">
              <h3>{t.footer.contact}</h3>
              <ul>
                <li><a href={`/${locale}/privacy-policy`}>{t.footer.privacy}</a></li>
                <li><a href={`/${locale}/terms-of-use`}>{t.footer.terms}</a></li>
                <li><a href={waHref} target="_blank" rel="noopener noreferrer" onClick={onWhatsAppClick}>WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="lpg-footer-bottom">
            <span>© {new Date().getFullYear()} BlackElephant · {t.footer.nif} · {t.footer.rights}</span>
            <span>{t.footer.compliance}</span>
          </div>
        </div>
      </footer>

      {/* Botão flutuante de WhatsApp — redondo, neon, pulsante (canto inferior direito) */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onWhatsAppClick}
        className="lpg-wa-float"
        aria-label={t.form.whatsapp}
      >
        <IconWhatsApp />
      </a>

      {/* ============ BANNER DE COOKIES (RGPD) ============ */}
      {!cookieDecided && (
        <div className="lpg-cookie" role="dialog" aria-live="polite" aria-label="Cookies">
          <p>
            {t.cookie.text}{' '}
            <a href={`/${locale}/privacy-policy`} target="_blank" rel="noopener noreferrer">{t.cookie.privacy}</a>.
          </p>
          <div className="lpg-cookie-actions">
            <button type="button" className="lpg-cookie-reject" onClick={() => decideCookies('rejected')}>{t.cookie.reject}</button>
            <button type="button" className="lpg-cookie-accept" onClick={() => decideCookies('accepted')}>{t.cookie.accept}</button>
          </div>
        </div>
      )}

      {/* Modal flutuante de contacto (aberto pelos CTAs: hero, navbar, oferta, personalize) */}
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} t={t.form} locale={locale} lang={lang} />
    </div>
  );
}
