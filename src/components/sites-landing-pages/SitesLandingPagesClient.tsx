'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { reportContatoWhatsappConversion } from '@/lib/analytics/google-ads';
import { LandingPageHeader } from './LandingPageHeader';

type LocaleKey = 'pt' | 'en';
type SitesLandingPagesClientProps = {
  locale: string;
};

export const LINKS = {
  whatsapp: 'https://wa.me/5519978055531',
  whatsappHero: 'https://wa.me/5519978055531?text=Ol%C3%A1%2C%20vim%20pelo%20site%20de%20voc%C3%AA%20e%20preciso%20de%20uma%20Landing%20Page',
  calendly: 'https://calendly.com/guilherme-blackelephant/30min',
  landingCheckout: 'https://buy.stripe.com/test_7sYfZh5ZJ0Hn4TacuoenS01',
  contactWebhook: 'https://black-elephant.app.n8n.cloud/webhook/blackelephant-contact-form',
} as const;

function getLocale(locale: string): LocaleKey {
  return locale === 'pt' ? 'pt' : 'en';
}

// Segmento de título editorial: "serif" = linha introdutória leve, "bold" = texto
// branco em negrito, "lime" = palavra de destaque na cor primária.
type TitleSegment = { text: string; variant: 'serif' | 'bold' | 'lime' };

function SectionTitle({ segments }: { segments: readonly TitleSegment[] }) {
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.variant === 'serif') {
          return (
            <span key={i} className="block" style={{ fontFamily: 'var(--font-serif)', fontWeight: 100 }}>
              {seg.text}
            </span>
          );
        }
        if (seg.variant === 'lime') {
          return <span key={i} className="font-black text-[var(--color-brand)]">{seg.text}</span>;
        }
        return <span key={i} className="font-black text-[var(--foreground)]">{seg.text}</span>;
      })}
    </>
  );
}

const COPY = {
  pt: {
    eyebrowLead: 'Faça sua Landing Page de ',
    eyebrowStrong: 'Alta Conversão',
    heroTitle: 'Tenha uma\npágina que converte\nacessos em vendas.',
    heroText: 'Imagine ter uma vitrine tão boa que te traz clientes até quando você está dormindo.',
    heroCtaLabel: 'Ver como funciona',
    heroAvgDelivery: 'Média de entrega: 36h',
    heroCounter: 'Landing Pages entregues',
    buyLanding: 'Quero minha landing page agora',
    whatsapp: 'Chamar no WhatsApp',
    calendly: 'Agendar call',
    landingName: 'Landing Page de Alta Conversão',
    landingPrice: 'R$ 1.997',
    deliveryBadge: 'Pronta em 48h',
    guaranteeBadge: '15 dias de garantia',
    guaranteeTitle: 'Garantia de 15 dias',
    guaranteeText:
      'Garantia real de 15 dias: se a entrega não atender o briefing ou você simplesmente não gostar, refaremos do zero ou devolvemos o valor. Sem negociação. A palavra é nossa.',
    marqueeOne: ['ALTA CONVERSÃO', 'SEO', 'PERFORMANCE', 'DESIGN PREMIUM', 'WHATSAPP', 'TRÁFEGO PAGO', 'COPY ESTRATÉGICA'],

    problemEyebrow: 'O problema real',
    problemTitleParts: [
      { text: 'Você não está', variant: 'serif' },
      { text: 'perdendo vendas por causa do ', variant: 'bold' },
      { text: 'anúncio', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    problemParagraph: {
      pre: 'Você ajustou o anúncio. O tráfego chega. Mas a conversão não sai. Na maioria dos casos, o problema não é o tráfego, é a ',
      strong: 'página',
      mid: ': lenta no celular, texto genérico e CTA escondido. E cada clique continua ',
      em: 'custando',
      end: '.',
    },
    problemBeforeLabel: 'Sua página feita por outros',
    problemAfterLabel: 'Sua página feita por nós',

    problemTitle: 'Você não está perdendo vendas por causa do anúncio.',
    problemText: 'Você ajustou o criativo. Testou audiência. Otimizou orçamento. O anúncio está performando. Mas a conversão não sai. Na maioria dos casos, o problema não é o tráfego. É a página. Lenta no celular, com texto genérico, CTA escondido e mensagem desalinhada do anúncio. E enquanto isso, cada clique continua custando.',
    outcomes: [
      ['Página genérica sem conexão com o anúncio', 'Mensagem alinhada ao criativo da campanha'],
      ['CTA enterrado no meio da página', 'Oferta clara e CTA visível em todos os pontos'],
      ['Carregamento lento que perde o visitante', 'Performance otimizada para mobile e tráfego pago'],
      ['Dev que não entende de campanha', 'Construída por quem pensa como gestor de tráfego'],
    ],
    productsTitle: 'Uma página feita para a sua campanha. Não para o portfólio do dev.',
    productsText: 'Cada detalhe foi pensado para converter o tráfego que você já está pagando. Não para impressionar um júri de design.',
    landingDescription:
      'Uma página focada para campanhas, lançamentos, captação de leads e conversão por WhatsApp.',
    productIncludes: [
      'Texto alinhado ao anúncio e à persona do seu público',
      'Design responsivo e rápido no celular',
      'Performance otimizada para não perder o clique',
      'Publicação assistida incluída no valor',
    ],
    benefitsTitle: 'O que muda quando a página foi feita para converter. Não para parecer bonita.',
    benefitsSubtitle: 'Cada decisão de design e copy tem uma razão: fazer o visitante agir.',
    benefits: [
      ['Um único objetivo', 'Sem menu, sem distração, sem link para fora. O visitante tem um único caminho: a sua oferta.'],
      ['Copy alinhada ao anúncio', 'O texto que a pessoa lê na página é o mesmo argumento do anúncio. Isso elimina a fricção e aumenta a confiança.'],
      ['CTA em evidência em todos os pontos', 'Não importa onde o visitante para de rolar: tem um botão de ação visível. Nenhum lead escapa.'],
      ['Mobile-first de verdade', '80% dos cliques de tráfego pago chegam do celular. Cada pixel foi pensado para essa tela, não adaptado depois.'],
      ['Velocidade que não perde o visitante', '3 segundos de carregamento e 50% dos visitantes já foram embora. A página é leve, rápida e não pune o clique que você pagou.'],
      ['Pronta em 48h, não em 3 semanas', 'Sua campanha não pode esperar. A página fica no ar em 48 horas após o briefing, com tracking configurado.'],
    ],

    statsEyebrow: 'Resultados que falam',
    statsTitleParts: [
      { text: 'Números', variant: 'serif' },
      { text: 'de quem faz isso todos os ', variant: 'bold' },
      { text: 'dias', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    stats: [
      { countTo: 100, prefix: '', suffix: '+', static: undefined as string | undefined, label: 'páginas entregues' },
      { countTo: 4, prefix: 'até ', suffix: '', static: undefined as string | undefined, label: 'dias para tudo no ar' },
      { countTo: null, prefix: '', suffix: '', static: '5,0', label: 'de avaliação média' },
      { countTo: null, prefix: '', suffix: '', static: 'R$ 0', label: 'de mensalidade de hospedagem' },
    ],

    includedEyebrow: 'Tudo incluído',
    includedTitleParts: [
      { text: 'Você recebe', variant: 'serif' },
      { text: 'a página pronta. E tudo o que ela precisa para ', variant: 'bold' },
      { text: 'funcionar', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    includedParagraph:
      'Nada de surpresa depois da entrega: "a hospedagem é à parte", "o SSL você contrata", "o Analytics é outro serviço". Na BlackElephant, está tudo dentro. Configurado, testado e funcionando.',
    includedCards: [
      ['Hospedagem gratuita', 'Sua página no ar sem nenhuma mensalidade de servidor. A configuração é por nossa conta.'],
      ['SSL e Cloudflare grátis', 'Cadeado de segurança e proteção contra instabilidade, já configurados. Página segura converte mais.'],
      ['SEO configurado', 'Sua página preparada para ser encontrada no Google, não só para receber tráfego pago.'],
      ['Google Tag e Analytics', 'Você sabe exatamente quantas pessoas visitam, de onde vêm e o que fazem na sua página.'],
      ['Formulário de contato', 'Leads preenchem na página e caem direto pra você. Sem ferramenta extra, sem custo extra.'],
      ['WhatsApp e agendamento', 'Botão de WhatsApp em todos os pontos da página e agendamento por Calendly, se fizer sentido.'],
      ['100% responsiva', 'Construída primeiro pro celular, onde chegam mais de 80% dos cliques de campanha.'],
      ['Tudo no ar em até 4 dias', 'Da conversa inicial à página publicada com domínio, segurança e métricas funcionando.'],
    ],

    whyEyebrow: 'Nossa diferença',
    whyTitleParts: [
      { text: 'Páginas feitas', variant: 'serif' },
      { text: 'por especialistas em ', variant: 'bold' },
      { text: 'conversão', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    whyTitle: 'Páginas feitas por especialistas em conversão.',
    whyText: 'A diferença entre uma página bonita e uma que vende é que a segunda foi construída pensando no clique que chegou nela. Não fazemos sites. Fazemos páginas que fecham o que o anúncio abre.',
    whyItems: [
      ['Um único objetivo', 'Sem menu, sem distração, sem link pra fora. O visitante tem um caminho só: a sua oferta.'],
      ['Copy alinhada ao anúncio', 'O argumento da página é o mesmo do anúncio. Isso elimina fricção e aumenta confiança.'],
      ['CTA sempre visível', 'Não importa onde o visitante pare de rolar, tem um botão de ação na tela.'],
      ['Velocidade que não pune o clique', '3 segundos de carregamento e metade dos visitantes já foi embora. Sua página é leve e rápida.'],
    ],

    audienceEyebrow: 'Para quem é',
    audienceTitleParts: [
      { text: 'Se você', variant: 'serif' },
      { text: 'anuncia online, essa página é pra ', variant: 'bold' },
      { text: 'você', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    audienceParagraph: 'Atendemos negócios de todos os tamanhos no Sul e Sudeste (e no Brasil inteiro, porque é tudo online).',
    audienceCards: [
      ['Profissionais liberais', 'Médicos, dentistas, advogados, arquitetos. Página focada em gerar agendamentos qualificados.'],
      ['Negócios locais', 'Clínicas, estéticas, academias, restaurantes. Transforme o anúncio em cliente na porta.'],
      ['Prestadores de serviço', 'Consultores, agências, técnicos. Página que gera pedidos de orçamento prontos pra fechar.'],
      ['Quem vende produto', 'Lançamentos, infoprodutos e e-commerce. Página de oferta que conduz direto pro checkout ou WhatsApp.'],
    ],

    recentWorkEyebrow: 'Trabalhos recentes',
    recentWorkTitleParts: [
      { text: 'Páginas que', variant: 'serif' },
      { text: 'a gente já entregou para quem precisava ', variant: 'bold' },
      { text: 'vender', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    recentWorkAlt: 'Landing page desenvolvida pela BlackElephant',

    testimonialsEyebrow: 'Quem contratou',
    testimonialsTitleParts: [
      { text: 'O antes', variant: 'serif' },
      { text: 'e o depois de quem trocou a ', variant: 'bold' },
      { text: 'página', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    testimonialsTitle: 'O antes e o depois de quem trocou a página.',

    processEyebrow: 'Como funciona',
    processTitleParts: [
      { text: 'Da primeira', variant: 'serif' },
      { text: 'mensagem ao ar em até ', variant: 'bold' },
      { text: '4 dias', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    processTitle: 'Da primeira mensagem ao ar em até 4 dias.',
    processSubtitle: 'Simples pra você. Sem reunião interminável, sem orçamento que demora uma semana pra chegar.',
    process: [
      ['Você chama no WhatsApp', 'Conta sua oferta, seu público e seu objetivo. É um diagnóstico gratuito, direto na conversa. Sem call obrigatória.'],
      ['Você recebe a proposta exata', 'Com base no que seu negócio precisa, enviamos a proposta sob medida. Aprovou? Começamos no mesmo dia.'],
      ['Copy, design e desenvolvimento', 'Montamos estrutura, texto estratégico e design alinhado à sua marca. Você acompanha e aprova antes de ir ao ar.'],
      ['Tudo no ar em até 4 dias', 'Página publicada com hospedagem, SSL, SEO, formulário e métricas configurados. Pronta pra receber campanha.'],
    ],
    formTitle: 'Ainda tem dúvidas? Conta para a gente.',
    formText: 'Sem compromisso. Entendemos a sua situação e mostramos se faz sentido.',
    formNamePlaceholder: 'Seu nome',
    formEmailPlaceholder: 'Seu melhor e-mail',
    formPhonePlaceholder: 'WhatsApp (opcional)',
    formSubmitLabel: 'Quero tirar minhas dúvidas',
    formSubmitting: 'Enviando...',
    formErrorMessage: 'Algo deu errado. Tente de novo ou nos chame no WhatsApp.',

    faqEyebrow: 'Perguntas frequentes',
    faqTitleParts: [
      { text: 'As perguntas', variant: 'serif' },
      { text: 'que aparecem toda vez, respondidas com ', variant: 'bold' },
      { text: 'honestidade', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    faqTitle: 'As perguntas que aparecem toda vez, respondidas com honestidade.',
    faqs: [
      ['Em quanto tempo fica pronta?', 'Em até 4 dias após a aprovação do briefing, com tudo configurado: hospedagem, SSL, SEO, formulário e métricas. Você recebe a URL pronta pra receber tráfego.'],
      ['Quanto custa?', 'Depende do escopo do seu projeto. Em uma conversa rápida no WhatsApp você recebe a proposta exata, sem compromisso. Não trabalhamos com pacote genérico porque negócio genérico não existe.'],
      ['A hospedagem é grátis mesmo?', 'Sim. Servidor, configuração, SSL e Cloudflare são por nossa conta, sem mensalidade. Você não paga nada além do projeto.'],
      ['Preciso ter logo, domínio ou material pronto?', 'Não. A gente ajuda a organizar tudo no briefing. Se você tiver identidade visual, usamos. Se não tiver, resolvemos junto.'],
      ['Funciona bem no celular?', 'Sim. A página é mobile-first: construída primeiro pro celular, onde chegam mais de 80% dos cliques de tráfego pago.'],
      ['Vocês garantem que vai converter?', 'Não garantimos conversão, porque isso depende da sua oferta, do seu tráfego e do seu preço. Nenhuma agência séria garante isso. O que garantimos é a entrega: uma página construída com as melhores práticas de conversão. Se não atender, devolvemos o valor.'],
      ['Já me decepcionei com agência antes. Por que seria diferente?', 'Porque a maioria das agências faz sites. A gente faz páginas pra campanha. Quem cuida da sua entrega entende de copy, CTA e tráfego. E você tem 15 dias de garantia pra comprovar.'],
      ['Vocês atendem a minha cidade?', 'Atendemos todo o Brasil, 100% online. A maioria dos nossos clientes está no Sul e Sudeste, e todo o processo acontece pelo WhatsApp, sem precisar de reunião presencial.'],
    ],
    finalCtaEyebrow: 'Última chamada',
    finalCtaTitle: 'Cada dia com a página errada é dinheiro de anúncio indo embora.',
    finalCtaText: 'Se você continuar com a página que tem agora, o resultado vai ser o mesmo: o anúncio vai continuar pagando cliques que a página não fecha. A conversa é gratuita, leva 10 minutos e você sai sabendo exatamente o que precisa.',
    finalCtaPs: 'A proposta é sob medida, a entrega leva até 4 dias e a garantia é de 15 dias. A única coisa que você arrisca é continuar com a página que já tem.',
    finalCtaBuyLabel: 'Chamar no WhatsApp agora',
    finalCtaWhatsappLabel: 'Agendar uma call',
  },
  en: {
    eyebrowLead: 'Build your ',
    eyebrowStrong: 'High-Converting Landing Page',
    heroTitle: 'Get a\npage that turns\nclicks into sales.',
    heroText: 'Imagine having a storefront so good it brings you customers even while you sleep.',
    heroCtaLabel: 'See how it works',
    heroAvgDelivery: 'Average delivery: 36h',
    heroCounter: 'Landing Pages delivered',
    buyLanding: 'I want my landing page now',
    whatsapp: 'Message on WhatsApp',
    calendly: 'Schedule a call',
    landingName: 'High-Converting Landing Page',
    landingPrice: 'US$ 1,997',
    deliveryBadge: 'Ready in 48h',
    guaranteeBadge: '15-day guarantee',
    guaranteeTitle: '15-day guarantee',
    guaranteeText:
      'Real 15-day guarantee: if the delivery does not meet the briefing or you simply do not like it, we redo it from scratch or refund the full amount. No negotiation. Our word.',
    marqueeOne: ['HIGH CONVERSION', 'SEO', 'PERFORMANCE', 'PREMIUM DESIGN', 'WHATSAPP', 'PAID TRAFFIC', 'STRATEGIC COPY'],

    problemEyebrow: 'The real problem',
    problemTitleParts: [
      { text: "You're not", variant: 'serif' },
      { text: 'losing sales because of the ', variant: 'bold' },
      { text: 'ad', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    problemParagraph: {
      pre: "You tweaked the ad. Traffic arrives. But conversions aren't coming. In most cases, the problem isn't the traffic — it's the ",
      strong: 'page',
      mid: ': slow on mobile, generic copy, and a hidden CTA. And every click keeps ',
      em: 'costing you',
      end: '.',
    },
    problemBeforeLabel: 'Your page made by others',
    problemAfterLabel: 'Your page made by us',

    problemTitle: 'You are not losing sales because of the ad.',
    problemText: 'You adjusted the creative. Tested audiences. Optimized the budget. The ad is performing. But conversions are not coming. In most cases, the problem is not the traffic. It is the page. Slow on mobile, with generic text, a hidden CTA and a message that does not match the ad. And meanwhile, every click keeps costing money.',
    outcomes: [
      ['Generic page with no connection to the ad', 'Message aligned with the campaign creative'],
      ['CTA buried in the middle of the page', 'Clear offer and CTA visible at every point'],
      ['Slow loading that loses the visitor', 'Performance optimized for mobile and paid traffic'],
      ['Dev who does not understand campaigns', 'Built by someone who thinks like a traffic manager'],
    ],
    productsTitle: 'A page built for your campaign. Not for the dev portfolio.',
    productsText: 'Every detail was thought out to convert the traffic you are already paying for. Not to impress a design jury.',
    landingDescription:
      'One focused page for campaigns, launches, lead capture, and WhatsApp conversion.',
    productIncludes: [
      'Text aligned with the ad and your target persona',
      'Responsive design, fast on mobile',
      'Optimized performance so no click is wasted',
      'Assisted launch included in the price',
    ],
    benefitsTitle: 'What changes when the page was built to convert. Not to look pretty.',
    benefitsSubtitle: 'Every design and copy decision has a reason: to make the visitor act.',
    benefits: [
      ['One single objective', 'No menu, no distraction, no external links. The visitor has one path: your offer.'],
      ['Copy aligned with the ad', 'The text the person reads on the page is the same argument as the ad. This eliminates friction and builds trust.'],
      ['CTA visible at every point', 'No matter where the visitor stops scrolling: there is an action button visible. No lead escapes.'],
      ['Truly mobile-first', '80% of paid traffic clicks come from mobile. Every pixel was designed for that screen, not adapted after.'],
      ['Speed that does not lose the visitor', '3 seconds of loading and 50% of visitors are already gone. The page is light, fast and does not punish the click you paid for.'],
      ['Ready in 48h, not 3 weeks', 'Your campaign cannot wait. The page goes live in 48 hours after the briefing, with tracking configured.'],
    ],

    statsEyebrow: 'Results that speak for themselves',
    statsTitleParts: [
      { text: 'Numbers', variant: 'serif' },
      { text: 'from those who do this every ', variant: 'bold' },
      { text: 'day', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    stats: [
      { countTo: 100, prefix: '', suffix: '+', static: undefined as string | undefined, label: 'pages delivered' },
      { countTo: 4, prefix: 'up to ', suffix: '', static: undefined as string | undefined, label: 'days to go live' },
      { countTo: null, prefix: '', suffix: '', static: '5.0', label: 'average rating' },
      { countTo: null, prefix: '', suffix: '', static: 'US$ 0', label: 'monthly hosting fee' },
    ],

    includedEyebrow: 'Everything included',
    includedTitleParts: [
      { text: 'You get', variant: 'serif' },
      { text: 'the finished page. And everything it needs to ', variant: 'bold' },
      { text: 'work', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    includedParagraph:
      'No surprises after delivery: "hosting is extra," "you need to buy SSL yourself," "Analytics is a separate service." At BlackElephant, everything is included — configured, tested, and working.',
    includedCards: [
      ['Free hosting', 'Your page live with zero server monthly fees. Setup is on us.'],
      ['Free SSL and Cloudflare', 'Security padlock and protection against downtime, already configured. A secure page converts better.'],
      ['SEO configured', 'Your page ready to be found on Google, not just to receive paid traffic.'],
      ['Google Tag and Analytics', 'You know exactly how many people visit, where they come from, and what they do on your page.'],
      ['Contact form', 'Leads fill it out on the page and land straight in your inbox. No extra tool, no extra cost.'],
      ['WhatsApp and scheduling', 'WhatsApp button at every point on the page, plus Calendly scheduling if it makes sense for your business.'],
      ['100% responsive', 'Built mobile-first, since over 80% of campaign clicks arrive from mobile.'],
      ['Live in up to 4 days', 'From the first conversation to a published page with domain, security, and tracking all working.'],
    ],

    whyEyebrow: 'What sets us apart',
    whyTitleParts: [
      { text: 'Pages built', variant: 'serif' },
      { text: 'by specialists in ', variant: 'bold' },
      { text: 'conversion', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    whyTitle: 'Pages built by conversion specialists.',
    whyText: "The difference between a beautiful page and one that sells is that the second was built with the click that landed on it in mind. We don't build websites. We build pages that close what the ad opens.",
    whyItems: [
      ['A single objective', 'No menu, no distractions, no outbound links. The visitor has only one path: your offer.'],
      ['Copy aligned with the ad', "The page's argument is the same as the ad's. This removes friction and builds trust."],
      ['CTA always visible', 'No matter where the visitor stops scrolling, there is always an action button on screen.'],
      ['Speed that respects your click', '3 seconds of load time and half your visitors are already gone. Your page is light and fast.'],
    ],

    audienceEyebrow: "Who it's for",
    audienceTitleParts: [
      { text: 'If you', variant: 'serif' },
      { text: 'advertise online, this page is for ', variant: 'bold' },
      { text: 'you', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    audienceParagraph: 'We serve businesses of all sizes in the South and Southeast of Brazil (and across the whole country, since everything happens online).',
    audienceCards: [
      ['Independent professionals', 'Doctors, dentists, lawyers, architects. A page focused on generating qualified appointments.'],
      ['Local businesses', 'Clinics, aesthetics studios, gyms, restaurants. Turn your ad into customers walking through the door.'],
      ['Service providers', 'Consultants, agencies, technicians. A page that generates quote requests ready to close.'],
      ['Product sellers', 'Launches, digital products and e-commerce. An offer page that leads straight to checkout or WhatsApp.'],
    ],

    recentWorkEyebrow: 'Recent work',
    recentWorkTitleParts: [
      { text: "Pages we've", variant: 'serif' },
      { text: 'already delivered for those who needed to ', variant: 'bold' },
      { text: 'sell', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    recentWorkAlt: 'Landing page built by BlackElephant',

    testimonialsEyebrow: 'Our clients',
    testimonialsTitleParts: [
      { text: 'The before', variant: 'serif' },
      { text: 'and after of those who switched their ', variant: 'bold' },
      { text: 'page', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    testimonialsTitle: 'The before and after of those who switched the page.',

    processEyebrow: 'How it works',
    processTitleParts: [
      { text: 'From first', variant: 'serif' },
      { text: 'message to live in up to ', variant: 'bold' },
      { text: '4 days', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    processTitle: 'From the first message to live in up to 4 days.',
    processSubtitle: 'Simple for you. No endless meetings, no proposal that takes a week to arrive.',
    process: [
      ['You message us on WhatsApp', "Tell us your offer, your audience and your goal. It's a free diagnosis, straight in the chat. No mandatory call."],
      ['You get the exact proposal', 'Based on what your business needs, we send a custom-made proposal. Approved? We start the same day.'],
      ['Copy, design and development', 'We build the structure, strategic copy and design aligned with your brand. You follow along and approve before it goes live.'],
      ['Live in up to 4 days', 'Page published with hosting, SSL, SEO, form and tracking all configured. Ready to receive your campaign.'],
    ],
    formTitle: 'Still have questions? Tell us.',
    formText: 'No commitment. We understand your situation and show you if it makes sense.',
    formNamePlaceholder: 'Your name',
    formEmailPlaceholder: 'Your best email',
    formPhonePlaceholder: 'WhatsApp (optional)',
    formSubmitLabel: 'Get in touch',
    formSubmitting: 'Sending...',
    formErrorMessage: 'Something went wrong. Try again or reach us on WhatsApp.',

    faqEyebrow: 'Frequently asked questions',
    faqTitleParts: [
      { text: 'The questions', variant: 'serif' },
      { text: 'that always come up, answered with ', variant: 'bold' },
      { text: 'honesty', variant: 'lime' },
      { text: '.', variant: 'bold' },
    ] as TitleSegment[],
    faqTitle: 'The questions that always come up, answered honestly.',
    faqs: [
      ['How long does it take to be ready?', 'Up to 4 days after briefing approval, with everything configured: hosting, SSL, SEO, form and tracking. You receive the URL ready to receive traffic.'],
      ['How much does it cost?', "It depends on your project's scope. In a quick WhatsApp chat you get the exact proposal, no strings attached. We do not work with generic packages, because there is no such thing as a generic business."],
      ['Is hosting really free?', 'Yes. Server, setup, SSL and Cloudflare are on us, with no monthly fee. You pay nothing beyond the project itself.'],
      ['Do I need a logo, domain or materials ready?', 'No. We help organize everything during the briefing. If you have a visual identity, we use it. If not, we figure it out together.'],
      ['Does it work well on mobile?', 'Yes. The page is mobile-first: built for mobile first, where more than 80% of paid traffic clicks come from.'],
      ['Do you guarantee it will convert?', "We do not guarantee conversion, because that depends on your offer, your traffic and your price. No serious agency guarantees that. What we do guarantee is the delivery: a page built with the best conversion practices. If it does not meet that, we refund your money."],
      ["I've been disappointed by an agency before. Why would this be different?", 'Because most agencies build websites. We build pages for campaigns. Whoever handles your delivery understands copy, CTAs and traffic. And you have a 15-day guarantee to prove it.'],
      ['Do you serve my city?', 'We serve all of Brazil, 100% online. Most of our clients are in the South and Southeast, and the whole process happens over WhatsApp, no in-person meeting needed.'],
    ],
    finalCtaEyebrow: 'Last call',
    finalCtaTitle: 'Every day with the wrong page is ad money going down the drain.',
    finalCtaText: "If you stick with the page you have now, the result will be the same: your ad keeps paying for clicks the page can't close. The conversation is free, takes 10 minutes, and you'll walk away knowing exactly what you need.",
    finalCtaPs: 'The proposal is custom-made, delivery takes up to 4 days, and the guarantee is 15 days. The only thing you risk is sticking with the page you already have.',
    finalCtaBuyLabel: 'Message on WhatsApp now',
    finalCtaWhatsappLabel: 'Schedule a call',
  },
} as const;

type HeroCopy = (typeof COPY)[LocaleKey];

const TESTIMONIALS = {
  pt: [
    {
      quote: 'Tínhamos uma página feita por um freelancer que levou 3 semanas e não convertia nada. A BlackElephant refez em 48h. No primeiro mês de campanha tivemos 47 leads com o mesmo orçamento.',
      name: 'Ricardo Alves',
      role: 'Diretor Comercial',
      company: 'Construtora RAE',
      initials: 'RA',
    },
    {
      quote: 'Antes eu tinha um site que parecia de 2015. A BlackElephant criou uma landing page que representa de verdade o meu trabalho. Os pacientes chegam comentando da profissionalidade.',
      name: 'Ana Paula Lima',
      role: 'Nutricionista',
      company: 'Studio NP',
      initials: 'AL',
    },
    {
      quote: 'O design ficou impressionante. Quando mostrei para meus clientes, todos perguntaram quem tinha feito. A página transmite uma credibilidade que eu não conseguia passar antes.',
      name: 'Carlos Mendes',
      role: 'Proprietário',
      company: 'Auto Mendes',
      initials: 'CM',
    },
    {
      quote: 'Processo extremamente simples. Passei o briefing, aprovei o layout e a página foi ao ar rapidinho. O resultado visual superou todas as minhas expectativas.',
      name: 'Juliana Ferreira',
      role: 'Coordenadora de Marketing',
      company: 'Escola Futuro',
      initials: 'JF',
    },
    {
      quote: 'A página reflete exatamente o padrão da clínica. Design sofisticado, copy bem escrita e carregamento rápido. Faz jus ao posicionamento premium que buscamos para a marca.',
      name: 'Roberto Santos',
      role: 'Dentista',
      company: 'Clínica Dental Prime',
      initials: 'RS',
    },
    {
      quote: 'Já contratamos outras agências e nunca ficamos satisfeitos. A BlackElephant entendeu nosso mercado, criou algo elegante e funcional. Agora temos uma página da qual nos orgulhamos.',
      name: 'Patrícia Nunes',
      role: 'Gerente Comercial',
      company: 'Imobiliária Central',
      initials: 'PN',
    },
    {
      quote: 'Impressionante como uma boa página muda a percepção do negócio. Clientes chegam comentando que a página passou muita credibilidade. Design limpo e moderno, exatamente o que eu precisava.',
      name: 'Diego Oliveira',
      role: 'Personal Trainer',
      company: 'DFit Studio',
      initials: 'DO',
    },
    {
      quote: 'A entrega foi rápida e o resultado, impecável. A equipe acertou na primeira versão sem precisar de muitas rodadas de revisão. Profissionalismo do começo ao fim.',
      name: 'Camila Rodrigues',
      role: 'Diretora',
      company: 'Instituto Camila',
      initials: 'CR',
    },
  ],
  en: [
    {
      quote: 'We had a page made by a freelancer that took 3 weeks and converted nothing. BlackElephant rebuilt it in 48h. First month of campaigns brought 47 leads with the same budget.',
      name: 'Ricardo Alves',
      role: 'Sales Director',
      company: 'RAE Construction',
      initials: 'RA',
    },
    {
      quote: 'I used to have a website that looked like 2015. BlackElephant created a landing page that truly represents my work. New patients always comment on the professionalism.',
      name: 'Ana Paula Lima',
      role: 'Nutritionist',
      company: 'Studio NP',
      initials: 'AL',
    },
    {
      quote: 'The design was impressive. When I showed it to my clients, everyone asked who made it. The page conveys credibility I could never communicate before.',
      name: 'Carlos Mendes',
      role: 'Owner',
      company: 'Auto Mendes',
      initials: 'CM',
    },
    {
      quote: 'Extremely simple process. I shared the briefing, approved the layout and the page went live quickly. The visual result exceeded all my expectations.',
      name: 'Juliana Ferreira',
      role: 'Marketing Coordinator',
      company: 'Futuro School',
      initials: 'JF',
    },
    {
      quote: 'The page perfectly reflects the clinic\'s standard. Sophisticated design, well-written copy and fast loading. It matches the premium positioning we pursue for our brand.',
      name: 'Roberto Santos',
      role: 'Dentist',
      company: 'Dental Prime Clinic',
      initials: 'RS',
    },
    {
      quote: 'We hired other agencies before and were never satisfied. BlackElephant understood our market and created something elegant and functional. Now we have a page we are proud of.',
      name: 'Patrícia Nunes',
      role: 'Sales Manager',
      company: 'Central Real Estate',
      initials: 'PN',
    },
    {
      quote: 'Impressive how a good page changes business perception. New clients arrive saying the page conveyed a lot of credibility. Clean, modern design — exactly what I needed.',
      name: 'Diego Oliveira',
      role: 'Personal Trainer',
      company: 'DFit Studio',
      initials: 'DO',
    },
    {
      quote: 'Delivery was fast and the result was flawless. The team nailed it on the first version without many revision rounds. Professionalism from start to finish.',
      name: 'Camila Rodrigues',
      role: 'Director',
      company: 'Camila Institute',
      initials: 'CR',
    },
  ],
} as const;

const SITE_URL = 'https://blackelephant.com.br';
const LANDING_SLUG = 'venda-mais-com-uma-landing-page-de-alta-conversao';

function buildCalendlyUrl(locale: string) {
  const redirectUrl = encodeURIComponent(
    `${SITE_URL}/${locale}/${LANDING_SLUG}/obrigado-calendly`,
  );
  return `${LINKS.calendly}?redirect_url=${redirectUrl}`;
}

export function SitesLandingPagesClient({ locale }: SitesLandingPagesClientProps) {
  const activeLocale = getLocale(locale);
  const copy = COPY[activeLocale];
  const reduceMotion = useReducedMotion();
  const calendlyUrl = buildCalendlyUrl(activeLocale);

  return (
    <div
      className="min-h-screen overflow-hidden pt-16 lg:pt-20"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <LandingPageHeader locale={activeLocale} />
      <HeroSection copy={copy} reduceMotion={reduceMotion} />
      <ProblemSection copy={copy} reduceMotion={reduceMotion} />
      <RecentWorkSection copy={copy} reduceMotion={reduceMotion} />
      <StatsSection copy={copy} reduceMotion={reduceMotion} />
      <IncludedSection copy={copy} reduceMotion={reduceMotion} />
      <WhySection copy={copy} reduceMotion={reduceMotion} />
      <AudienceSection copy={copy} reduceMotion={reduceMotion} />
      <TestimonialsSection locale={activeLocale} copy={copy} reduceMotion={reduceMotion} />
      <ProcessSection copy={copy} reduceMotion={reduceMotion} />
      <FaqSection copy={copy} reduceMotion={reduceMotion} />
      <FinalCtaSection copy={copy} reduceMotion={reduceMotion} calendlyUrl={calendlyUrl} />
    </div>
  );
}

// ─── Before/After Slider ────────────────────────────────────────────────────

function BeforeAfterSlider({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [position, setPosition] = useState(10);

  useEffect(() => {
    if (reduceMotion) { setPosition(50); return; }

    const SLIDE_MS = 800;
    const PAUSE_MS = 1000;
    let cancelled = false;
    const ids: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      ids.push(id);
    };

    const cycle = () => {
      later(() => {
        setPosition(90);
        later(() => {
          setPosition(10);
          later(cycle, SLIDE_MS + PAUSE_MS);
        }, SLIDE_MS + PAUSE_MS);
      }, PAUSE_MS);
    };

    cycle();
    return () => { cancelled = true; ids.forEach(clearTimeout); };
  }, [reduceMotion]);

  const transition = reduceMotion ? undefined : 'clip-path 0.8s ease-in-out, left 0.8s ease-in-out';

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-[4/3] select-none overflow-hidden rounded-[2rem] border border-[var(--color-line)] shadow-2xl shadow-black/50 lg:aspect-auto lg:min-h-[460px]"
    >
      <Image src="/images/site-new.png" alt="Depois" fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" priority draggable={false} />
      <div className="pointer-events-none absolute right-4 top-4 z-10">
        <span className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-black uppercase tracking-widest text-[var(--color-accent-ink)]">Depois</span>
      </div>
      <div
        className="absolute inset-0 z-20"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, transition }}
      >
        <Image src="/images/site-past.png" alt="Antes" fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" draggable={false} />
        <div className="pointer-events-none absolute left-4 top-4">
          <span className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-widest text-white">Antes</span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 z-30 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
        style={{ left: `${position}%`, transition }}
      />
    </motion.div>
  );
}

// ─── Hero Marquee ────────────────────────────────────────────────────────────

function HeroMarquee({ items, reduceMotion }: { items: readonly string[]; reduceMotion: boolean | null }) {
  return (
    <div className="relative overflow-hidden bg-[var(--color-accent)]" role="marquee" aria-label="Destaques">
      <ul className="sr-only">{items.map((item) => <li key={item}>{item}</li>)}</ul>
      <motion.div
        aria-hidden
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex w-max py-[14px]"
      >
        {[0, 1].map((track) => (
          <div key={track} className="flex items-center gap-0 pr-0">
            {items.map((item) => (
              <span key={`${track}-${item}`} className="flex items-center">
                <span className="whitespace-nowrap px-5 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-accent-ink)]">{item}</span>
                <span className="text-[8px] text-[var(--color-accent-ink)]/40">◆</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Hero Counter ────────────────────────────────────────────────────────────

function HeroCounter({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    if (reduceMotion) { setCount(100); return; }
    let rafId: number;
    let startTime: number | null = null;
    const duration = 1800;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * 100));
      if (progress < 1) { rafId = requestAnimationFrame(step); }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, reduceMotion]);

  return (
    <div ref={ref} className="flex items-start gap-3 pt-1">
      <div className="flex shrink-0 items-center gap-2 pt-0.5">
        <div className="h-px w-6 bg-[var(--color-brand)]/35" aria-hidden />
        <span className="text-xl font-black text-[var(--foreground)]" aria-label={`${count}+ ${copy.heroCounter}`}>
          {count}<span className="text-[var(--color-brand)]">+</span>
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-[var(--foreground-subtle)]">{copy.heroCounter}</span>
        <span className="text-xs font-semibold text-[var(--color-brand)]/50">{copy.heroAvgDelivery}</span>
      </div>
    </div>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section id="inicio" className="relative scroll-mt-24 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-10 h-[500px] w-[500px] rounded-full opacity-[0.07] blur-[160px]" style={{ backgroundColor: 'var(--color-brand)' }} />
        <div className="absolute -left-20 bottom-0 h-[380px] w-[380px] rounded-full bg-fuchsia-500/8 blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.028]" style={{ backgroundImage: 'linear-gradient(rgba(18,59,79,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(18,59,79,0.05) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      </div>

      <div className="site-container relative z-10 pb-12 pt-12 lg:pb-16 lg:pt-20">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-16">

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Eyebrow — pill com dot animado */}
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.05] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
                {!reduceMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand)]/40" style={{ animationDuration: '2s' }} />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </span>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-brand)]/75">
                <span className="font-medium">{copy.eyebrowLead}</span>
                <span className="font-black">{copy.eyebrowStrong}</span>
              </p>
            </div>

            {/* Título */}
            <h1
              className="text-[1.875rem] leading-[1.12] sm:text-[2.75rem] lg:text-[3.75rem]"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {copy.heroTitle.split('\n').map((line, i, arr) => {
                if (arr.length === 3) {
                  if (i === 0) return (
                    <span key={i} className="block text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)', fontWeight: 100 }}>
                      {line}
                    </span>
                  );
                  if (i === arr.length - 1) {
                    const lastSpace = line.lastIndexOf(' ');
                    const before = line.slice(0, lastSpace + 1);
                    const rawWord = line.slice(lastSpace + 1);
                    const hasPeriod = rawWord.endsWith('.');
                    const lastWord = hasPeriod ? rawWord.slice(0, -1) : rawWord;
                    return (
                      <span key={i} className="block font-black text-[var(--foreground)]">
                        {before}<span className="text-[var(--color-brand)]">{lastWord}</span>{hasPeriod && '.'}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="block font-black text-[var(--foreground)]">
                      {line}
                    </span>
                  );
                }
                return (
                  <span key={i} className={`block font-black ${i === arr.length - 1 ? 'text-[var(--color-brand)]' : ''}`}>
                    {line}
                  </span>
                );
              })}
            </h1>

            {/* Slider mobile */}
            <div className="lg:hidden">
              <BeforeAfterSlider reduceMotion={reduceMotion} />
            </div>

            {/* Subtexto */}
            <p className="max-w-md text-sm leading-[1.7] text-[var(--foreground-muted)] sm:text-base">
              {copy.heroText}
            </p>

            {/* CTAs + contador */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={LINKS.whatsappHero}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={reportContatoWhatsappConversion}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-sm font-black text-[var(--color-accent-ink)] transition-all duration-300 hover:bg-[var(--color-accent-dark)] hover:shadow-[var(--shadow-cta-hover)] active:scale-[0.97] sm:w-auto sm:text-base"
                >
                  {copy.whatsapp}
                </a>
              </div>
              <HeroCounter copy={copy} reduceMotion={reduceMotion} />
            </div>
          </motion.div>

          {/* Slider desktop */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <BeforeAfterSlider reduceMotion={reduceMotion} />
          </motion.div>
        </div>
      </div>

      <HeroMarquee items={copy.marqueeOne} reduceMotion={reduceMotion} />
    </section>
  );
}

// ─── Problem Section ─────────────────────────────────────────────────────────

function ProblemSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-red-500/6 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[var(--color-brand)]/6 blur-[120px]" />
      </div>

      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-2xl"
        >
          {/* Eyebrow editorial — linha + texto (padrão home) */}
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.problemEyebrow}
            </span>
          </div>

          <h2 className="text-4xl leading-[1.02] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.problemTitleParts} />
          </h2>

          <div className="mt-6">
            <p className="text-base leading-[1.75] text-[var(--foreground-muted)] lg:text-lg">
              {copy.problemParagraph.pre}
              <strong className="font-black text-[var(--foreground)]">{copy.problemParagraph.strong}</strong>
              {copy.problemParagraph.mid}
              <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontWeight: 300, color: 'rgba(255,255,255,0.85)' }}>{copy.problemParagraph.em}</em>
              {copy.problemParagraph.end}
            </p>
          </div>
        </motion.div>

        {/* Cards Antes / Depois — vertical, ícone colorido */}
        <div className="grid gap-4 sm:grid-cols-2">
          {copy.outcomes.map(([before, after], index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.42, delay: index * 0.06 }}
              className="overflow-hidden rounded-2xl border border-white/[0.08]"
            style={{ backgroundColor: 'var(--glass-background)' }}
            >
              {/* ANTES */}
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15">
                    <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-red-400/80">{copy.problemBeforeLabel}</span>
                </div>
                <p className="text-sm leading-[1.65] text-[var(--foreground-subtle)]">{before}</p>
              </div>
              {/* Divisor */}
              <div className="mx-5 border-t border-white/[0.07]" />
              {/* DEPOIS */}
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/15">
                    <svg className="h-3.5 w-3.5 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-brand)]/80">{copy.problemAfterLabel}</span>
                </div>
                <p className="text-sm font-semibold leading-[1.65] text-[var(--foreground)]">{after}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Offer Section (kept for scroll-to anchor, no content) ───────────────────

function OfferSection({ copy, reduceMotion, calendlyUrl }: { copy: HeroCopy; reduceMotion: boolean | null; calendlyUrl: string }) {
  return (
    <section id="oferta" className="relative py-20 lg:py-28">
      <div aria-hidden className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-brand)]/8 blur-[120px]" />
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 max-w-3xl lg:mb-14"
        >
          <h2 className="text-4xl font-black leading-[1.02] text-[var(--foreground)] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.productsTitle}
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-[var(--foreground-muted)]">{copy.productsText}</p>
        </motion.div>

        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl rounded-[1.75rem] border border-[var(--color-brand)]/35 bg-[var(--color-brand)]/[0.07] p-6 lg:p-10"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[var(--foreground)]">{copy.landingName}</h3>
              <p className="mt-3 max-w-lg text-sm leading-[1.7] text-[var(--foreground-muted)]">{copy.landingDescription}</p>
            </div>
            <div className="shrink-0 text-4xl font-black text-[var(--color-brand)]">{copy.landingPrice}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/10 px-3.5 py-2 text-xs font-bold text-[var(--color-brand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              {copy.deliveryBadge}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3.5 py-2 text-xs font-bold text-fuchsia-200">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              {copy.guaranteeBadge}
            </span>
          </div>

          {/* Itens incluídos com benefício */}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {copy.productIncludes.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm font-semibold text-[var(--foreground)]">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                {item}
              </div>
            ))}
          </div>

          {/* Garantia */}
          <div className="mt-7 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.07] p-5">
            <p className="text-sm font-bold leading-[1.7] text-fuchsia-100">
              <span className="mr-2 text-fuchsia-300">{copy.guaranteeTitle}:</span>
              {copy.guaranteeText}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={LINKS.landingCheckout}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-sm font-bold text-[var(--color-accent-ink)] transition-all duration-300 active:scale-95 hover:bg-[var(--color-accent-dark)]"
            >
              {copy.buyLanding}
            </a>
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={reportContatoWhatsappConversion}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--card-background)] px-6 text-sm font-bold text-[var(--foreground)] transition-all duration-300 active:scale-95 hover:border-[var(--color-line)]"
            >
              {copy.whatsapp}
            </a>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--card-background)] px-6 text-sm font-bold text-[var(--foreground)] transition-all duration-300 active:scale-95 hover:border-[var(--color-line)]"
            >
              {copy.calendly}
            </a>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

// ─── Stats Section ───────────────────────────────────────────────────────────

function StatCounter({
  countTo, prefix = '', suffix = '', staticValue, label, index, reduceMotion,
}: {
  countTo: number | null; prefix?: string; suffix?: string; staticValue?: string; label: string;
  index: number; reduceMotion: boolean | null;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView || countTo === null) return;
    if (reduceMotion) { setCount(countTo); return; }
    let rafId: number;
    let startTime: number | null = null;
    const duration = 1600;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * countTo));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, reduceMotion, countTo]);

  const displayed = staticValue ?? `${prefix}${count}${suffix}`;

  return (
    <div ref={ref} className="flex flex-col gap-2 px-6 py-8 lg:px-10 lg:py-10" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div aria-hidden className="mb-1 h-px w-8" style={{ backgroundColor: index === 0 ? 'var(--color-brand)' : 'var(--color-line)' }} />
      <span
        className="text-[2.5rem] font-black leading-none lg:text-[3.5rem]"
        style={{ fontFamily: 'var(--font-title)', color: index === 0 ? 'var(--color-brand)' : 'white' }}
      >
        {displayed}
      </span>
      <span className="text-sm leading-snug text-[var(--foreground-muted)]">{label}</span>
    </div>
  );
}

function StatsSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section id="quem-somos" className="relative scroll-mt-24 py-20 lg:py-28" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand)]/6 blur-[160px]" />
      </div>
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.statsEyebrow}
            </span>
          </div>
          <h2 className="text-4xl leading-[1.02] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.statsTitleParts} />
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-px border border-[var(--color-line)] lg:grid-cols-4" style={{ backgroundColor: 'var(--color-line)' }}>
          {copy.stats.map((stat, i) => (
            <StatCounter
              key={stat.label}
              countTo={stat.countTo}
              prefix={stat.prefix}
              suffix={stat.suffix}
              staticValue={stat.static}
              label={stat.label}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Included Section ────────────────────────────────────────────────────────

const INCLUDED_ICONS = [
  <svg key="hosting" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  <svg key="ssl" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  <svg key="seo" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  <svg key="analytics" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  <svg key="form" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  <svg key="whatsapp" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  <svg key="responsive" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  <svg key="launch" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
];

function IncludedSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section id="beneficios" className="relative scroll-mt-24 py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-[var(--color-brand)]/5 blur-[150px]" />
      </div>
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.includedEyebrow}
            </span>
          </div>
          <h2 className="text-4xl leading-[1.02] sm:text-5xl lg:text-[3.25rem]" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.includedTitleParts} />
          </h2>
          <p className="mt-5 max-w-xl text-base leading-[1.7] text-[var(--foreground-muted)]">
            {copy.includedParagraph}
          </p>
        </motion.div>

        {/* Scroll horizontal no mobile, grade fixa de 3 colunas no desktop (sem scroll) */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 sm:pb-0 lg:overflow-visible">
          <div className="flex min-w-max gap-4 sm:grid sm:min-w-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {copy.includedCards.map(([title, text], i) => (
              <motion.div
                key={title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex w-[260px] shrink-0 flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--card-background)] p-5 sm:w-auto"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-brand)]/25 bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  {INCLUDED_ICONS[i]}
                </div>
                <h3 className="text-sm font-black text-[var(--foreground)]">{title}</h3>
                <p className="text-xs leading-[1.7] text-[var(--foreground-muted)]">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Section ─────────────────────────────────────────────────────────────

function WhySection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section id="diferenciais" className="relative scroll-mt-24 py-20 lg:py-28" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[var(--color-brand)]/5 blur-[140px]" />
      </div>

      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.whyEyebrow}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
            {/* Coluna esquerda: título + texto */}
            <div>
              <h2
                className="text-[2.25rem] leading-[1.02] lg:text-[3.25rem]"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                <SectionTitle segments={copy.whyTitleParts} />
              </h2>
              <div className="mt-5 h-px w-12" style={{ background: 'linear-gradient(90deg, var(--color-brand), transparent)' }} aria-hidden />
              <p className="mt-5 text-base leading-[1.7] text-[var(--foreground-muted)]">{copy.whyText}</p>
            </div>

            {/* Coluna direita: lista numerada /01–/04 */}
            <div className="flex flex-col gap-0 divide-y divide-white/8">
              {copy.whyItems.map(([label, text], i) => (
                <motion.div
                  key={label}
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.38, delay: i * 0.07 }}
                  className="flex gap-5 py-5"
                >
                  <span
                    className="mt-0.5 shrink-0 text-[11px] font-black tabular-nums tracking-[0.2em]"
                    style={{ fontFamily: 'var(--font-title)', color: i === 0 ? 'var(--color-brand)' : 'rgba(255,255,255,0.28)' }}
                  >
                    /{String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-black text-[var(--foreground)]">{label}</p>
                    <p className="mt-1 text-sm leading-[1.65] text-[var(--foreground-muted)]">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Audience Section ─────────────────────────────────────────────────────────

const AUDIENCE_ICONS = [
  <svg key="pros" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  <svg key="local" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  <svg key="service" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  <svg key="product" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/></svg>,
];

function AudienceSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-fuchsia-500/5 blur-[150px]" />
      </div>
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.audienceEyebrow}
            </span>
          </div>
          <h2 className="text-4xl leading-[1.02] sm:text-5xl lg:text-[3.25rem]" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.audienceTitleParts} />
          </h2>
          <p className="mt-5 text-base leading-[1.7] text-[var(--foreground-muted)]">
            {copy.audienceParagraph}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.audienceCards.map(([title, text], i) => (
            <motion.div
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--card-background)] p-6 transition-colors hover:border-[var(--color-brand)]/20 hover:bg-[var(--color-brand)]/[0.03]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--card-background)] text-[var(--foreground-muted)]">
                {AUDIENCE_ICONS[i]}
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm leading-[1.65] text-[var(--foreground-muted)]">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Recent Work Section ─────────────────────────────────────────────────────

const RECENT_WORK_IMAGES = [
  'hubfive.png',
  'alttavia-2.png',
  'bbc.png',
  'sabas.png',
  'urgecon.png',
  'alttavia-1.png',
  'consulado-da-bahia.png',
  'visas.png',
  'bar-espirito-santo.png',
  'prodb.png',
  'viana-consultancy.png',
  'alttavia-3.png',
  'hec.png',
  'serpcraz.png',
  'abruzzi.png',
  'visa.png',
  'catedral-do-chopp.png',
  'anamace.png',
  'tsc-advogados.png',
  'verite.png',
  'pizzaria-speranza.png',
  'senecon.png',
] as const;

function RecentWorkSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section id="trabalhos-recentes" className="relative scroll-mt-24 py-20 lg:py-28">
      <div className="site-container relative mb-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.recentWorkEyebrow}
            </span>
          </div>
          <h2 className="max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.recentWorkTitleParts} />
          </h2>
        </motion.div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="site-edge-pad flex w-max snap-x snap-mandatory gap-4">
          {RECENT_WORK_IMAGES.map((file, i) => (
            <motion.div
              key={file}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
              className="relative aspect-[1837/960] w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--color-line)] sm:w-[340px] lg:w-[400px]"
            >
              <Image
                src={`/portfolio/lps/${file}`}
                alt={copy.recentWorkAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 340px, 260px"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ────────────────────────────────────────────────────

function TestimonialsSection({
  locale,
  copy,
  reduceMotion,
}: {
  locale: LocaleKey;
  copy: HeroCopy;
  reduceMotion: boolean | null;
}) {
  const testimonials = TESTIMONIALS[locale];
  const doubled = [...testimonials, ...testimonials];

  return (
    <section id="avaliacoes" className="relative scroll-mt-24 py-20 lg:py-28">
      <div aria-hidden className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/6 blur-[140px]" />
      <div className="site-container mb-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.testimonialsEyebrow}
          </span>
        </div>
        <h2 className="max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
          <SectionTitle segments={copy.testimonialsTitleParts} />
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <ul className="sr-only">{testimonials.map((t) => <li key={t.name}>&ldquo;{t.quote}&rdquo; {t.name}</li>)}</ul>
        <motion.div
          aria-hidden
          animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="flex w-max gap-5 px-4"
        >
          {doubled.map((testimonial, index) => (
            <article
              key={`${testimonial.name}-${index}`}
              className="flex w-[min(80vw,380px)] shrink-0 flex-col justify-between rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--card-background)] p-6"
            >
              <div>
                <div className="flex gap-1 text-[var(--color-brand)]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-[1.75] text-[var(--foreground)]">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-[var(--color-line)] pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/15 text-[11px] font-black text-[var(--color-brand)]">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--foreground)]">{testimonial.name}</div>
                  <div className="text-xs text-[var(--foreground-subtle)]">{testimonial.role} · {testimonial.company}</div>
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Process Section ─────────────────────────────────────────────────────────

const PROCESS_ICONS = [
  <svg key="briefing" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  <svg key="estrutura" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" /></svg>,
  <svg key="design" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  <svg key="launch" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56-5.84a14.98 14.98 0 00-2.58 5.84m2.56-5.84L9 15" /></svg>,
];

function ProcessSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[var(--color-brand)]/5 blur-[180px]" />
      </div>
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.processEyebrow}
            </span>
          </div>
          <h2 className="max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.processTitleParts} />
          </h2>
          <p className="mt-4 text-base text-[var(--foreground-subtle)]" style={{ fontFamily: 'var(--font-serif)', fontWeight: 100 }}>
            {copy.processSubtitle}
          </p>
        </motion.div>

        {/* Timeline vertical mobile / horizontal desktop */}
        <div className="flex flex-col gap-0 lg:grid lg:grid-cols-4">
          {copy.process.map(([title, text], index) => {
            const isLast = index === copy.process.length - 1;
            return (
              <motion.article
                key={title}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="relative"
              >
                {/* Conector horizontal desktop */}
                {!isLast && (
                  <div aria-hidden className="absolute left-[calc(50%+28px)] top-[26px] hidden h-px lg:block" style={{ right: 0, background: 'linear-gradient(90deg, rgba(31,111,107,0.35), rgba(31,111,107,0.08))' }} />
                )}

                <div className="flex gap-5 border-b border-[var(--color-line)] py-7 lg:flex-col lg:border-b-0 lg:border-r lg:px-8 lg:py-0 lg:first:pl-0 lg:last:border-r-0">
                  {/* Número + ícone */}
                  <div className="flex shrink-0 flex-col items-center gap-2 lg:flex-row lg:items-center">
                    <div
                      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-black"
                      style={{
                        borderColor: isLast ? 'rgba(31,111,107,0.5)' : 'rgba(255,255,255,0.12)',
                        backgroundColor: isLast ? 'rgba(31,111,107,0.12)' : 'rgba(255,255,255,0.04)',
                        color: isLast ? 'var(--color-brand)' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-title)',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {/* Conector vertical mobile */}
                    {!isLast && (
                      <div aria-hidden className="h-full w-px lg:hidden" style={{ background: 'linear-gradient(180deg, rgba(31,111,107,0.3), rgba(31,111,107,0.05))' }} />
                    )}
                  </div>

                  <div className="pt-0.5 lg:mt-6 lg:pt-0">
                    <div className="mb-3">
                      {PROCESS_ICONS[index]}
                    </div>
                    <h3 className="text-base font-black leading-snug text-[var(--foreground)] lg:text-lg">{title}</h3>
                    <p className="mt-2 text-sm leading-[1.7] text-[var(--foreground-muted)]">{text}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FaqItem({ question, answer, index, reduceMotion }: { question: string; answer: string; index: number; reduceMotion: boolean | null }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="border-b border-[var(--color-line)]"
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <h3 className="text-sm font-black leading-snug text-[var(--foreground)] sm:text-base">{question}</h3>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200"
          style={{
            borderColor: open ? 'rgba(31,111,107,0.4)' : 'rgba(255,255,255,0.12)',
            backgroundColor: open ? 'rgba(31,111,107,0.1)' : 'rgba(255,255,255,0.04)',
            color: open ? 'var(--color-brand)' : 'rgba(255,255,255,0.4)',
          }}
          aria-hidden
        >
          <svg className="h-3.5 w-3.5 transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}
      >
        <p className="pb-5 text-sm leading-[1.75] text-[var(--foreground-muted)] lg:text-base">{answer}</p>
      </div>
    </motion.div>
  );
}

function FaqSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-brand)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.faqEyebrow}
            </span>
          </div>
          <h2 className="max-w-2xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            <SectionTitle segments={copy.faqTitleParts} />
          </h2>
        </motion.div>

        <div className="max-w-3xl">
          {copy.faqs.map(([question, answer], index) => (
            <FaqItem
              key={question}
              question={question}
              answer={answer}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA Section ───────────────────────────────────────────────────────

function FinalCtaSection({ copy, reduceMotion, calendlyUrl }: { copy: HeroCopy; reduceMotion: boolean | null; calendlyUrl: string }) {
  return (
    <section id="contato" className="relative scroll-mt-24 py-16 lg:py-24">
      <div className="site-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/[0.05] px-6 py-14 lg:px-16 lg:py-20"
        >
          {/* Grid bg */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(31,111,107,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(31,111,107,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          {/* Center glow */}
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand)]/10 blur-[120px]" />

          {/* Corner brackets (padrão home) */}
          <div aria-hidden className="absolute left-5 top-5 h-5 w-5" style={{ borderTop: '1.5px solid rgba(31,111,107,0.4)', borderLeft: '1.5px solid rgba(31,111,107,0.4)' }} />
          <div aria-hidden className="absolute right-5 top-5 h-5 w-5" style={{ borderTop: '1.5px solid rgba(31,111,107,0.4)', borderRight: '1.5px solid rgba(31,111,107,0.4)' }} />
          <div aria-hidden className="absolute bottom-5 left-5 h-5 w-5" style={{ borderBottom: '1.5px solid rgba(31,111,107,0.4)', borderLeft: '1.5px solid rgba(31,111,107,0.4)' }} />
          <div aria-hidden className="absolute bottom-5 right-5 h-5 w-5" style={{ borderBottom: '1.5px solid rgba(31,111,107,0.4)', borderRight: '1.5px solid rgba(31,111,107,0.4)' }} />

          <div className="relative text-center">
            {/* Eyebrow */}
            <p className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-brand)]/70">
              <span className="h-px w-6 bg-[var(--color-brand)]/40" aria-hidden />
              {copy.finalCtaEyebrow}
              <span className="h-px w-6 bg-[var(--color-brand)]/40" aria-hidden />
            </p>

            <h2 className="mx-auto max-w-3xl text-[2.25rem] font-black leading-[0.98] text-[var(--foreground)] sm:text-[3rem] lg:text-[4rem]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.finalCtaTitle}
            </h2>

            {/* Texto com custo de oportunidade */}
            <p className="mx-auto mt-6 max-w-lg text-sm leading-[1.75] text-[var(--foreground-muted)] lg:text-base">
              {copy.finalCtaText}
            </p>

            {/* Hairline divisor */}
            <div className="mx-auto mt-8 h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(31,111,107,0.4), transparent)' }} aria-hidden />

            {/* CTA */}
            <div className="mt-8 flex justify-center">
              <a
                href={LINKS.whatsappHero}
                target="_blank"
                rel="noopener noreferrer"
                onClick={reportContatoWhatsappConversion}
                className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-10 text-base font-black text-[var(--color-accent-ink)] transition-all duration-300 hover:bg-[var(--color-accent-dark)] hover:shadow-[0_0_48px_rgba(31,111,107,0.4)] active:scale-[0.97] sm:w-auto"
              >
                {copy.finalCtaBuyLabel}
              </a>
            </div>

            {/* PS — aviso final (passo 12 da carta de vendas) */}
            <p
              className="mx-auto mt-10 max-w-md text-sm leading-[1.8] text-[var(--foreground-muted)]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}
            >
              P.S. {copy.finalCtaPs}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
