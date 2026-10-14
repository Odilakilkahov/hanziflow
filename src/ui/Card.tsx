import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp } from '@/components/motion'

export interface CardProps extends HTMLMotionProps<'div'> {
  /** Поднимать карточку при наведении. */
  interactive?: boolean
  /** Без анимации появления (например, внутри уже анимированного контейнера). */
  still?: boolean
}

export function Card({ interactive, still, className, children, ...props }: CardProps) {
  return (
    <motion.div
      variants={still ? undefined : fadeUp}
      whileHover={interactive ? { y: -3, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'rounded-2xl border border-line bg-surface p-5',
        interactive && 'cursor-pointer hover:border-line-strong hover:bg-surface-2 transition-colors duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
