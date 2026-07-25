import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Idiomas suportados. Inglês é o padrão (primeira visita).
  locales: ['en', 'pt-br', 'pt-pt', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Detecção nativa desligada: o middleware resolve a raiz por cookie
  // (último idioma escolhido) e cai em inglês quando não houver cookie.
  localeDetection: false,
})
