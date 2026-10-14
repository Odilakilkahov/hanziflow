import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors duration-200',
        active ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {children}
    </motion.button>
  )
}
