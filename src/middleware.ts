import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

// TODO: Reativar quando Supabase estiver configurado
// import { updateSession } from '@/lib/supabase/middleware'

// Rotas que requerem autenticação
// const protectedRoutes = ['/dashboard', '/profile', '/settings']

// Rotas de autenticação (redirecionar se já logado)
// const authRoutes = ['/login', '/signup', '/forgot-password']

// Middleware de internacionalização
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Ignorar arquivos estáticos e API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return NextResponse.next()
  }

  // TODO: Reativar verificação de auth quando Supabase estiver configurado
  // const { user, supabaseResponse } = await updateSession(request)
  // 
  // const locales = ['pt', 'es', 'en', 'de', 'fr', 'it']
  // let pathWithoutLocale = pathname
  // 
  // for (const locale of locales) {
  //   if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
  //     pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
  //     break
  //   }
  // }
  // 
  // const isProtectedRoute = protectedRoutes.some(route => 
  //   pathWithoutLocale.startsWith(route)
  // )
  // 
  // const isAuthRoute = authRoutes.some(route => 
  //   pathWithoutLocale.startsWith(route)
  // )
  // 
  // if (isProtectedRoute && !user) {
  //   const loginUrl = new URL('/login', request.url)
  //   loginUrl.searchParams.set('redirect', pathname)
  //   return NextResponse.redirect(loginUrl)
  // }
  // 
  // if (isAuthRoute && user) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  // Aplicar apenas middleware de internacionalização por enquanto
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
