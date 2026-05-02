'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

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
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Check if this is a fresh page load or navigation
    const hasLoadedBefore = sessionStorage.getItem('be-initial-load')
    
    if (hasLoadedBefore) {
      // Skip loading screen on subsequent navigations
      setIsLoading(false)
      setHasLoaded(true)
    }
    
    setIsMounted(true)
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
