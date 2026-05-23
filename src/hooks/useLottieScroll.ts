'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Sincroniza uma animação Lottie (canvas renderer) com o scroll de uma seção
 * usando GSAP ScrollTrigger como driver.
 *
 * - Lottie fica sempre em goToAndStop — nunca em play().
 * - GSAP ScrollTrigger lê a posição de scroll e chama onUpdate a cada frame,
 *   eliminando a necessidade de RAF manual ou listeners de scroll.
 * - scrubSeconds controla o lag de suavização (0 = imediato, 0.5 = 500ms lag).
 */
export function useLottieScroll(
  lottieContainerRef: RefObject<HTMLDivElement | null>,
  sectionRef: RefObject<HTMLDivElement | null>,
  animationPath: string,
  scrubSeconds = 0.15,
): void {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = lottieContainerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;

    let destroyed = false;

    const setup = async () => {
      const [{ default: lottie }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('lottie-web'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (destroyed) return;

      gsap.registerPlugin(ScrollTrigger);

      const anim = lottie.loadAnimation({
        container,
        renderer: 'canvas',
        loop: false,
        autoplay: false,
        path: animationPath,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice',
          clearCanvas: true,
        },
      });

      anim.addEventListener('DOMLoaded', () => {
        if (destroyed) return;

        // Força o canvas gerado pelo lottie-web a preencher o container
        const canvas = container.querySelector('canvas');
        if (canvas) {
          Object.assign(canvas.style, {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
          });
        }

        // Sincroniza com a posição de scroll atual (caso a página já esteja rolada)
        const rect = section.getBoundingClientRect();
        const scrollRange = section.offsetHeight - window.innerHeight;
        if (scrollRange > 0) {
          const initialProgress = Math.max(0, Math.min(1, -rect.top / scrollRange));
          anim.goToAndStop(initialProgress * (anim.totalFrames - 1), true);
        }

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: scrubSeconds,
          onUpdate: (self) => {
            anim.goToAndStop(self.progress * (anim.totalFrames - 1), true);
          },
        });

        cleanupRef.current = () => {
          trigger.kill();
          anim.destroy();
        };
      });
    };

    setup();

    return () => {
      destroyed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [lottieContainerRef, sectionRef, animationPath, scrubSeconds]);
}
