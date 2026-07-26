'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from '@/i18n/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

// Rotas do app autenticado — as únicas que mantêm o splash de carregamento.
// Todo o resto é conteúdo de marketing e precisa sair completo no HTML do
// servidor, sem gate de hidratação, para crawlers que não executam JavaScript.
const SPLASH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/dashboard',
]

interface LoadingContextType {
  isLoading: boolean
  hasLoaded: boolean
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  hasLoaded: true,
})

export function useLoading() {
  return useContext(LoadingContext)
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const pathname = usePathname()
  const useSplash = SPLASH_ROUTES.some(route => pathname.startsWith(route))

  // Marketing: renderiza os filhos direto, no servidor, sem splash e sem
  // wrapper de opacidade. O HTML inicial já contém todo o conteúdo.
  if (!useSplash) {
    return (
      <LoadingContext.Provider value={{ isLoading: false, hasLoaded: true }}>
        {children}
      </LoadingContext.Provider>
    )
  }

  return <AppSplashGate>{children}</AppSplashGate>
}

/** Splash do app autenticado — comportamento original preservado. */
function AppSplashGate({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Sincroniza com o sessionStorage (sistema externo, indisponível no SSR):
    // o splash só aparece na primeira carga da sessão.
    /* eslint-disable react-hooks/set-state-in-effect */
    const hasLoadedBefore = sessionStorage.getItem('be-initial-load')

    if (hasLoadedBefore) {
      // Skip loading screen on subsequent navigations
      setIsLoading(false)
      setHasLoaded(true)
    }

    setIsMounted(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setHasLoaded(true)
    sessionStorage.setItem('be-initial-load', 'true')
  }

  // Prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <LoadingContext.Provider value={{ isLoading, hasLoaded }}>
      {isLoading && (
        <LoadingScreen
          onLoadingComplete={handleLoadingComplete}
          minDuration={1500}
        />
      )}
      <div
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {children}
      </div>
    </LoadingContext.Provider>
  )
}
