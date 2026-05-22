'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Sincroniza o currentTime de um vídeo com o progresso de scroll de uma seção.
 *
 * - O vídeo fica sempre pausado; o scroll controla os frames via lerp + RAF.
 * - targetTime é atualizado no listener de scroll (somente leitura de posição).
 * - A escrita em currentTime acontece exclusivamente no loop RAF para evitar
 *   "cancel storm" (seeks cancelados em sequência que travam o decoder).
 * - readyState >= 2 garante que há dados suficientes antes de qualquer seek.
 */
export function useScrollVideo<C extends HTMLElement = HTMLElement>(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<C | null>,
  lerpFactor = 0.15,
): void {
  const rafIdRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const lerpedTimeRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.pause();
    video.currentTime = 0;
    targetTimeRef.current = 0;
    lerpedTimeRef.current = 0;

    // Calcula o targetTime baseado em getBoundingClientRect — robusto a
    // layout shifts e independente de qualquer lib de scroll.
    const updateTarget = () => {
      const v = videoRef.current;
      const c = containerRef.current;
      if (!v || !c || !v.duration) return;
      const rect = c.getBoundingClientRect();
      const scrollRange = c.offsetHeight - window.innerHeight;
      if (scrollRange <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
      targetTimeRef.current = progress * v.duration;
    };

    // Loop RAF: aplica lerp sobre lerpedTime → currentTime a cada frame.
    // Só escreve quando a diferença é perceptível (> 1ms) e o vídeo tem dados.
    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);
      const v = videoRef.current;
      if (!v || v.readyState < 2 || !v.duration) return;

      const diff = targetTimeRef.current - lerpedTimeRef.current;
      if (Math.abs(diff) < 0.001) return;

      lerpedTimeRef.current += diff * lerpFactor;
      v.currentTime = Math.max(0, Math.min(v.duration, lerpedTimeRef.current));
      if (!v.paused) v.pause();
    };

    // Resincroniza quando os metadados chegam (vídeo em cache já carregado)
    video.addEventListener('loadedmetadata', updateTarget);

    // Sincroniza imediatamente caso a página já esteja rolada
    updateTarget();

    window.addEventListener('scroll', updateTarget, { passive: true });
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener('loadedmetadata', updateTarget);
      window.removeEventListener('scroll', updateTarget);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [videoRef, containerRef, lerpFactor]);
}
