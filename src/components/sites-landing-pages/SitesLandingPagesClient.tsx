'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { reportContatoWhatsappConversion } from '@/lib/analytics/google-ads';

type LocaleKey = 'pt' | 'en';
type SitesLandingPagesClientProps = {
  locale: string;
};

export const LINKS = {
  whatsapp: 'https://wa.me/5519978055531',
  calendly: 'https://calendly.com/guilherme-blackelephant/30min',
  landingCheckout: 'https://buy.stripe.com/test_7sYfZh5ZJ0Hn4TacuoenS01',
  contactWebhook: 'https://black-elephant.app.n8n.cloud/webhook/blackelephant-contact-form',
} as const;

function getLocale(locale: string): LocaleKey {
  return locale === 'pt' ? 'pt' : 'en';
}

const COPY = {
  pt: {
    eyebrow: 'Venda mais',
    heroTitle: 'Sua página não está convertendo acessos em dinheiro?',
    heroText: 'Ter uma Landing Page de alta conversão é fundamental para melhorar a saúde do seu negócio.',
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
    problemTitle: 'Você não está perdendo vendas por causa do anúncio.',
    problemText: 'Você ajustou o criativo. Testou audiência. Otimizou o orçamento. O anúncio está performando.\n\nMas a conversão não sai.\n\nNa maioria dos casos, o problema não é o tráfego. É a página. Lenta no celular. Com texto genérico. Com um CTA escondido. Sem mensagem alinhada ao anúncio.\n\nE enquanto isso, cada clique continua custando.',
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
    whyTitle: 'Desenvolvemos páginas como se fôssemos gestores de tráfego. Não como designers.',
    whyText: 'A diferença entre uma landing page bonita e uma que converte é que a segunda foi construída pensando no clique que chegou nela.\n\nNão fazemos sites. Fazemos páginas que fecham o que o anúncio abre.',
    testimonialsTitle: 'O antes e o depois de quem trocou a página',
    processTitle: 'Da conversa ao ar em 48h.',
    processSubtitle: 'Simples para você. Sem reuniões intermináveis. Sem atraso.',
    process: [
      ['Você conta, a gente entende', 'Você responde um briefing direto sobre a oferta, o público e o objetivo. Sem reuniões longas. Em menos de 1 hora você já entregou tudo o que precisamos.'],
      ['Copy e estrutura no mesmo dia', 'Montamos a estrutura da página: copy estratégica, seções em ordem de conversão e CTAs nos lugares certos. Você aprova antes de entrar no design.'],
      ['Uma rodada de revisão, não dez', 'Fazemos a página responsiva, rápida no mobile e com identidade visual alinhada à sua marca. Sem surpresas no resultado.'],
      ['Lançamento em 48h', 'A página vai ao ar com tracking configurado, URL definida e pronta para receber campanha. A maioria das entregas acontece antes das 48h.'],
    ],
    formTitle: 'Ainda tem dúvidas? Conta para a gente.',
    formText: 'Sem compromisso. Entendemos a sua situação e mostramos se faz sentido.',
    formNamePlaceholder: 'Seu nome',
    formEmailPlaceholder: 'Seu melhor e-mail',
    formPhonePlaceholder: 'WhatsApp (opcional)',
    formSubmitLabel: 'Quero tirar minhas dúvidas',
    formSubmitting: 'Enviando...',
    formErrorMessage: 'Algo deu errado. Tente de novo ou nos chame no WhatsApp.',
    faqTitle: 'As perguntas que aparecem toda vez, respondidas com honestidade.',
    faqs: [
      ['Em quanto tempo a página fica pronta?', 'Em até 48 horas após a aprovação do briefing. Na prática, a maioria das entregas acontece em 36 a 40 horas. Você recebe a URL com a página no ar, pronta para receber tráfego.'],
      ['Qual é a garantia?', '15 dias de garantia total. Se a entrega não atendeu o briefing ou você simplesmente não gostou, você escolhe: refazemos do zero ou devolvemos o valor integralmente. Sem processo, sem argumentação. A responsabilidade é nossa.'],
      ['Já contratei agência antes e me decepcionei. Por que seria diferente?', 'Porque a maioria das agências faz sites. A gente faz páginas para campanhas de tráfego. Quem vai lidar com a sua entrega entende de copy, de CTA e de como o tráfego chega na página. Não é designer generalista. É especialista em conversão. E se não gostar, você tem 15 dias para pedir o dinheiro de volta. Sem argumentação.'],
      ['Posso comprar direto?', 'Sim, e é o caminho mais rápido. Após a compra, enviamos o briefing e começamos em até 2 horas. Se preferir falar antes, tem WhatsApp e call disponíveis.'],
      ['O que preciso enviar?', 'Oferta, público-alvo, identidade visual (se tiver) e os canais de CTA (WhatsApp, formulário, link de checkout). Não precisa ter tudo pronto. A gente ajuda a organizar no briefing.'],
      ['Funciona no celular?', 'Sim. A página é mobile-first, construída primeiro para o celular e depois para desktop. Porque é onde mais de 80% dos cliques de tráfego pago chegam.'],
      ['Vocês garantem que a landing vai converter?', 'Não garantimos conversão. Isso dependeria da sua oferta, do seu tráfego e do seu preço. Nenhuma agência séria garante isso. O que garantimos é a entrega: uma página construída com as melhores práticas de conversão. Se não atender, devolvemos o valor. O que está no nosso controle, está garantido.'],
    ],
    finalCtaEyebrow: 'Última chamada',
    finalCtaTitle: 'Cada dia com a página errada é mais dinheiro gasto em tráfego que não converte.',
    finalCtaText: 'Se você continuar com a página que tem agora, o resultado vai ser o mesmo. O anúncio vai continuar pagando cliques que a página não fecha.',
    finalCtaPs: 'A entrega é em até 48h após o briefing. A garantia é de 15 dias. Se não atender, devolvemos tudo. A única coisa que você arrisca é continuar com a página que já tem.',
    finalCtaBuyLabel: 'Quero minha landing page agora',
    finalCtaWhatsappLabel: 'Falar no WhatsApp antes',
  },
  en: {
    eyebrow: 'For those who invest in paid traffic',
    heroTitle: 'Low CPC, but poor conversions?\nThe problem is your page.',
    heroText: 'Sell more with a brand-new Landing Page ready in up to 48 hours with strategic copy and high-converting design.',
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
    problemTitle: 'You are not losing sales because of the ad.',
    problemText: 'You adjusted the creative. Tested audiences. Optimized the budget. The ad is performing.\n\nBut conversions are not coming.\n\nIn most cases, the problem is not the traffic. It is the page. Slow on mobile. Generic text. Hidden CTA. No message match.\n\nMeanwhile, every click keeps costing money.',
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
    whyTitle: 'We build pages like traffic managers. Not like designers.',
    whyText: 'The difference between a beautiful landing page and one that converts is that the second was built thinking about the click that arrived on it.\n\nWe do not make websites. We make pages that close what the ad opens.',
    testimonialsTitle: 'The before and after of those who switched the page',
    processTitle: 'From conversation to live in 48h.',
    processSubtitle: 'Simple for you. No endless meetings. No delays.',
    process: [
      ['You tell us, we understand', 'You fill out a direct briefing about the offer, audience, and objective. No long meetings. In under 1 hour you have delivered everything we need.'],
      ['Copy and structure, same day', 'We build the page structure: strategic copy, sections in conversion order, and CTAs in the right places. You approve before we enter design.'],
      ['One revision round, not ten', 'We make the page responsive, fast on mobile, and with your brand identity. No surprises in the result.'],
      ['Launch in 48h', 'The page goes live with tracking configured, URL defined, and ready to receive campaigns. Most deliveries happen before the 48h mark.'],
    ],
    formTitle: 'Still have questions? Tell us.',
    formText: 'No commitment. We understand your situation and show you if it makes sense.',
    formNamePlaceholder: 'Your name',
    formEmailPlaceholder: 'Your best email',
    formPhonePlaceholder: 'WhatsApp (optional)',
    formSubmitLabel: 'Get in touch',
    formSubmitting: 'Sending...',
    formErrorMessage: 'Something went wrong. Try again or reach us on WhatsApp.',
    faqTitle: 'The questions that always come up, answered honestly.',
    faqs: [
      ['How fast is the delivery?', 'Within 48 hours after briefing approval. In practice, most deliveries happen in 36 to 40 hours. You receive the URL with the page live, ready to receive traffic.'],
      ['What is the guarantee?', '15-day total guarantee. If the delivery did not meet the briefing or you simply did not like it, you choose: we redo it from scratch or refund the full amount. No process, no arguing. The responsibility is ours.'],
      ['I hired an agency before and was disappointed. Why would this be different?', 'Because most agencies build websites. We build pages for traffic campaigns. Whoever handles your delivery understands copy, CTA, and how traffic arrives on the page. Not a generalist designer. A conversion specialist. And if you do not like it, you have 15 days to ask for your money back. No arguing.'],
      ['Can I buy directly?', 'Yes, and it is the fastest path. After the purchase, we send the briefing and start within 2 hours. If you prefer to talk first, WhatsApp and call are available.'],
      ['What do I need to send?', 'Offer, target audience, visual identity (if you have it), and the CTA channels (WhatsApp, form, checkout link). Does not need to be all ready. We help organize during the briefing.'],
      ['Does it work on mobile?', 'Yes. The page is mobile-first, built for mobile first and then desktop. Because that is where more than 80% of paid traffic clicks arrive.'],
      ['Do you guarantee the landing will convert?', 'We do not guarantee conversions. That would depend on your offer, your traffic, and your price. No serious agency guarantees that. What we guarantee is the delivery: a page built with the best conversion practices. If it does not meet expectations, we refund. What is within our control is guaranteed.'],
    ],
    finalCtaEyebrow: 'Last call',
    finalCtaTitle: 'Every day with the wrong page is more money spent on traffic that does not convert.',
    finalCtaText: 'If you keep the page you have now, the result will be the same. The ad will keep paying for clicks that the page does not close.',
    finalCtaPs: 'Delivery is within 48h after the briefing. The guarantee is 15 days. If it does not meet expectations, we refund everything. The only thing you risk is keeping the page you already have.',
    finalCtaBuyLabel: 'I want my landing page now',
    finalCtaWhatsappLabel: 'Talk on WhatsApp first',
  },
} as const;

type HeroCopy = (typeof COPY)[LocaleKey];

const TESTIMONIALS = {
  pt: [
    {
      quote: 'Estávamos gastando R$3.000 por mês em tráfego e conseguindo 8 agendamentos. Trocamos a página e no primeiro mês foram 31. O anúncio era o mesmo. A página era o problema.',
      name: 'Mariana Souza',
      role: 'CEO',
      company: 'Clínica Lumina',
      initials: 'MS',
    },
    {
      quote: 'Tínhamos uma página feita por um freelancer que levou 3 semanas e não convertia nada. A BlackElephant refez em 48h. No primeiro mês de campanha tivemos 47 leads com o mesmo orçamento.',
      name: 'Ricardo Alves',
      role: 'Diretor Comercial',
      company: 'Construtora RAE',
      initials: 'RA',
    },
    {
      quote: 'Fui com o pé atrás por ter tido experiência ruim antes. Eles entregaram em 38h, o processo foi simples, o design ficou premium e o resultado apareceu na campanha da semana seguinte. Vale muito mais do que o R$1.997 cobrado.',
      name: 'Fernanda Costa',
      role: 'Fundadora',
      company: 'Escola Connect',
      initials: 'FC',
    },
  ],
  en: [
    {
      quote: 'We were spending $3,000 per month on traffic and getting 8 bookings. We switched the page and the first month brought 31. Same ad. The page was the problem.',
      name: 'Mariana Souza',
      role: 'CEO',
      company: 'Lumina Clinic',
      initials: 'MS',
    },
    {
      quote: 'We had a page made by a freelancer that took 3 weeks and converted nothing. BlackElephant rebuilt it in 48h. First month of campaigns brought 47 leads with the same budget.',
      name: 'Ricardo Alves',
      role: 'Sales Director',
      company: 'RAE Construction',
      initials: 'RA',
    },
    {
      quote: 'I went in skeptical after bad experiences before. They delivered in 38h, the process was simple, the design was premium, and results showed up in the very next campaign. Worth much more than the $1,997 charged.',
      name: 'Fernanda Costa',
      role: 'Founder',
      company: 'Connect School',
      initials: 'FC',
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
      <HeroSection copy={copy} reduceMotion={reduceMotion} />
      <ProblemSection copy={copy} reduceMotion={reduceMotion} />
      <OfferSection copy={copy} reduceMotion={reduceMotion} calendlyUrl={calendlyUrl} />
      <WhySection copy={copy} reduceMotion={reduceMotion} />
      <BenefitsSection copy={copy} reduceMotion={reduceMotion} />
      <TestimonialsSection locale={activeLocale} copy={copy} reduceMotion={reduceMotion} />
      <ProcessSection copy={copy} reduceMotion={reduceMotion} />
      <ContactSection copy={copy} reduceMotion={reduceMotion} calendlyUrl={calendlyUrl} />
      <FaqSection copy={copy} reduceMotion={reduceMotion} />
      <FinalCtaSection copy={copy} reduceMotion={reduceMotion} />
    </div>
  );
}

// ─── Before/After Slider ────────────────────────────────────────────────────

function BeforeAfterSlider({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.max(4, Math.min(96, v));

  useEffect(() => {
    if (reduceMotion) { setPosition(50); return; }
    let rafId: number;
    let startTime: number | null = null;
    const duration = 1400;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setPosition(Math.max(4, Math.min(96, eased * 50)));
      if (progress < 1) { rafId = requestAnimationFrame(step); }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [reduceMotion]);

  const updatePosition = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  };

  return (
    <motion.div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-[4/3] cursor-col-resize select-none overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50 lg:aspect-auto lg:min-h-[460px]"
      onMouseDown={(e) => { dragging.current = true; updatePosition(e.clientX); }}
      onMouseMove={(e) => { if (dragging.current) updatePosition(e.clientX); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchStart={(e) => updatePosition(e.touches[0].clientX)}
      onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
    >
      <Image src="/images/site-new.png" alt="Depois" fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" priority draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image src="/images/site-past.png" alt="Antes" fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" draggable={false} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-20 flex w-10 -translate-x-1/2 flex-col items-center" style={{ left: `${position}%` }}>
        <div className="w-0.5 flex-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
        <div className="w-0.5 flex-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
      </div>
      <div className="pointer-events-none absolute left-3 top-3 z-30">
        <span className="rounded-lg bg-black/65 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white/90 backdrop-blur-sm">Antes</span>
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-30">
        <span className="rounded-lg bg-[var(--color-lime)] px-2.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-black">Depois</span>
      </div>
    </motion.div>
  );
}

// ─── Hero Marquee ────────────────────────────────────────────────────────────

function HeroMarquee({ items, reduceMotion }: { items: readonly string[]; reduceMotion: boolean | null }) {
  return (
    <div className="relative overflow-hidden bg-[var(--color-lime)]" role="marquee" aria-label="Destaques">
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
                <span className="whitespace-nowrap px-5 text-[11px] font-black uppercase tracking-[0.22em] text-black">{item}</span>
                <span className="text-[8px] text-black/40">◆</span>
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
        <div className="h-px w-6 bg-[var(--color-lime)]/35" aria-hidden />
        <span className="text-xl font-black text-white/80" aria-label={`${count}+ ${copy.heroCounter}`}>
          {count}<span className="text-[var(--color-lime)]">+</span>
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-white/42">{copy.heroCounter}</span>
        <span className="text-xs font-semibold text-[var(--color-lime)]/50">{copy.heroAvgDelivery}</span>
      </div>
    </div>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  const handleScrollToOffer = () => {
    document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-10 h-[500px] w-[500px] rounded-full opacity-[0.07] blur-[160px]" style={{ backgroundColor: 'var(--color-lime)' }} />
        <div className="absolute -left-20 bottom-0 h-[380px] w-[380px] rounded-full bg-fuchsia-500/8 blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.028]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
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
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-[var(--color-lime)]/20 bg-[var(--color-lime)]/[0.05] px-3.5 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
                {!reduceMotion && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-lime)]/40" style={{ animationDuration: '2s' }} />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
              </span>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-lime)]/75">
                {copy.eyebrow}
              </p>
            </div>

            {/* Título — última linha em lime */}
            <h1
              className="text-[1.875rem] font-black leading-[1.08] sm:text-[2.75rem] lg:text-[3.75rem]"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {copy.heroTitle.split('\n').map((line, i, arr) => (
                <span key={i} className={`block ${i === arr.length - 1 ? 'text-[var(--color-lime)]' : ''}`}>
                  {line}
                </span>
              ))}
            </h1>

            {/* Slider mobile */}
            <div className="lg:hidden">
              <BeforeAfterSlider reduceMotion={reduceMotion} />
            </div>

            {/* Subtexto */}
            <p className="max-w-md text-sm leading-[1.7] text-white/56 sm:text-base">
              {copy.heroText}
            </p>

            {/* CTAs + contador */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleScrollToOffer}
                  className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-[var(--color-lime)] px-8 text-sm font-black text-black transition-all duration-300 hover:bg-[var(--color-lime-light)] hover:shadow-[0_0_36px_rgba(57,255,20,0.28)] active:scale-[0.97] sm:w-auto sm:text-base"
                >
                  {copy.heroCtaLabel}
                </button>
                <a
                  href={LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={reportContatoWhatsappConversion}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-8 text-sm font-black text-white transition-all duration-300 hover:border-white/30 active:scale-[0.97] sm:w-auto sm:text-base"
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
        <div className="absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[var(--color-lime)]/6 blur-[120px]" />
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
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]" style={{ fontFamily: 'var(--font-title)' }}>
              O problema real
            </span>
          </div>

          <h2 className="text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.problemTitle}
          </h2>

          {/* Multi-parágrafo com agitação */}
          <div className="mt-6 space-y-4">
            {copy.problemText.split('\n\n').map((para, i) => (
              <p key={i} className="text-base leading-[1.75] text-white/58 lg:text-lg">{para}</p>
            ))}
          </div>
        </motion.div>

        {/* Cards Antes / Depois */}
        <div className="grid gap-3 sm:grid-cols-2">
          {copy.outcomes.map(([before, after], index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.42, delay: index * 0.06 }}
              className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]"
            >
              {/* Antes */}
              <div className="flex items-start gap-3 border-b border-white/6 px-5 py-4">
                <span className="mt-0.5 shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-red-400/70">Antes</span>
                <p className="text-sm leading-snug text-white/45">{before}</p>
              </div>
              {/* Depois */}
              <div className="flex items-start gap-3 px-5 py-4">
                <span className="mt-0.5 shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-lime)]/80">Depois</span>
                <p className="text-sm font-semibold leading-snug text-white">{after}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Offer Section ───────────────────────────────────────────────────────────

function OfferSection({ copy, reduceMotion, calendlyUrl }: { copy: HeroCopy; reduceMotion: boolean | null; calendlyUrl: string }) {
  return (
    <section id="oferta" className="relative py-20 lg:py-28">
      <div aria-hidden className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-lime)]/8 blur-[120px]" />
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 max-w-3xl lg:mb-14"
        >
          <h2 className="text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.productsTitle}
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-white/64">{copy.productsText}</p>
        </motion.div>

        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl rounded-[1.75rem] border border-[var(--color-lime)]/35 bg-[var(--color-lime)]/[0.07] p-6 lg:p-10"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">{copy.landingName}</h3>
              <p className="mt-3 max-w-lg text-sm leading-[1.7] text-white/62">{copy.landingDescription}</p>
            </div>
            <div className="shrink-0 text-4xl font-black text-[var(--color-lime)]">{copy.landingPrice}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime)]/10 px-3.5 py-2 text-xs font-bold text-[var(--color-lime)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
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
              <div key={i} className="flex items-start gap-3 text-sm font-semibold text-white/76">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-lime)]" />
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
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-lime)] px-8 text-sm font-bold text-black transition-all duration-300 active:scale-95 hover:bg-[var(--color-lime-light)]"
            >
              {copy.buyLanding}
            </a>
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={reportContatoWhatsappConversion}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-6 text-sm font-bold text-white transition-all duration-300 active:scale-95 hover:border-white/30"
            >
              {copy.whatsapp}
            </a>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-6 text-sm font-bold text-white transition-all duration-300 active:scale-95 hover:border-white/30"
            >
              {copy.calendly}
            </a>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

// ─── Why Section (nova — quebra de desconfiança) ──────────────────────────────

function WhySection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[var(--color-lime)]/5 blur-[140px]" />
      </div>

      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 lg:grid-cols-12 lg:gap-16"
        >
          {/* Coluna título */}
          <div className="lg:col-span-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8" style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]" style={{ fontFamily: 'var(--font-title)' }}>
                Nossa diferença
              </span>
            </div>

            <h2
              className="text-[2.25rem] font-black leading-[1.02] text-white lg:text-[3.25rem]"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              {/* Mix tipográfico inspirado na home: bold + thin italic */}
              {copy.whyTitle.split('. ').map((sentence, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? (
                    <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'normal', fontWeight: 100, color: 'var(--color-lime)' }}>
                      {sentence}
                    </em>
                  ) : (
                    <>{sentence}. </>
                  )}
                </span>
              ))}
            </h2>
          </div>

          {/* Coluna texto */}
          <div className="lg:col-span-6 lg:pt-2">
            {/* Hairline decorativo */}
            <div className="mb-6 h-px w-16" style={{ background: 'linear-gradient(90deg, var(--color-lime) 0%, transparent 100%)' }} aria-hidden />

            <div className="space-y-5">
              {copy.whyText.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className="text-[1.05rem] leading-[1.65]"
                  style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-primary)' }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Benefits Section ────────────────────────────────────────────────────────

function BenefitsSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-lime)]/8 blur-[130px]" />
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]" style={{ fontFamily: 'var(--font-title)' }}>
              O que você recebe
            </span>
          </div>
          <h2 className="text-[2.25rem] font-black leading-[1.02] text-white lg:text-[3.5rem]" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.benefitsTitle}
          </h2>
          <p className="mt-4 text-base leading-[1.7] text-white/52 lg:text-lg">{copy.benefitsSubtitle}</p>
        </motion.div>

        {/* Grade editorial com índice + hairline + título + descrição (padrão StatsSection home) */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {copy.benefits.map(([title, description], index) => (
            <motion.article
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.42, delay: index * 0.05 }}
              className={`group relative py-8 px-6 lg:px-8 transition-colors hover:bg-white/[0.02] ${
                index < 3 ? 'border-b border-white/7' : ''
              } ${
                index % 3 !== 2 ? 'lg:border-r lg:border-white/7' : ''
              } ${
                index % 2 === 0 ? 'sm:border-r sm:border-white/7 lg:border-r-0' : 'sm:border-r-0'
              } ${
                index % 3 !== 2 ? 'lg:border-r lg:border-white/7' : ''
              }`}
            >
              {/* Hairline topo com lime no primeiro (padrão StatsSection) */}
              <div
                aria-hidden
                className="absolute left-6 top-0 h-px w-10 lg:left-8"
                style={{ backgroundColor: index === 0 ? 'var(--color-lime)' : 'rgba(255,255,255,0.15)' }}
              />

              {/* Índice editorial */}
              <div
                className="mb-5 text-[11px] font-bold tabular-nums tracking-[0.22em]"
                style={{ fontFamily: 'var(--font-title)', color: index === 0 ? 'var(--color-lime)' : 'rgba(255,255,255,0.3)' }}
              >
                /{String(index + 1).padStart(2, '0')}
              </div>

              <h3 className="text-base font-black leading-snug text-white lg:text-lg">{title}</h3>
              <p className="mt-3 text-sm leading-[1.7] text-white/52">{description}</p>
            </motion.article>
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
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/6 blur-[140px]" />
      <div className="site-container mb-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]" style={{ fontFamily: 'var(--font-title)' }}>
            Quem contratou
          </span>
        </div>
        <h2 className="max-w-3xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
          {copy.testimonialsTitle}
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <ul className="sr-only">{testimonials.map((t) => <li key={t.name}>&ldquo;{t.quote}&rdquo; {t.name}</li>)}</ul>
        <motion.div
          aria-hidden
          animate={reduceMotion ? undefined : { x: ['-50%', '0%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="flex w-max gap-5 px-4"
        >
          {doubled.map((testimonial, index) => (
            <article
              key={`${testimonial.name}-${index}`}
              className="flex w-[min(80vw,380px)] shrink-0 flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <div>
                <div className="flex gap-1 text-[var(--color-lime)]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-[1.75] text-white/78">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime)]/15 text-[11px] font-black text-[var(--color-lime)]">
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{testimonial.name}</div>
                  <div className="text-xs text-white/45">{testimonial.role} · {testimonial.company}</div>
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
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]" style={{ fontFamily: 'var(--font-title)' }}>
              Como funciona
            </span>
          </div>

          <h2 className="max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.processTitle}
          </h2>

          {/* Subtítulo com hairline */}
          <div className="mt-5 flex items-center gap-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, var(--color-lime) 0%, transparent 100%)' }} aria-hidden />
            <p
              className="text-base leading-[1.6]"
              style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-serif)', fontWeight: 100 }}
            >
              {copy.processSubtitle}
            </p>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-0 md:grid-cols-2 lg:grid-cols-4">
          {copy.process.map(([title, text], index) => {
            const isLast = index === copy.process.length - 1;
            return (
              <motion.article
                key={title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.42, delay: index * 0.07 }}
                className="relative flex flex-col gap-5 border-b border-white/8 px-0 py-8 first:pt-0 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-0 md:first:pl-0 md:last:border-r-0 lg:px-8"
              >
                {/* Hairline topo com índice (editorial) */}
                <div
                  aria-hidden
                  className="absolute left-0 top-0 h-px w-10 md:left-8 md:first:left-0"
                  style={{ backgroundColor: index === 0 ? 'var(--color-lime)' : 'rgba(255,255,255,0.15)' }}
                />

                {!isLast && (
                  <div aria-hidden className="absolute -right-px top-6 hidden h-2 w-2 translate-x-1/2 rounded-full bg-[var(--color-lime)]/40 ring-4 ring-[var(--background)] md:block" />
                )}

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${isLast ? 'border-[var(--color-lime)]/50 bg-[var(--color-lime)]/12 text-[var(--color-lime)]' : 'border-white/12 bg-white/[0.04] text-white/70'}`}>
                  {PROCESS_ICONS[index]}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-[1.7] text-white/55">{text}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────

function ContactSection({ copy, reduceMotion, calendlyUrl }: { copy: HeroCopy; reduceMotion: boolean | null; calendlyUrl: string }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (hasError) setHasError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHasError(false);

    try {
      const response = await fetch(LINKS.contactWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, origem: 'landing-page-alta-conversao' }),
      });

      if (response.ok) {
        router.push('/venda-mais-com-uma-landing-page-de-alta-conversao/obrigado');
      } else {
        setHasError(true);
        setIsSubmitting(false);
      }
    } catch {
      setHasError(true);
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-[var(--color-lime)]/40 focus:bg-white/[0.07] focus:ring-1 focus:ring-[var(--color-lime)]/20';

  return (
    <section className="relative py-20 lg:py-28">
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[var(--color-lime)]/15 to-transparent" />
      <div className="site-container relative">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-lg"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.formTitle}
            </h2>
            <p className="mt-4 text-sm text-white/52 lg:text-base">{copy.formText}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            <input
              type="text"
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              placeholder={copy.formNamePlaceholder}
              className={inputClass}
              autoComplete="name"
            />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder={copy.formEmailPlaceholder}
              className={inputClass}
              autoComplete="email"
            />
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder={copy.formPhonePlaceholder}
              className={inputClass}
              autoComplete="tel"
            />

            {hasError && (
              <p className="text-xs text-red-400/80">{copy.formErrorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.nome || !formData.email}
              className="mt-1 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[var(--color-lime)] px-8 text-sm font-black text-black transition-all duration-300 hover:shadow-[0_0_36px_rgba(57,255,20,0.28)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? copy.formSubmitting : copy.formSubmitLabel}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-xs text-white/25">ou</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={reportContatoWhatsappConversion}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-bold text-white/70 transition-all duration-300 hover:border-white/25 hover:text-white active:scale-[0.97]"
            >
              {copy.whatsapp}
            </a>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 text-sm font-bold text-white/70 transition-all duration-300 hover:border-white/25 hover:text-white active:scale-[0.97]"
            >
              {copy.calendly}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────

function FaqSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="site-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-lime)]" style={{ fontFamily: 'var(--font-title)' }}>
              FAQ
            </span>
          </div>
          <h2 className="max-w-2xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-title)' }}>
            {copy.faqTitle}
          </h2>
        </motion.div>

        <div className="divide-y divide-white/8">
          {copy.faqs.map(([question, answer], index) => (
            <motion.div
              key={question}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, delay: index * 0.04 }}
              className="grid gap-2 py-6 lg:grid-cols-[1fr_1.4fr] lg:gap-12"
            >
              <h3 className="text-base font-black leading-snug text-white lg:text-lg">{question}</h3>
              <p className="text-sm leading-[1.75] text-white/55 lg:text-base">{answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA Section ───────────────────────────────────────────────────────

function FinalCtaSection({ copy, reduceMotion }: { copy: HeroCopy; reduceMotion: boolean | null }) {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="site-container">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-[var(--color-lime)]/20 bg-[var(--color-lime)]/[0.05] px-6 py-14 lg:px-16 lg:py-20"
        >
          {/* Grid bg */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(57,255,20,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          {/* Center glow */}
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-lime)]/10 blur-[120px]" />

          {/* Corner brackets (padrão home) */}
          <div aria-hidden className="absolute left-5 top-5 h-5 w-5" style={{ borderTop: '1.5px solid rgba(57,255,20,0.4)', borderLeft: '1.5px solid rgba(57,255,20,0.4)' }} />
          <div aria-hidden className="absolute right-5 top-5 h-5 w-5" style={{ borderTop: '1.5px solid rgba(57,255,20,0.4)', borderRight: '1.5px solid rgba(57,255,20,0.4)' }} />
          <div aria-hidden className="absolute bottom-5 left-5 h-5 w-5" style={{ borderBottom: '1.5px solid rgba(57,255,20,0.4)', borderLeft: '1.5px solid rgba(57,255,20,0.4)' }} />
          <div aria-hidden className="absolute bottom-5 right-5 h-5 w-5" style={{ borderBottom: '1.5px solid rgba(57,255,20,0.4)', borderRight: '1.5px solid rgba(57,255,20,0.4)' }} />

          <div className="relative text-center">
            {/* Eyebrow */}
            <p className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--color-lime)]/70">
              <span className="h-px w-6 bg-[var(--color-lime)]/40" aria-hidden />
              {copy.finalCtaEyebrow}
              <span className="h-px w-6 bg-[var(--color-lime)]/40" aria-hidden />
            </p>

            <h2 className="mx-auto max-w-3xl text-[2.25rem] font-black leading-[0.98] text-white sm:text-[3rem] lg:text-[4rem]" style={{ fontFamily: 'var(--font-title)' }}>
              {copy.finalCtaTitle}
            </h2>

            {/* Texto com custo de oportunidade */}
            <p className="mx-auto mt-6 max-w-lg text-sm leading-[1.75] text-white/52 lg:text-base">
              {copy.finalCtaText}
            </p>

            {/* Hairline divisor */}
            <div className="mx-auto mt-8 h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.4), transparent)' }} aria-hidden />

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={LINKS.landingCheckout}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[var(--color-lime)] px-10 text-base font-black text-black transition-all duration-300 hover:bg-[var(--color-lime-light)] hover:shadow-[0_0_48px_rgba(57,255,20,0.4)] active:scale-[0.97] sm:w-auto"
              >
                {copy.finalCtaBuyLabel}
              </a>
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={reportContatoWhatsappConversion}
                className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-10 text-base font-black text-white transition-all duration-300 hover:border-white/30 active:scale-[0.97] sm:w-auto"
              >
                {copy.finalCtaWhatsappLabel}
              </a>
            </div>

            {/* PS — aviso final (passo 12 da carta de vendas) */}
            <p
              className="mx-auto mt-10 max-w-md text-xs leading-[1.8] text-white/32"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 100 }}
            >
              P.S. {copy.finalCtaPs}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
