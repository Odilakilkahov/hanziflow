import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, Play, RotateCcw, X } from 'lucide-react'
import type { Level, QuizMode } from '@/types'
import { useQuiz, useSpeech } from '@/hooks'
import { QUIZ_MODES } from '@/lib/quiz'
import { cn } from '@/lib/utils'
import { Button, Card } from '@/ui'
import { Chip } from '@/components/Chip'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { Pinyin } from '@/components/Pinyin'
import { ProgressRing } from '@/components/ProgressRing'
import { fadeUp, pop, stagger } from '@/components/motion'

export function QuizPage() {
  const [mode, setMode] = useState<QuizMode | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [nonce, setNonce] = useState(0)

  if (!mode) {
    return (
      <div>
        <PageHeader hanzi="考" title="Викторина" subtitle="Пять режимов: перевод, иероглиф, пиньинь, слушание, тоны" />
        <div className="mb-5 flex gap-2">
          <Chip active={level === null} onClick={() => setLevel(null)}>Все слова</Chip>
          <Chip active={level === 'hsk1'} onClick={() => setLevel('hsk1')}>HSK 1</Chip>
          <Chip active={level === 'business'} onClick={() => setLevel('business')}>Деловой</Chip>
        </div>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUIZ_MODES.map((m) => (
            <Card key={m.mode} interactive onClick={() => { setMode(m.mode); setNonce((n) => n + 1) }} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon name={m.icon} size={22} />
              </span>
              <div>
                <div className="font-semibold tracking-tight">{m.title}</div>
                <div className="mt-0.5 text-sm text-fg-muted">{m.description}</div>
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
    )
  }

  return <Runner key={`${mode}-${level ?? 'all'}-${nonce}`} mode={mode} level={level} onBack={() => setMode(null)} />
}

function Runner({ mode, level, onBack }: { mode: QuizMode; level: Level | null; onBack: () => void }) {
  const q = useQuiz(mode, { level: level ?? undefined, count: 10 })
  const { speak } = useSpeech()
  const info = QUIZ_MODES.find((m) => m.mode === mode)!

  useEffect(() => {
    if (q.question?.speak) speak(q.question.speak)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.question?.id])

  // Горячие клавиши: 1–4 — вариант, Enter или пробел — дальше, R — прослушать ещё раз.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q.question || q.finished) return
      if (e.target instanceof HTMLInputElement) return
      if (q.result && (e.key === 'Enter' || e.code === 'Space')) {
        e.preventDefault()
        q.next()
        return
      }
      if (!q.result && /^[1-4]$/.test(e.key)) {
        const opt = q.question.options[Number(e.key) - 1]
        if (opt) q.answer(opt.id)
        return
      }
      if ((e.key === 'r' || e.key === 'к') && q.question.speak) speak(q.question.speak)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, speak])

  if (q.finished) {
    const good = q.percent >= 80
    return (
      <div>
        <Bar title={info.title} onBack={onBack} />
        <motion.div variants={pop} initial="hidden" animate="visible" className="mx-auto max-w-md">
          <Card className="flex flex-col items-center text-center">
            <ProgressRing percent={q.percent} size={140} stroke={10} color={good ? 'var(--color-ok)' : 'var(--color-accent)'}>
              <div>
                <div className="text-4xl font-semibold tabular-nums">{q.percent}%</div>
                <div className="text-[11px] text-fg-faint">{q.correct} из {q.total}</div>
              </div>
            </ProgressRing>
            <span className="font-hanzi mt-5 text-4xl font-bold text-accent">{good ? '很好' : q.percent >= 50 ? '不错' : '加油'}</span>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{good ? 'Отлично!' : q.percent >= 50 ? 'Неплохо' : 'Ещё потренируемся'}</h2>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={onBack}><ChevronLeft size={16} />К режимам</Button>
              <Button onClick={q.restart}><RotateCcw size={16} />Ещё раз</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  const question = q.question
  if (!question) return null

  return (
    <div>
      <Bar title={info.title} onBack={onBack} right={<span className="text-sm text-fg-muted tabular-nums">{q.index} / {q.total}</span>} />
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <motion.div animate={{ width: `${((q.index - 1) / q.total) * 100}%` }} transition={{ duration: 0.4 }} className="h-full rounded-full bg-accent" />
      </div>

      <div className="mx-auto max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div key={question.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <Card still className="flex min-h-[200px] flex-col items-center justify-center text-center">
              {question.speak ? (
                <motion.button
                  type="button"
                  onClick={() => speak(question.speak!)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white shadow-[0_12px_32px_-8px_rgba(229,72,77,0.7)]"
                  aria-label="Прослушать"
                >
                  <Play size={32} className="ml-1" />
                </motion.button>
              ) : null}
              {question.prompt && (
                <div className={cn('font-hanzi font-medium', mode === 'hanzi' ? 'font-sans text-3xl md:text-4xl' : 'text-7xl md:text-8xl', question.speak && 'mt-4')}>
                  {question.prompt}
                </div>
              )}
              {question.promptSub && (
                mode === 'meaning' ? <Pinyin text={question.promptSub} className="mt-3 text-xl" /> : <div className="mt-3 text-sm text-fg-muted">{question.promptSub}</div>
              )}
            </Card>

            <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {question.options.map((o, i) => {
                const chosen = q.result?.chosenId === o.id
                const correct = o.id === question.correctId
                const show = !!q.result
                return (
                  <motion.button
                    key={o.id}
                    type="button"
                    variants={fadeUp}
                    disabled={show}
                    onClick={() => q.answer(o.id)}
                    whileHover={show ? undefined : { scale: 1.02 }}
                    whileTap={show ? undefined : { scale: 0.97 }}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-2xl border bg-surface px-4 py-3.5 text-left transition-colors duration-200',
                      !show && 'border-line hover:border-line-strong hover:bg-surface-2',
                      show && correct && 'border-ok bg-ok-soft',
                      show && chosen && !correct && 'border-bad bg-bad-soft',
                      show && !chosen && !correct && 'border-line opacity-50',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <kbd className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 font-sans text-[11px] text-fg-faint md:inline-flex">{i + 1}</kbd>
                      <div className="min-w-0">
                        <div className={cn('font-medium', (mode === 'hanzi' || mode === 'listening') && 'font-hanzi text-2xl')}>
                          {mode === 'pinyin' ? <Pinyin text={o.label} className="text-lg" /> : o.label}
                        </div>
                        {o.sub && (mode === 'hanzi' || mode === 'listening' ? <Pinyin text={o.sub} className="text-xs" /> : <div className="text-xs text-fg-muted">{o.sub}</div>)}
                      </div>
                    </div>
                    {show && correct && <Check size={18} className="shrink-0 text-ok" />}
                    {show && chosen && !correct && <X size={18} className="shrink-0 text-bad" />}
                  </motion.button>
                )
              })}
            </motion.div>

            <AnimatePresence>
              {q.result && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm">
                    <span className={cn('font-semibold', q.result.correct ? 'text-ok' : 'text-bad')}>{q.result.correct ? 'Верно!' : 'Неверно.'}</span>{' '}
                    <span className="font-hanzi">{question.word.hanzi}</span> · <Pinyin text={question.word.pinyin} /> · <span className="text-fg-muted">{question.word.ru}</span>
                  </div>
                  <Button onClick={q.next} className="shrink-0">
                    Дальше <ArrowRight size={16} />
                    <kbd className="ml-1 hidden rounded border border-white/30 px-1 text-[10px] font-normal opacity-70 md:inline">↵</kbd>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Bar({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
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
