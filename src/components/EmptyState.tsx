import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pop } from './motion'

export function EmptyState({ hanzi, title, text, action }: { hanzi: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <motion.div variants={pop} initial="hidden" animate="visible" className="flex flex-col items-center py-16 text-center">
      <span className="font-hanzi mb-4 text-7xl font-bold text-white/10">{hanzi}</span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-2 max-w-sm text-sm text-fg-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
