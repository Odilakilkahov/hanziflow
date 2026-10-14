import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  size?: Size
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_0_1px_rgba(229,72,77,0.3),0_8px_24px_-8px_rgba(229,72,77,0.6)]',
  secondary: 'bg-surface-2 text-fg border border-line hover:border-line-strong hover:bg-surface-3',
  ghost: 'bg-transparent text-fg-muted hover:text-fg hover:bg-white/5',
  danger: 'bg-bad-soft text-bad border border-bad/30 hover:bg-bad/25',
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-200 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-40 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
