'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useSpring } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useLottieScroll } from '@/hooks/useLottieScroll';

type Scene = {
  id: string;
  range: [number, number];
  tag: string | null;
  metric: string | null;
  metricLabel: string | null;
  title: string;
  description: string;
};

const SCENES: Scene[] = [
  {
    id: 'hero',
    range: [0, 0.25],
    tag: null,
    metric: null,
    metricLabel: null,
    title: '',
    description: '',
  },
  {
    id: 'transport',
    range: [0.25, 0.5],
    tag: 'Case 01 — Transportadora',
    metric: '~R$100k',
    metricLabel: 'economizados por ano',
    title: 'Automações que geram economia real.',
    description:
      'Sistema de gestão operacional que eliminou desperdícios invisíveis e transformou a operação de uma transportadora regional.',
  },
  {
    id: 'services',
    range: [0.5, 0.75],
    tag: 'Case 02 — Empresa de Serviços',
    metric: '30 dias',
    metricLabel: 'do zero ao deploy',
    title: 'Sistema + 2 apps. Em 1 mês.',
    description:
      'Plataforma de gestão completa e dois aplicativos mobile entregues em trinta dias. Do briefing aos apps nas lojas.',
  },
  {
    id: 'bank',
    range: [0.75, 1.01],
    tag: 'Case 03 — Banco Regional',
    metric: '−90%',
    metricLabel: 'em erros operacionais',
    title: 'Precisão onde não há espaço para falhas.',
    description:
      'Plataforma bancária que substituiu processos manuais críticos e praticamente zerou os erros humanos na operação.',
  },
];

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const easeIn = [0.4, 0, 1, 1] as [number, number, number, number];

const cardVariants = {
  enter: (dir: number) => ({
    y: dir > 0 ? 80 : -80,
    scale: 0.88,
    opacity: 0,
  }),
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.65, ease: easeOut },
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -52 : 52,
    scale: 0.93,
    opacity: 0,
    transition: { duration: 0.38, ease: easeIn },
  }),
};

function getSceneIndex(progress: number): number {
  for (let i = 0; i < SCENES.length - 1; i++) {
    if (progress < SCENES[i + 1].range[0]) return i;
  }
  return SCENES.length - 1;
}

export function ScrollytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const prevProgressRef = useRef(0);
  const activeIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.45,
    restDelta: 0.001,
  });

  useLottieScroll(
    lottieContainerRef,
    containerRef,
    '/videos/elephant-transform.json',
  );

  // Wheel-based scene snap — sem double-snap, sem pulo de cena
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isTransitioning = false;
    let transitionTimer: ReturnType<typeof setTimeout>;
    let touchStartY = 0;

    const snapToScene = (idx: number) => {
      const target = SCENES[idx].range[0];
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      const scrollable = container.offsetHeight - window.innerHeight;
      const targetY = containerTop + target * scrollable;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      isTransitioning = true;
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => { isTransitioning = false; }, 950);
    };

    const isStickyActive = () => {
      const rect = container.getBoundingClientRect();
      return rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isStickyActive()) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const currentIdx = activeIndexRef.current;
      const nextIdx = currentIdx + dir;

      // Permite sair pelo topo livremente
      if (nextIdx < 0) return;

      // Ao sair pelo fim: salta para o final do container e libera o scroll
      if (nextIdx >= SCENES.length) {
        e.preventDefault();
        if (isTransitioning) return;
        const containerTop = container.getBoundingClientRect().top + window.scrollY;
        const scrollable = container.offsetHeight - window.innerHeight;
        window.scrollTo({ top: containerTop + scrollable + 4, behavior: 'smooth' });
        isTransitioning = true;
        clearTimeout(transitionTimer);
        transitionTimer = setTimeout(() => { isTransitioning = false; }, 950);
        return;
      }

      e.preventDefault();
      if (isTransitioning) return;
      snapToScene(nextIdx);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isStickyActive()) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;
      const dir = delta > 0 ? 1 : -1;
      const currentIdx = activeIndexRef.current;
      const nextIdx = Math.max(0, Math.min(SCENES.length - 1, currentIdx + dir));
      if (nextIdx === currentIdx || isTransitioning) return;
      snapToScene(nextIdx);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(transitionTimer);
    };
  }, []);

  useMotionValueEvent(smoothedProgress, 'change', (latest) => {
    const dir = latest >= prevProgressRef.current ? 1 : -1;
    prevProgressRef.current = latest;

    const next = getSceneIndex(latest);
    if (next !== activeIndexRef.current) {
      activeIndexRef.current = next;
      setActiveIndex(next);
      setDirection(dir);
    }
  });

  const scene = SCENES[activeIndex];

  return (
    <div ref={containerRef} className="relative" style={{ height: '600vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Lottie background */}
        <div
          ref={lottieContainerRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

        {/* Desktop card */}
        <div className="absolute inset-0 hidden lg:flex items-center pt-20">
          <div className="pl-14 xl:pl-24 w-full max-w-[600px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <SceneCard scene={scene} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile card */}
        <div className="lg:hidden absolute inset-x-0 bottom-0 px-5 pb-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <SceneCard scene={scene} mobile />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scene dots — desktop */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 items-center">
          {SCENES.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: 6,
                height: i === activeIndex ? 28 : 6,
                backgroundColor:
                  i === activeIndex ? 'var(--color-lime)' : 'rgba(255,255,255,0.2)',
                opacity: i === activeIndex ? 1 : 0.5,
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Scene dots — mobile */}
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
          {SCENES.map((_, i) => (
            <motion.div
              key={i}
              className="h-0.5 rounded-full"
              animate={{
                width: i === activeIndex ? 28 : 10,
                backgroundColor:
                  i === activeIndex ? 'var(--color-lime)' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left"
          style={{
            backgroundColor: 'var(--color-lime)',
            scaleX: smoothedProgress,
          }}
        />
      </div>
    </div>
  );
}

function SceneCard({ scene, mobile = false }: { scene: Scene; mobile?: boolean }) {
  const isHero = scene.id === 'hero';

  const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.68) 100%)',
    backdropFilter: 'blur(32px) saturate(180%) brightness(0.88)',
    WebkitBackdropFilter: 'blur(32px) saturate(180%) brightness(0.88)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.04)',
    willChange: 'backdrop-filter',
  };

  if (isHero) {
    return (
      <div
        className={cn('rounded-2xl relative overflow-hidden', mobile ? 'p-5' : 'p-8 lg:p-10')}
        style={glassStyle}
      >
        {/* Glass reflection line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
        />
        {/* Lime accent top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-lime) 40%, transparent 100%)' }}
        />

        {/* Hero title */}
        <h2
          className={cn('font-bold leading-[1.05] mb-5', mobile ? 'text-xl' : 'text-2xl xl:text-3xl')}
          style={{ fontFamily: 'var(--font-title)' }}
        >
          <span style={{ color: 'rgba(255,255,255,0.65)', display: 'block', marginBottom: '0.15em' }}>
            gostamos de
          </span>
          <span
            style={{
              color: 'var(--color-lime)',
              display: 'block',
              fontSize: mobile ? '3.25rem' : '5rem',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              textShadow: '0 0 48px rgba(57,255,20,0.45)',
              marginBottom: '0.1em',
            }}
          >
            GRANDES
          </span>
          <span style={{ color: 'var(--foreground)', display: 'block' }}>
            desafios.
          </span>
        </h2>

        {/* Description */}
        <p
          className={cn('leading-relaxed mb-7', mobile ? 'text-sm' : 'text-base lg:text-lg')}
          style={{ color: 'rgba(255,255,255,0.68)' }}
        >
          Estamos aqui para resolver os problemas mais complexos da sua empresa e te dar{' '}
          <em
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 400,
            }}
          >
            escala
          </em>
          .
        </p>

        {/* CTA Button */}
        <Link
          href="/contact?tab=consultation"
          className={cn(
            'inline-flex items-center gap-2.5 rounded-xl font-semibold transition-all duration-300',
            'bg-[var(--color-lime)] text-black',
            'hover:shadow-[0_0_32px_rgba(57,255,20,0.45)] hover:scale-[1.04]',
            mobile ? 'px-5 py-3 text-sm' : 'px-7 py-3.5 text-base',
          )}
        >
          Entrar em contato
          <svg className={cn(mobile ? 'w-3.5 h-3.5' : 'w-4 h-4')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-2xl relative overflow-hidden', mobile ? 'p-5' : 'p-7 lg:p-9')}
      style={glassStyle}
    >
      {/* Glass reflection line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
      />

      {scene.tag && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          style={{
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
            color: 'var(--color-lime)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--color-lime)' }}
          />
          {scene.tag}
        </motion.div>
      )}

      {scene.metric && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4"
        >
          <span
            className={cn(
              'font-bold leading-none tabular-nums',
              mobile ? 'text-[2.75rem]' : 'text-6xl xl:text-7xl',
            )}
            style={{ fontFamily: 'var(--font-title)', color: 'var(--color-lime)' }}
          >
            {scene.metric}
          </span>
          <span
            className="block text-xs font-semibold uppercase tracking-widest mt-1.5"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {scene.metricLabel}
          </span>
        </motion.div>
      )}

      <h2
        className={cn(
          'font-bold leading-[1.1] mb-4',
          mobile
            ? 'text-2xl'
            : 'text-3xl xl:text-4xl',
        )}
        style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
      >
        {scene.title}
      </h2>

      <p
        className={cn('leading-relaxed', mobile ? 'text-sm' : 'text-base lg:text-lg')}
        style={{ color: 'rgba(255,255,255,0.62)' }}
      >
        {scene.description}
      </p>
    </div>
  );
}
