'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLottieScroll } from '@/hooks/useLottieScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type Scene = {
  id: string;
  range: [number, number];
  index: string;
  caseLabel: string | null;
  caseName: string | null;
  metric: string | null;
  metricSuffix: string | null;
  metricLabel: string | null;
  titleParts: TitlePart[];
  description: DescriptionPart[];
  accent: 'lime' | 'cyan' | 'amber';
};

type TitlePart = { text: string; style?: 'serif-italic' | 'lime' | 'muted' };
type DescriptionPart = { text: string; style?: 'serif-italic' | 'lime' };

// Ranges em fração do scroll total do container.
// Os centros (média do range) determinam para onde o snap "puxa" cada cena.
// A última cena termina em 0.90 — entre 0.90 e 1.00 é zona de saída livre.
const SCENES: Scene[] = [
  {
    id: 'hero',
    range: [0, 0.22],
    index: '',
    caseLabel: null,
    caseName: null,
    metric: null,
    metricSuffix: null,
    metricLabel: null,
    titleParts: [
      { text: 'gostamos de', style: 'serif-italic' },
      { text: 'GRANDES', style: 'lime' },
      { text: 'desafios.' },
    ],
    description: [
      { text: 'Estamos aqui para resolver os problemas mais complexos da sua empresa e te dar ' },
      { text: 'escala', style: 'serif-italic' },
      { text: '.' },
    ],
    accent: 'lime',
  },
  {
    id: 'transport',
    range: [0.22, 0.45],
    index: '01 / 03',
    caseLabel: 'Case de Sucesso',
    caseName: 'Transportadora Regional',
    metric: 'R$100k',
    metricSuffix: '+',
    metricLabel: 'economizados por ano',
    titleParts: [
      { text: 'Automações que geram' },
      { text: 'economia', style: 'serif-italic' },
      { text: 'real.' },
    ],
    description: [
      { text: 'Sistema de gestão operacional que eliminou desperdícios invisíveis e transformou a operação de uma transportadora regional.' },
    ],
    accent: 'lime',
  },
  {
    id: 'services',
    range: [0.45, 0.68],
    index: '02 / 03',
    caseLabel: 'Case de Sucesso',
    caseName: 'Empresa de Serviços',
    metric: '30',
    metricSuffix: ' dias',
    metricLabel: 'do zero ao deploy',
    titleParts: [
      { text: 'Sistema + 2 apps. Em' },
      { text: '1 mês', style: 'serif-italic' },
      { text: '.' },
    ],
    description: [
      { text: 'Plataforma de gestão completa e dois aplicativos mobile entregues em trinta dias. Do briefing aos apps nas lojas.' },
    ],
    accent: 'lime',
  },
  {
    id: 'bank',
    range: [0.68, 0.90],
    index: '03 / 03',
    caseLabel: 'Case de Sucesso',
    caseName: 'Banco Regional',
    metric: '−90',
    metricSuffix: '%',
    metricLabel: 'em erros operacionais',
    titleParts: [
      { text: 'Precisão onde não há espaço para' },
      { text: 'falhas', style: 'serif-italic' },
      { text: '.' },
    ],
    description: [
      { text: 'Plataforma bancária que substituiu processos manuais críticos e praticamente zerou os erros humanos na operação.' },
    ],
    accent: 'lime',
  },
];

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const easeIn = [0.4, 0, 1, 1] as [number, number, number, number];

// Variants aplicadas apenas ao CONTEÚDO interno (o card glass permanece estático).
// Movimento mais sutil porque a moldura não animma — só o texto desliza/aparece.
const contentVariants = {
  enter: (dir: number) => ({
    y: dir > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: easeOut },
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -20 : 20,
    opacity: 0,
    transition: { duration: 0.25, ease: easeIn },
  }),
};

function getSceneIndex(progress: number): number {
  for (let i = 0; i < SCENES.length - 1; i++) {
    if (progress < SCENES[i + 1].range[0]) return i;
  }
  return SCENES.length - 1;
}

/**
 * Outer wrapper. Renderiza o scrollytelling APENAS no desktop (≥1024px).
 * No mobile, retorna null — quem cuida da experiência mobile equivalente é
 * o MobileHeroSection (sem Lottie, sem snap, layout vertical natural).
 *
 * Isso evita que useLottieScroll, useScroll, listeners de scroll/touch e o
 * GSAP ScrollTrigger sejam instanciados no mobile, eliminando travas de
 * performance e o problema do scroll snap mobile não conseguir convergir.
 */
export function ScrollytellingSection() {
  // Default true no SSR — assume desktop, então o markup do scrollytelling
  // sai no HTML inicial. Após hidratação, se for mobile, o componente desmonta.
  const isDesktop = useMediaQuery('(min-width: 1024px)', true);
  if (!isDesktop) return null;
  return <ScrollytellingSectionInner />;
}

function ScrollytellingSectionInner() {
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

  useLottieScroll(
    lottieContainerRef,
    containerRef,
    '/videos/elephant-transform.json',
    0.12,
  );

  // Scroll livre + snap direcional robusto.
  //
  // Decisões importantes:
  // - `isSnapping` é liberado por RAF-based settled detection (não setTimeout
  //   fixo). Espera o scrollY estabilizar por N frames antes de aceitar novo
  //   gesto. Isso garante que o smooth scroll programático termine antes do
  //   sistema considerar o próximo gesto.
  // - Cooldown extra (~220ms) após o snap. Ignora os resíduos de scroll events
  //   que o browser dispara logo após o smooth scroll completar — eram esses
  //   resíduos que estavam sendo interpretados como "gesto pequeno" e fazendo
  //   o sistema voltar para a cena anterior.
  // - Direção do gesto (deltaY vs gestureStartY) determina próxima/anterior.
  //   Se a inércia foi forte e levou várias cenas, respeitamos a posição final
  //   (Math.max/Math.min com `currentIdx`) em vez de forçar 1 cena por vez.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ===== State =====
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
    let touchSnapTimer: ReturnType<typeof setTimeout> | null = null;
    let settledRafId: number | null = null;
    let isSnapping = false;
    let postSnapCooldownUntil = 0;
    let touchActive = false;
    let gestureStartY: number | null = null;
    let gestureStartIdx: number | null = null;

    // ===== Helpers =====
    const inCooldown = () => performance.now() < postSnapCooldownUntil;

    const computeProgress = () => {
      const rect = container.getBoundingClientRect();
      const scrollable = container.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return null;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      return { progress, scrollable, rect };
    };

    const captureGestureStart = () => {
      if (gestureStartY !== null) return;
      const data = computeProgress();
      if (!data) return;
      gestureStartY = window.scrollY;
      gestureStartIdx = getSceneIndex(data.progress);
    };

    const resetGesture = () => {
      gestureStartY = null;
      gestureStartIdx = null;
    };

    const cancelSettledRaf = () => {
      if (settledRafId !== null) {
        cancelAnimationFrame(settledRafId);
        settledRafId = null;
      }
    };

    // Espera o scroll programático REALMENTE terminar. ScrollY tem que ficar
    // estável por 8 frames (~133ms) para liberar isSnapping. Cobre smooth
    // scrolls longos no mobile que excedem qualquer setTimeout fixo razoável.
    const waitForScrollSettled = () => {
      cancelSettledRaf();
      let lastY = window.scrollY;
      let stillFrames = 0;
      const STILL_FRAMES = 8;

      const tick = () => {
        const currentY = window.scrollY;
        if (Math.abs(currentY - lastY) < 0.5) {
          stillFrames++;
          if (stillFrames >= STILL_FRAMES) {
            isSnapping = false;
            postSnapCooldownUntil = performance.now() + 220;
            settledRafId = null;
            return;
          }
        } else {
          stillFrames = 0;
          lastY = currentY;
        }
        settledRafId = requestAnimationFrame(tick);
      };
      settledRafId = requestAnimationFrame(tick);
    };

    const snapToScene = (idx: number) => {
      const data = computeProgress();
      if (!data) return;
      const { scrollable, rect } = data;
      const targetProgress = SCENES[idx].range[0];
      const containerTop = rect.top + window.scrollY;
      const targetY = containerTop + targetProgress * scrollable;
      if (Math.abs(window.scrollY - targetY) < 6) return;

      // Reset ANTES do scrollTo para evitar race com scroll events do próprio
      // smooth scroll (que poderiam re-capturar gestureStartY no destino).
      resetGesture();
      isSnapping = true;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      waitForScrollSettled();
    };

    const snapAfterGesture = () => {
      if (touchActive || isSnapping) return;

      const data = computeProgress();
      if (!data) {
        resetGesture();
        return;
      }
      const { progress } = data;

      // Zonas de saída — libera scroll natural para seções vizinhas
      if (progress < 0.015 || progress > 0.92) {
        resetGesture();
        return;
      }

      const currentIdx = getSceneIndex(progress);

      // Sem origem capturada: snap para a cena atual (CORREÇÃO do bug "nearest
      // center" — antes, progress=0.22 era classificado mais perto de hero
      // (0.11) do que de transport (0.335), puxando sempre pra trás).
      if (gestureStartY === null || gestureStartIdx === null) {
        snapToScene(currentIdx);
        return;
      }

      // Decisão direcional + respeito à magnitude da inércia
      const deltaY = window.scrollY - gestureStartY;
      const threshold = window.innerHeight * 0.035; // ~3.5vh

      let targetIdx: number;
      if (deltaY > threshold) {
        // Pra baixo: ao menos +1, mas respeita inércia mais forte
        targetIdx = Math.max(gestureStartIdx + 1, currentIdx);
        targetIdx = Math.min(targetIdx, SCENES.length - 1);
      } else if (deltaY < -threshold) {
        // Pra cima: ao menos -1, mas respeita inércia mais forte
        targetIdx = Math.min(gestureStartIdx - 1, currentIdx);
        targetIdx = Math.max(targetIdx, 0);
      } else {
        // Movimento insuficiente: fica onde está (não na origem, porque a
        // inércia pode ter movido). Se já está numa cena válida, snap nela.
        targetIdx = currentIdx;
      }

      snapToScene(targetIdx);
    };

    // ===== Event handlers =====
    const onScroll = () => {
      if (isSnapping || inCooldown()) return;
      captureGestureStart();
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(snapAfterGesture, 120);
    };

    const onTouchStart = () => {
      touchActive = true;
      if (touchSnapTimer) clearTimeout(touchSnapTimer);
      // Não captura novo gesto durante cooldown (resíduo de snap anterior)
      if (!inCooldown() && !isSnapping) {
        captureGestureStart();
      }
    };

    const onTouchEnd = () => {
      touchActive = false;
      // Fallback caso o scroll natural não dispare mais eventos (swipe curto
      // sem inércia). 480ms é tempo suficiente pra inércia normal acabar e
      // o scrollEndTimer disparar primeiro; senão, este aqui dispara.
      if (touchSnapTimer) clearTimeout(touchSnapTimer);
      touchSnapTimer = setTimeout(snapAfterGesture, 480);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      if (touchSnapTimer) clearTimeout(touchSnapTimer);
      cancelSettledRaf();
    };
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
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

  // Componente é desktop-only (guard no wrapper externo). Altura fixa em 720vh.
  return (
    <div ref={containerRef} className="relative h-[720vh]">
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ isolation: 'isolate' }}
      >
        {/* Lottie background */}
        <div
          ref={lottieContainerRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-hidden"
        />

        {/* Subtle radial vignette to focus the eye */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, transparent 30%, rgba(0,0,0,0.45) 90%)',
          }}
        />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a]/70 to-transparent" />

        {/* Card no canto inferior direito (cobre marca d'água).
            O GlassCard permanece ESTÁTICO. Apenas o conteúdo interno anima
            entre as cenas, preservando o efeito de vidro de forma contínua. */}
        <div className="absolute inset-0 flex items-end justify-end pb-14 pr-14 xl:pr-20">
          <div className="w-full max-w-[560px] xl:max-w-[600px]">
            <GlassCard>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <SceneContent scene={scene} />
                </motion.div>
              </AnimatePresence>
            </GlassCard>
          </div>
        </div>

        {/* Scene dots — indicador vertical à direita */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 items-center">
          {SCENES.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: 6,
                height: i === activeIndex ? 28 : 6,
                backgroundColor:
                  i === activeIndex ? 'var(--color-lime)' : 'rgba(255,255,255,0.25)',
                opacity: i === activeIndex ? 1 : 0.6,
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left"
          style={{
            backgroundColor: 'var(--color-lime)',
            scaleX: scrollYProgress,
          }}
        />
      </div>
    </div>
  );
}

/**
 * GlassCard — moldura estática.
 * Permanece montada o tempo todo enquanto o conteúdo interno transiciona.
 * Como ela nunca é desmontada nem tem opacity animada, o backdrop-filter (glass)
 * fica visível de forma contínua entre as cenas.
 *
 * `min-h` dimensionado para o conteúdo mais alto (case com métrica gigante),
 * evitando que o card pulse de altura entre transições.
 */
function GlassCard({ children, mobile = false }: { children: React.ReactNode; mobile?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[20px]',
        mobile ? 'p-6 min-h-[440px]' : 'p-9 lg:p-10 min-h-[540px] lg:min-h-[560px]',
      )}
      style={{
        background:
          'linear-gradient(135deg, rgba(15,15,15,0.55) 0%, rgba(8,8,8,0.35) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow:
          '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(255,255,255,0.04)',
        isolation: 'isolate',
      }}
    >
      {/* Glass reflection line — moderado */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
      />
      {/* Lime accent thread (sutil) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full w-[2px]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, var(--color-lime) 50%, transparent 100%)',
          opacity: 0.5,
        }}
      />
      {/* Slot do conteúdo animável (children = motion.div com AnimatePresence) */}
      {children}
    </div>
  );
}

/**
 * SceneContent — conteúdo interno animado.
 * Renderizado dentro do GlassCard, é destruído e remontado a cada troca de
 * cena (via key no motion.div pai dentro do AnimatePresence). Como o pai
 * cuida da animação de entrada/saída, aqui não há motion.div próprio.
 */
function SceneContent({ scene, mobile = false }: { scene: Scene; mobile?: boolean }) {
  const isHero = scene.id === 'hero';

  return (
    <>
      {/* Case header — pill + nome do case em destaque */}
      {scene.caseName && (
        <div className={cn('mb-6', mobile ? '' : 'mb-7')}>
          {/* Pill: CASE DE SUCESSO · 01/03 */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              backgroundColor: 'rgba(57,255,20,0.12)',
              border: '1px solid rgba(57,255,20,0.35)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-lime)',
                boxShadow: '0 0 8px rgba(57,255,20,0.7)',
              }}
            />
            <span
              className="text-[10.5px] font-bold uppercase tracking-[0.22em]"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--color-lime)',
              }}
            >
              {scene.caseLabel}
            </span>
            {scene.index && (
              <>
                <span
                  aria-hidden="true"
                  className="w-px h-3"
                  style={{ backgroundColor: 'rgba(57,255,20,0.35)' }}
                />
                <span
                  className="text-[10.5px] font-bold tabular-nums tracking-[0.18em]"
                  style={{
                    fontFamily: 'var(--font-title)',
                    color: 'var(--color-lime)',
                  }}
                >
                  {scene.index}
                </span>
              </>
            )}
          </div>

          {/* Nome do case — destaque grande */}
          <h3
            className={cn(
              'leading-[1.05] tracking-[-0.02em]',
              mobile ? 'text-[1.55rem]' : 'text-[2rem] xl:text-[2.25rem]',
            )}
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
              fontWeight: 700,
            }}
          >
            {scene.caseName}
          </h3>

          {/* Linha decorativa */}
          <div
            aria-hidden="true"
            className="mt-5 h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, rgba(57,255,20,0.5) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)',
            }}
          />
        </div>
      )}

      {/* Metric (cases) — contador em destaque */}
      {scene.metric && (
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'font-bold leading-none tabular-nums tracking-[-0.05em]',
                mobile ? 'text-[4.2rem]' : 'text-[6.5rem] xl:text-[7.5rem]',
              )}
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--color-lime)',
                textShadow: '0 0 32px rgba(57,255,20,0.28)',
                fontWeight: 800,
              }}
            >
              {scene.metric}
            </span>
            {scene.metricSuffix && (
              <span
                className={cn(
                  'font-normal leading-none',
                  mobile ? 'text-[1.75rem]' : 'text-[2.5rem] xl:text-[3rem]',
                )}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'normal',
                  fontWeight: 100,
                  color: 'var(--color-lime)',
                  opacity: 0.85,
                }}
              >
                {scene.metricSuffix}
              </span>
            )}
          </div>
          {scene.metricLabel && (
            <div
              className="mt-3 flex items-center gap-2"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <span
                aria-hidden="true"
                className="h-px w-6"
                style={{ backgroundColor: 'var(--color-lime)', opacity: 0.7 }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                {scene.metricLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      {isHero ? (
        <HeroTitle parts={scene.titleParts} mobile={mobile} />
      ) : (
        <CaseTitle parts={scene.titleParts} mobile={mobile} />
      )}

      {/* Description */}
      <p
        className={cn(
          'leading-relaxed mt-5',
          mobile ? 'text-[15px]' : 'text-base lg:text-[17px]',
        )}
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'var(--font-primary)',
        }}
      >
        {scene.description.map((part, i) => {
          if (part.style === 'serif-italic') {
            return (
              <em
                key={i}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'normal',
                  fontWeight: 100,
                  color: 'rgba(255,255,255,0.95)',
                }}
              >
                {part.text}
              </em>
            );
          }
          if (part.style === 'lime') {
            return (
              <span key={i} style={{ color: 'var(--color-lime)' }}>
                {part.text}
              </span>
            );
          }
          return <span key={i}>{part.text}</span>;
        })}
      </p>

      {/* CTA — only hero */}
      {isHero && (
        <div className="mt-8">
          <a
            href="https://calendly.com/guilherme-blackelephant/30min"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2.5 rounded-xl font-semibold transition-all duration-300',
              'bg-[var(--color-lime)] text-black',
              'hover:shadow-[0_0_24px_rgba(57,255,20,0.28)] hover:scale-[1.025]',
              mobile ? 'px-5 py-3 text-sm' : 'px-7 py-3.5 text-[15px]',
            )}
          >
            Entrar em contato
            <svg
              className={cn(mobile ? 'w-3.5 h-3.5' : 'w-4 h-4')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      )}
    </>
  );
}

function HeroTitle({ parts, mobile }: { parts: TitlePart[]; mobile: boolean }) {
  return (
    <h2
      className={cn(
        'leading-[1] tracking-[-0.02em]',
        mobile ? 'text-[2rem]' : 'text-[2.4rem] xl:text-[2.8rem]',
      )}
      style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}
    >
      {parts.map((part, i) => {
        if (part.style === 'serif-italic') {
          return (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'normal',
                fontWeight: 100,
                color: 'rgba(255,255,255,0.6)',
                display: 'block',
                marginBottom: '0.08em',
              }}
            >
              {part.text}
            </span>
          );
        }
        if (part.style === 'lime') {
          return (
            <span
              key={i}
              style={{
                color: 'var(--color-lime)',
                display: 'block',
                fontSize: mobile ? '4rem' : '6rem',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                fontWeight: 800,
                textShadow: '0 0 28px rgba(57,255,20,0.22)',
                marginBottom: '0.04em',
              }}
            >
              {part.text}
            </span>
          );
        }
        return (
          <span
            key={i}
            style={{
              color: 'var(--foreground)',
              display: 'block',
            }}
          >
            {part.text}
          </span>
        );
      })}
    </h2>
  );
}

function CaseTitle({ parts, mobile }: { parts: TitlePart[]; mobile: boolean }) {
  return (
    <p
      className={cn(
        'leading-[1.2] tracking-[-0.01em]',
        mobile ? 'text-[1.15rem]' : 'text-[1.35rem] xl:text-[1.5rem]',
      )}
      style={{
        fontFamily: 'var(--font-title)',
        color: 'rgba(255,255,255,0.92)',
        fontWeight: 500,
      }}
    >
      {parts.map((part, i) => {
        if (part.style === 'serif-italic') {
          return (
            <span key={i}>
              {' '}
              <em
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'normal',
                  fontWeight: 100,
                  color: 'var(--color-lime)',
                }}
              >
                {part.text}
              </em>
            </span>
          );
        }
        return <span key={i}>{i > 0 ? ' ' : ''}{part.text}</span>;
      })}
    </p>
  );
}
