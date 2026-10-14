import { motion } from 'framer-motion'
import type { DayActivity } from '@/types'
import { cn } from '@/lib/utils'

/** Семь дней: столбики повторений, подсветка дней с выполненной целью. */
export function WeekStrip({ week, goal }: { week: DayActivity[]; goal: number }) {
  const max = Math.max(goal, ...week.map((d) => d.reviews), 1)
  return (
    <div className="flex items-end justify-between gap-2">
      {week.map((d, i) => {
        const h = Math.max(6, Math.round((d.reviews / max) * 72))
        const today = i === week.length - 1
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-20 items-end">
              <motion.div
                initial={{ height: 6, opacity: 0 }}
                animate={{ height: h, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={cn('w-7 rounded-md', d.goalMet ? 'bg-accent' : d.reviews > 0 ? 'bg-accent/40' : 'bg-white/8')}
                title={`${d.reviews} повторений`}
              />
            </div>
            <span className={cn('text-xs', today ? 'font-semibold text-fg' : 'text-fg-faint')}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
