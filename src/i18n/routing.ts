import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Idiomas suportados. Inglês é o padrão (primeira visita).
  locales: ['en', 'pt-br', 'pt-pt', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Detecção nativa desligada: o middleware resolve a raiz por cookie
  // (último idioma escolhido) e cai em inglês quando não houver cookie.
  localeDetection: false,
  // O cookie NEXT_LOCALE é escrito pelo nosso middleware, e só quando a
  // preferência muda. Sem isto o next-intl grava um Set-Cookie em toda
  // resposta, o que impede o cache de CDN das páginas estáticas.
  localeCookie: false,
})
