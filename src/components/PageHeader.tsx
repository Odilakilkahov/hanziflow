import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp } from './motion'

export function PageHeader({ hanzi, title, subtitle, right }: { hanzi: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <motion.header variants={fadeUp} initial="hidden" animate="visible" className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="font-hanzi text-4xl font-bold leading-none text-accent md:text-5xl">{hanzi}</span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
        </div>
      </div>
      {right}
    </motion.header>
  )
}
