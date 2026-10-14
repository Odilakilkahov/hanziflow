import { motion } from 'framer-motion'
import type { TopicProgress } from '@/types'
import { Card } from '@/ui'
import { Icon } from './Icon'
import { stagger } from './motion'
import { plural } from '@/lib/utils'

export function TopicGrid({ topics, onPick }: { topics: TopicProgress[]; onPick?: (t: TopicProgress) => void }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {topics.map((t) => (
        <Card key={t.topic.id} interactive={!!onPick} onClick={() => onPick?.(t)} className="relative overflow-hidden p-4">
          <span className="font-hanzi pointer-events-none absolute -right-2 -top-4 text-7xl font-bold text-white/[0.04] select-none">
            {t.topic.emblem}
          </span>
          <div className="mb-3 flex items-center gap-2 text-fg-muted">
            <Icon name={t.topic.icon} size={16} />
            <span className="text-xs">{plural(t.total, 'слово', 'слова', 'слов')}</span>
          </div>
          <div className="font-semibold tracking-tight">{t.topic.title}</div>
          <div className="mt-1 line-clamp-1 text-xs text-fg-faint">{t.topic.description}</div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${t.percent}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-accent"
            />
          </div>
          <div className="mt-1.5 text-[11px] text-fg-faint tabular-nums">
            {t.learned}/{t.total} · знаю {t.mature}
          </div>
        </Card>
      ))}
    </motion.div>
  )
}
