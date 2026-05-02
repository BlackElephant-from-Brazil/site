'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* floating island panel — right side */}
          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed z-50 flex w-full flex-col overflow-hidden"
            style={{
              top: '20px',
              right: '20px',
              bottom: '20px',
              maxWidth: '600px',
              background: 'var(--background-secondary)',
              border: '1px solid var(--card-border)',
              borderRadius: '1.25rem',
              boxShadow: '-16px 0 60px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* header */}
            <div
              className="flex shrink-0 items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--card-border)' }}
            >
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-title)' }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-base transition-colors"
                style={{ color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.06)' }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {/* body */}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
