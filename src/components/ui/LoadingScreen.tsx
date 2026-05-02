'use client'

import { useState, useEffect } from 'react'
import { Logo, BrandName } from './Logo'

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  minDuration?: number
}

export function LoadingScreen({ 
  onLoadingComplete, 
  minDuration = 1500 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const startTime = Date.now()
    const interval = 20 // Update every 20ms for smooth animation
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / minDuration) * 100, 100)
      
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        clearInterval(timer)
        // Start exit animation
        setTimeout(() => {
          setIsExiting(true)
          // Remove from DOM after animation
          setTimeout(() => {
            setIsVisible(false)
            onLoadingComplete?.()
          }, 600)
        }, 200)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [minDuration, onLoadingComplete])

  if (!isVisible) return null

  return (
    <div 
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center
        bg-[var(--background)] transition-all duration-500 ease-out
        ${isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
      `}
    >
      {/* Logo Container */}
      <div 
        className={`
          flex flex-col items-center gap-6 transition-all duration-500
          ${isExiting ? 'translate-y-[-20px] opacity-0' : 'translate-y-0 opacity-100'}
        `}
      >
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping-slow opacity-20">
            <Logo size={80} />
          </div>
          <Logo size={80} />
        </div>
        
        {/* Brand Name */}
        <BrandName size="lg" />
        
        {/* Progress Bar Container */}
        <div className="mt-8 w-64 flex flex-col items-center gap-3">
          {/* Progress Bar */}
          <div className="w-full h-[2px] bg-[var(--color-gray-800)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--primary)] transition-all duration-100 ease-out shadow-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Loading Text */}
          <div className="flex items-center gap-2 text-[var(--foreground-muted)] font-mono text-sm">
            <span>Carregando</span>
            <span className="text-[var(--primary)] font-bold w-12 text-right">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Background Grid Effect */}
      <div 
        className={`
          absolute inset-0 pointer-events-none opacity-5
          transition-opacity duration-500
          ${isExiting ? 'opacity-0' : 'opacity-5'}
        `}
        style={{
          backgroundImage: `
            linear-gradient(var(--primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <style jsx>{`
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
