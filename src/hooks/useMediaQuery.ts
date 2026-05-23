'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hook para detectar se uma media query é satisfeita.
 *
 * Usa `useSyncExternalStore` (React 18+) para sincronizar com o objeto
 * `MediaQueryList` do browser sem cascading renders.
 *
 * `defaultValue` é o valor retornado durante SSR (e no primeiro render do
 * cliente, antes da hidratação). Escolha o valor que minimiza flash visual
 * no caminho mais comum.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => defaultValue,
  );
}
