import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-300',
        checked ? 'bg-accent border-accent' : 'bg-surface-3 border-line-strong',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn('absolute h-5 w-5 rounded-full bg-white shadow', checked ? 'left-6' : 'left-1')}
      />
    </button>
  )
}
