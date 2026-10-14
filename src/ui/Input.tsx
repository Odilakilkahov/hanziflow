import { AnimatePresence, motion } from 'framer-motion'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value: string
  onChange: (v: string) => void
  /** Иконка слева (например, лупа). */
  leading?: ReactNode
  /** Показывать крестик очистки, когда есть текст. */
  clearable?: boolean
  size?: 'md' | 'lg'
}

/** Текстовое поле: контейнер подсвечивается через focus-within, кнопка очистки появляется с анимацией. */
export function Input({ value, onChange, leading, clearable, size = 'md', className, ...props }: InputProps) {
  return (
    <div
      className={cn(
        'relative flex items-center rounded-2xl border border-line bg-surface transition-colors duration-150',
        'focus-within:border-accent/60 focus-within:shadow-[0_0_0_3px_rgba(229,72,77,0.12)]',
        size === 'lg' ? 'h-12' : 'h-10',
        className,
      )}
    >
      {leading && <span className="pointer-events-none flex w-12 shrink-0 items-center justify-center text-fg-faint">{leading}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          // Контур фокуса рисует контейнер (focus-within), у самого поля его нет.
          'h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none focus-visible:outline-none placeholder:text-fg-faint',
          !leading && 'pl-4',
          clearable ? 'pr-10' : 'pr-4',
        )}
        {...props}
      />
      <AnimatePresence>
        {clearable && value && (
          <motion.button
            key="clear"
            type="button"
            aria-label="Очистить"
            onClick={() => onChange('')}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.12 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-white/8 hover:text-fg"
          >
            <X size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
