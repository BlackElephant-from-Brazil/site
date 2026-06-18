'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from '@/i18n/navigation'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

const NO_SPLASH_ROUTES = ['/venda-mais-com-uma-landing-page-de-alta-conversao']

interface LoadingContextType {
  isLoading: boolean
  hasLoaded: boolean
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  hasLoaded: false,
})

export function useLoading() {
  return useContext(LoadingContext)
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const pathname = usePathname()
  const skipSplash = NO_SPLASH_ROUTES.some(route => pathname.startsWith(route))

  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (skipSplash) {
      setIsLoading(false)
      setHasLoaded(true)
      setIsMounted(true)
      return
    }

    // Check if this is a fresh page load or navigation
    const hasLoadedBefore = sessionStorage.getItem('be-initial-load')

    if (hasLoadedBefore) {
      // Skip loading screen on subsequent navigations
      setIsLoading(false)
      setHasLoaded(true)
    }

    setIsMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
