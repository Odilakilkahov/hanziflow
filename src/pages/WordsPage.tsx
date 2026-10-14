import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import type { CardStatus } from '@/types'
import { STATUS_TITLES, useWords } from '@/hooks'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui'
import { Chip } from '@/components/Chip'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { Pinyin } from '@/components/Pinyin'
import { SpeakButton } from '@/components/SpeakButton'

const STATUS_TONE: Record<CardStatus, 'neutral' | 'warn' | 'info' | 'ok'> = {
  new: 'neutral',
  learning: 'warn',
  review: 'info',
  mature: 'ok',
}

export function WordsPage() {
  const w = useWords()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div>
      <PageHeader hanzi="词" title="Словарь" subtitle={`${w.total} слов: HSK 1 и деловой пакет`} />

      <div className="relative mb-3">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-faint" />
        <input
          value={w.search}
          onChange={(e) => w.setSearch(e.target.value)}
          placeholder="Иероглиф, пиньинь (ni hao) или перевод"
          className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-sm outline-none transition-colors placeholder:text-fg-faint focus:border-accent/60"
        />
      </div>

      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        <Chip active={w.level === null} onClick={() => w.setLevel(null)}>Все уровни</Chip>
        <Chip active={w.level === 'hsk1'} onClick={() => w.setLevel('hsk1')}>HSK 1</Chip>
        <Chip active={w.level === 'business'} onClick={() => w.setLevel('business')}>Деловой</Chip>
        <span className="mx-1 w-px shrink-0 bg-line" />
        <Chip active={w.status === null} onClick={() => w.setStatus(null)}>Любой статус</Chip>
        {(Object.keys(STATUS_TITLES) as CardStatus[]).map((s) => (
          <Chip key={s} active={w.status === s} onClick={() => w.setStatus(w.status === s ? null : s)}>{STATUS_TITLES[s]}</Chip>
        ))}
      </div>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Chip active={w.topic === null} onClick={() => w.setTopic(null)}>Все темы</Chip>
        {w.topics.map((t) => (
          <Chip key={t.id} active={w.topic === t.id} onClick={() => w.setTopic(w.topic === t.id ? null : t.id)}>
            <span className="font-hanzi mr-1">{t.emblem}</span>{t.title}
          </Chip>
        ))}
      </div>

      {w.rows.length === 0 ? (
        <EmptyState hanzi="无" title="Ничего не найдено" text="Попробуйте другой запрос или снимите фильтры." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="px-4 py-2 text-xs text-fg-faint">{w.rows.length} из {w.total}</div>
          <ul className="divide-y divide-line">
            {w.rows.map((r, i) => {
              const expanded = open === r.word.id
              return (
                <motion.li
                  key={r.word.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 12) * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : r.word.id)}
                    className={cn('flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-2', expanded && 'bg-surface-2')}
                  >
                    <span className="font-hanzi w-24 shrink-0 text-2xl font-medium">{r.word.hanzi}</span>
                    <div className="min-w-0 flex-1">
                      <Pinyin text={r.word.pinyin} className="text-sm" />
                      <div className="truncate text-sm text-fg-muted">{r.word.ru}</div>
                    </div>
                    <Badge tone={STATUS_TONE[r.status]} className="hidden sm:inline-flex">
                      {STATUS_TITLES[r.status]}{r.dueInDays !== null && r.status !== 'new' ? ` · ${r.dueInDays} д` : ''}
                    </Badge>
                    <SpeakButton text={r.word.hanzi} size="sm" />
                    <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-fg-faint">
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="flex items-start justify-between gap-4 border-t border-line bg-surface-2 px-4 py-4 md:pl-32">
                          <div>
                            <div className="text-xs text-fg-faint">{r.word.pos} · {STATUS_TITLES[r.status]}</div>
                            <div className="font-hanzi mt-2 text-xl">{r.word.example.hanzi}</div>
                            <Pinyin text={r.word.example.pinyin} className="mt-1 text-sm" />
                            <div className="mt-1 text-sm text-fg-muted">{r.word.example.ru}</div>
                          </div>
                          <SpeakButton text={r.word.example.hanzi} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
