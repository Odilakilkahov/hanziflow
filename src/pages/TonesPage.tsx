import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, Play } from 'lucide-react'
import type { Tone } from '@/types'
import { FINALS, INITIALS, TONES } from '@/data/pinyin'
import { useToneTrainer, useSpeech } from '@/hooks'
import { cn } from '@/lib/utils'
import { Badge, Button, Card } from '@/ui'
import { PageHeader } from '@/components/PageHeader'
import { toneClass } from '@/components/Pinyin'
import { fadeUp, stagger } from '@/components/motion'

const SHORT: Record<number, string> = { 1: 'ровный', 2: 'вверх', 3: 'вниз-вверх', 4: 'вниз', 5: 'лёгкий' }

export function TonesPage() {
  const t = useToneTrainer()
  const { speak, isSpeaking } = useSpeech()
  const play = () => speak(t.drill.hanzi ?? t.drill.syllable)

  useEffect(() => {
    play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.drill.id])

  // Горячие клавиши: 1–4 — тон, Enter или пробел — следующий, R — прослушать.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (t.result && (e.key === 'Enter' || e.code === 'Space')) {
        e.preventDefault()
        t.next()
        return
      }
      if (!t.result && /^[1-4]$/.test(e.key)) {
        t.answer(Number(e.key) as 1 | 2 | 3 | 4)
        return
      }
      if (e.key === 'r' || e.key === 'к') play()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.result, t.answer, t.next, t.drill.id])

  const acc = t.total ? Math.round((t.correct / t.total) * 100) : 0

  return (
    <div>
      <PageHeader
        hanzi="声"
        title="Тоны"
        subtitle="Слушайте слог и выбирайте тон. Тоны важнее слов: mǎi — купить, mài — продать."
        right={
          <div className="hidden items-center gap-2 md:flex">
            <Badge tone="accent">серия {t.streak}</Badge>
            <Badge>{t.correct}/{t.total} · {acc}%</Badge>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="flex flex-col items-center p-6 md:p-8">
          <motion.button
            type="button"
            onClick={play}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            animate={isSpeaking ? { boxShadow: ['0 0 0 0 rgba(229,72,77,0.5)', '0 0 0 24px rgba(229,72,77,0)'] } : {}}
            transition={isSpeaking ? { repeat: Infinity, duration: 1 } : undefined}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-white"
            aria-label="Слушать"
          >
            <Play size={40} className="ml-1" />
          </motion.button>
          <p className="mt-4 text-sm text-fg-muted">Нажмите, чтобы прослушать ещё раз</p>

          <AnimatePresence mode="wait">
            {t.result ? (
              <motion.div key={`r-${t.drill.id}`} role="status" aria-live="polite" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6 text-center">
                <div className={cn('font-hanzi text-7xl font-medium', toneClass(t.drill.tone))}>{t.drill.hanzi ?? t.drill.syllable}</div>
                <div className={cn('mt-2 text-3xl font-semibold', toneClass(t.drill.tone))}>{t.drill.syllable}</div>
                <div className="mt-1 text-sm text-fg-muted">{t.drill.ru}</div>
                <div className={cn('mt-4 text-lg font-semibold', t.result.correct ? 'text-ok' : 'text-bad')}>
                  {t.result.correct ? 'Верно!' : `Это был ${t.result.info.tone}-й тон`}
                </div>
                <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">{t.result.info.howTo}</p>
                <Button className="mt-5" onClick={t.next}>
                  Следующий <ArrowRight size={16} />
                </Button>
              </motion.div>
            ) : (
              <motion.div key={`q-${t.drill.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 text-center">
                <div className="font-hanzi text-7xl font-medium text-fg">{t.drill.hanzi ?? '?'}</div>
                <div className="mt-2 text-sm text-fg-faint">Какой тон?</div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-8 grid w-full grid-cols-4 gap-2 md:gap-3">
            {TONES.filter((x) => x.tone !== 5).map((x) => {
              const chosen = t.result?.chosen === x.tone
              const correct = t.result && x.tone === t.drill.tone
              return (
                <motion.button
                  key={x.tone}
                  type="button"
                  variants={fadeUp}
                  disabled={!!t.result}
                  onClick={() => t.answer(x.tone as Tone & (1 | 2 | 3 | 4))}
                  whileHover={t.result ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex flex-col items-center rounded-2xl border bg-surface-2 py-4 transition-colors duration-200',
                    !t.result && 'border-line hover:border-line-strong',
                    correct && 'border-ok bg-ok-soft',
                    chosen && !correct && 'border-bad bg-bad-soft',
                  )}
                >
                  <span className={cn('text-3xl font-bold leading-none', toneClass(x.tone))}>{x.contour}</span>
                  <span className="mt-2 text-sm font-semibold">{x.tone}-й</span>
                  <kbd className="mt-1 hidden rounded border border-current/25 px-1 text-[10px] opacity-50 lg:inline">{x.tone}</kbd>
                  <span className="mt-0.5 hidden w-full truncate px-1 text-center text-[11px] text-fg-faint lg:block">{SHORT[x.tone]}</span>
                </motion.button>
              )
            })}
          </motion.div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card>
            <h3 className="mb-3 text-sm font-semibold tracking-tight">Пять тонов</h3>
            <div className="flex flex-col gap-2.5">
              {TONES.map((x) => (
                <div key={x.tone} className="flex items-start gap-3">
                  <span className={cn('w-8 shrink-0 text-xl font-bold leading-6', toneClass(x.tone))}>{x.contour}</span>
                  <div>
                    <div className={cn('text-sm font-medium', toneClass(x.tone))}>{x.name}</div>
                    <div className="text-xs text-fg-muted">{x.howTo}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex items-center justify-between md:hidden">
            <Badge tone="accent">серия {t.streak}</Badge>
            <Badge>{t.correct}/{t.total} · {acc}%</Badge>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Reference title="Инициали (согласные)" rows={INITIALS.map((i) => [i.initial, i.hint, i.example])} />
        <Reference title="Финали (гласные)" rows={FINALS.map((f) => [f.final, f.hint, f.example])} />
      </div>
    </div>
  )
}

function Reference({ title, rows }: { title: string; rows: [string, string, string][] }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="p-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between p-5 text-left">
        <span className="font-semibold tracking-tight">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={18} className="text-fg-muted" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="divide-y divide-line border-t border-line">
              {rows.map(([a, b, c]) => (
                <div key={a} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-5 py-2 text-sm">
                  <span className="font-semibold text-accent">{a}</span>
                  <span className="text-fg-muted">{b}</span>
                  <span className="font-hanzi text-fg">{c}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
