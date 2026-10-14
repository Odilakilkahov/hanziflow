import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ProgressRing({
  percent,
  size = 96,
  stroke = 8,
  className,
  children,
  color = 'var(--color-accent)',
}: {
  percent: number
  size?: number
  stroke?: number
  className?: string
  children?: ReactNode
  color?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(100, percent))
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * p) / 100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
