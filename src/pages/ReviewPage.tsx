import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import type { Grade, Level, TopicId } from '@/types'
import { TOPICS, TOPIC_BY_ID } from '@/data/topics'
import { useDashboard, useReviewSession, useSettings, useSpeech } from '@/hooks'
import { cn, plural } from '@/lib/utils'
import { Badge, Button, Card } from '@/ui'
import { PageHeader } from '@/components/PageHeader'
import { Pinyin } from '@/components/Pinyin'
import { SpeakButton } from '@/components/SpeakButton'
import { TopicGrid } from '@/components/TopicGrid'
import { EmptyState } from '@/components/EmptyState'
import { fadeUp, pop, stagger } from '@/components/motion'

export interface ReviewPreset {
  topic?: TopicId
  level?: Level
  /** Меняется при каждом новом запуске с главной, чтобы перезапустить сессию. */
  nonce: number
}

type Selection = { topic?: TopicId; level?: Level }

export function ReviewPage({ preset }: { preset: ReviewPreset | null }) {
  const [selection, setSelection] = useState<Selection | null>(preset ? { topic: preset.topic, level: preset.level } : null)
  const [nonce, setNonce] = useState(preset?.nonce ?? 0)

  useEffect(() => {
    if (preset) {
      setSelection({ topic: preset.topic, level: preset.level })
      setNonce(preset.nonce)
    }
  }, [preset])

  if (!selection) return <Picker onPick={(s) => { setSelection(s); setNonce(Date.now()) }} />
  return <Session key={`${selection.topic ?? 'all'}-${selection.level ?? 'all'}-${nonce}`} selection={selection} onBack={() => setSelection(null)} />
}

function Picker({ onPick }: { onPick: (s: Selection) => void }) {
  const d = useDashboard()
  const presets: { title: string; hanzi: string; desc: string; sel: Selection }[] = [
    { title: 'Все слова', hanzi: '全', desc: `${d.dueCount} к повторению · ${d.newAvailable} новых`, sel: {} },
    { title: 'HSK 1', hanzi: '一', desc: '150 слов официального списка', sel: { level: 'hsk1' } },
    { title: 'Деловой', hanzi: '商', desc: 'Переговоры, поставки, деньги', sel: { level: 'business' } },
  ]
  return (
    <div>
      <PageHeader hanzi="卡" title="Карточки" subtitle="Интервальные повторения: алгоритм сам решает, когда показать слово снова" />
      <motion.div variants={stagger} initial="hidden" animate="visible" className="mb-8 grid gap-3 md:grid-cols-3">
        {presets.map((p) => (
          <Card key={p.title} interactive onClick={() => onPick(p.sel)} className="flex items-center gap-4">
            <span className="font-hanzi text-4xl font-bold text-accent">{p.hanzi}</span>
            <div>
              <div className="font-semibold tracking-tight">{p.title}</div>
              <div className="text-xs text-fg-muted">{p.desc}</div>
            </div>
          </Card>
        ))}
      </motion.div>
      <h2 className="mb-3 font-semibold tracking-tight">По темам</h2>
      <TopicGrid topics={d.topics} onPick={(t) => onPick({ topic: t.topic.id })} />
    </div>
  )
}

const GRADES: { g: Grade; title: string; key: string; cls: string }[] = [
  { g: 0, title: 'Забыл', key: '1', cls: 'border-bad/40 text-bad hover:bg-bad-soft' },
  { g: 3, title: 'Трудно', key: '2', cls: 'border-warn/40 text-warn hover:bg-warn/15' },
  { g: 4, title: 'Хорошо', key: '3', cls: 'border-ok/40 text-ok hover:bg-ok-soft' },
  { g: 5, title: 'Легко', key: '4', cls: 'border-tone-4/40 text-tone-4 hover:bg-tone-4/15' },
]

function Session({ selection, onBack }: { selection: Selection; onBack: () => void }) {
  const s = useReviewSession(selection)
  const { settings } = useSettings()
  const { speak } = useSpeech()
  const title = selection.topic ? TOPIC_BY_ID[selection.topic].title : selection.level === 'hsk1' ? 'HSK 1' : selection.level === 'business' ? 'Деловой' : 'Все слова'

  // Автоозвучка при показе новой карточки.
  useEffect(() => {
    if (s.current && settings.autoSpeak) speak(s.current.hanzi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.current?.id])

  // Горячие клавиши: пробел — показать, 1–4 — оценка.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!s.current) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (!s.revealed) s.reveal()
        return
      }
      if (s.revealed) {
        const g = GRADES.find((x) => x.key === e.key)
        if (g) s.grade(g.g)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s])

  if (s.empty) {
    return (
      <div>
        <BackBar title={title} onBack={onBack} />
        <EmptyState
          hanzi="空"
          title="Здесь пока нечего повторять"
          text="Все слова этой группы уже запланированы на будущее. Загляните позже или выберите другую тему."
          action={<Button variant="secondary" onClick={onBack}><ChevronLeft size={16} />К выбору</Button>}
        />
      </div>
    )
  }

  if (s.finished) {
    const total = s.stats.again + s.stats.hard + s.stats.good + s.stats.easy
    return (
      <div>
        <BackBar title={title} onBack={onBack} />
        <motion.div variants={pop} initial="hidden" animate="visible" className="mx-auto max-w-md">
          <Card className="text-center">
            <span className="font-hanzi text-7xl font-bold text-accent">好</span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Сессия завершена</h2>
            <p className="mt-1 text-sm text-fg-muted">{plural(total, 'ответ', 'ответа', 'ответов')} · карточки запланированы</p>
            <div className="mt-6 grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <div key={g.g} className={cn('rounded-xl border p-3', g.cls)}>
                  <div className="text-2xl font-semibold tabular-nums">{s.stats[g.g === 0 ? 'again' : g.g === 3 ? 'hard' : g.g === 4 ? 'good' : 'easy']}</div>
                  <div className="text-[11px] opacity-80">{g.title}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={onBack}><ChevronLeft size={16} />К выбору</Button>
              <Button onClick={s.restart}><RotateCcw size={16} />Ещё раз</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const w = s.current!
  const topic = TOPICS.find((t) => t.id === w.topic)

  return (
    <div>
      <BackBar title={title} onBack={onBack} right={<span className="text-sm text-fg-muted tabular-nums">{s.index} / {s.total}{s.remaining > s.total - s.index + 1 ? ` · +${s.remaining - (s.total - s.index + 1)} повтор` : ''}</span>} />

      {/* Прогресс */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <motion.div
          animate={{ width: `${Math.round(((s.index - 1) / Math.max(1, s.total)) * 100)}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-accent"
        />
      </div>

      {/* Карточка */}
      <div className="mx-auto max-w-xl [perspective:1400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={w.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              onClick={() => !s.revealed && s.reveal()}
              animate={{ rotateY: s.revealed ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn('relative min-h-[380px] transform-3d', !s.revealed && 'cursor-pointer')}
            >
              {/* Лицо */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-line bg-surface p-8 backface-hidden">
                <div className="absolute left-5 top-5 flex items-center gap-2">
                  {topic && <Badge>{topic.title}</Badge>}
                  <Badge tone={w.level === 'business' ? 'warn' : 'info'}>{w.level === 'business' ? 'Деловой' : 'HSK 1'}</Badge>
                </div>
                <span className="font-hanzi text-[96px] font-medium leading-none tracking-wide md:text-[128px]">{w.hanzi}</span>
                {settings.showPinyin && <Pinyin text={w.pinyin} className="mt-6 text-2xl" />}
                <p className="mt-8 text-xs text-fg-faint">Нажмите или пробел, чтобы открыть</p>
                <div className="absolute right-5 top-5">
                  <SpeakButton text={w.hanzi} size="sm" />
                </div>
              </div>

              {/* Оборот */}
              <div className="absolute inset-0 flex flex-col rounded-3xl border border-accent/30 bg-surface p-6 backface-hidden [transform:rotateY(180deg)] md:p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-hanzi text-5xl font-medium md:text-6xl">{w.hanzi}</div>
                    <Pinyin text={w.pinyin} className="mt-2 text-xl" />
                  </div>
                  <SpeakButton text={w.hanzi} />
                </div>
                <div className="mt-5">
                  <div className="text-2xl font-semibold tracking-tight">{w.ru}</div>
                  <div className="mt-1 text-xs text-fg-faint">{w.pos}</div>
                </div>
                <div className="mt-auto rounded-2xl border border-line bg-surface-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-hanzi text-xl">{w.example.hanzi}</div>
                      <Pinyin text={w.example.pinyin} className="mt-1 text-sm" />
                      <div className="mt-1 text-sm text-fg-muted">{w.example.ru}</div>
                    </div>
                    <SpeakButton text={w.example.hanzi} size="sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Оценка */}
        <div className="mt-6 min-h-[88px]">
          <AnimatePresence mode="wait">
            {s.revealed ? (
              <motion.div key="grades" variants={stagger} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-4 gap-2 md:gap-3">
                {GRADES.map((g) => (
                  <motion.button
                    key={g.g}
                    type="button"
                    variants={fadeUp}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => s.grade(g.g)}
                    className={cn('flex flex-col items-center rounded-2xl border bg-surface px-2 py-3 transition-colors duration-200', g.cls)}
                  >
                    <span className="text-sm font-semibold">{g.title}</span>
                    <span className="mt-0.5 text-xs opacity-70 tabular-nums">{s.preview[g.g]}</span>
                    <span className="mt-1 hidden rounded border border-current/30 px-1 text-[10px] opacity-50 md:inline">{g.key}</span>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                <Button size="lg" variant="secondary" onClick={s.reveal} className="w-full md:w-auto">
                  Показать ответ
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function BackBar({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg">
        <ChevronLeft size={16} />
        {title}
      </button>
      {right}
    </div>
  )
}
