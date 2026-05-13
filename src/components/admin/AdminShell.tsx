'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TopNavbar } from './TopNavbar'
import { TodoPanel } from './panels/TodoPanel'
import { NotesPanel } from './panels/NotesPanel'
import { PasswordsPanel } from './panels/PasswordsPanel'

type Panel = 'todos' | 'notes' | 'passwords'

interface Props {
  children: React.ReactNode
  userId: string
}

export function AdminShell({ children, userId }: Props) {
  const [activePanel, setActivePanel] = useState<Panel | null>(null)

  function togglePanel(panel: Panel) {
    setActivePanel(prev => (prev === panel ? null : panel))
  }

  return (
    <div className="flex flex-1 flex-col" style={{ minWidth: 0 }}>
      <TopNavbar activePanel={activePanel} onToggle={togglePanel} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-8 py-8" style={{ minWidth: 0 }}>
          {children}
        </main>
        <AnimatePresence initial={false}>
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ width: 0 }}
              animate={{ width: 320 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden', flexShrink: 0, height: '100%' }}
            >
              {activePanel === 'todos' && (
                <TodoPanel userId={userId} onClose={() => setActivePanel(null)} />
              )}
              {activePanel === 'notes' && (
                <NotesPanel userId={userId} onClose={() => setActivePanel(null)} />
              )}
              {activePanel === 'passwords' && (
                <PasswordsPanel userId={userId} onClose={() => setActivePanel(null)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
