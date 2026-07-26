import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const intlMiddleware = createIntlMiddleware(routing)
const LOCALE_COOKIE = 'NEXT_LOCALE'
const LOCALES = routing.locales as readonly string[]

function localeFromPath(pathname: string): string | null {
  const seg = pathname.split('/')[1]
  return seg && LOCALES.includes(seg) ? seg : null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const { supabaseResponse } = await updateSession(request)

  // Persistência de idioma: na raiz, se houver cookie com um idioma válido,
  // vai para o último idioma escolhido; senão o intl cai em inglês (default).
  if (pathname === '/') {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
    if (cookieLocale && LOCALES.includes(cookieLocale)) {
      const url = request.nextUrl.clone()
      url.pathname = `/${cookieLocale}`
      const redirect = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(({ name, value }) => redirect.cookies.set(name, value))
      return redirect
    }
  }

  const intlResponse = intlMiddleware(request)

  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    intlResponse.cookies.set(name, value)
  })

  // Lembra o idioma da URL atual para a próxima visita (persistência em cookie).
  // Só grava quando a preferência muda de fato: cookie ausente significa
  // "sem preferência", ou seja, o idioma padrão. Assim as respostas do locale
  // padrão saem sem Set-Cookie e continuam cacheáveis em CDN.
  const current = localeFromPath(pathname)
  const storedLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const effectiveLocale =
    storedLocale && LOCALES.includes(storedLocale) ? storedLocale : routing.defaultLocale

  if (current && current !== effectiveLocale) {
    intlResponse.cookies.set(LOCALE_COOKIE, current, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
