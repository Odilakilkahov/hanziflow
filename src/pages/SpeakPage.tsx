import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, Mic, Square, Volume2 } from 'lucide-react'
import type { Level } from '@/types'
import { listenErrorText, useSpeakPractice } from '@/hooks'
import { cn } from '@/lib/utils'
import { Badge, Button, Card } from '@/ui'
import { Chip } from '@/components/Chip'
import { PageHeader } from '@/components/PageHeader'
import { Pinyin } from '@/components/Pinyin'
import { pop } from '@/components/motion'

export function SpeakPage() {
  const [sentences, setSentences] = useState(false)
  const [level, setLevel] = useState<Level | null>(null)
  return (
    <div>
      <PageHeader hanzi="说" title="Речь" subtitle="Слушайте эталон, повторяйте вслух — браузер распознает и оценит" />
      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={!sentences} onClick={() => setSentences(false)}>Слова</Chip>
        <Chip active={sentences} onClick={() => setSentences(true)}>Фразы</Chip>
        <span className="mx-1 w-px bg-line" />
        <Chip active={level === null} onClick={() => setLevel(null)}>Все</Chip>
        <Chip active={level === 'hsk1'} onClick={() => setLevel('hsk1')}>HSK 1</Chip>
        <Chip active={level === 'business'} onClick={() => setLevel('business')}>Деловой</Chip>
      </div>
      <Practice key={`${sentences}-${level ?? 'all'}`} sentences={sentences} level={level} />
    </div>
  )
}

function Practice({ sentences, level }: { sentences: boolean; level: Level | null }) {
  const p = useSpeakPractice({ sentences, level: level ?? undefined })
  const { speech } = p
  const err = listenErrorText(speech.error)

  return (
    <div className="mx-auto max-w-xl">
      {!speech.sttAvailable && (
        <div className="mb-4 rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
          Распознавание речи здесь не работает. Откройте приложение в Chrome или Edge — там микрофон поддерживается.
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={p.target.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
          <Card still className="flex flex-col items-center p-6 text-center md:p-8">
            <div className={cn('font-hanzi font-medium', sentences ? 'text-4xl md:text-5xl' : 'text-7xl md:text-8xl')}>
              {p.attempt ? (
                p.attempt.chars.map((c, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={c.ok ? 'text-ok' : 'text-bad'}
                  >
                    {c.char}
                  </motion.span>
                ))
              ) : (
                p.text.hanzi
              )}
            </div>
            <Pinyin text={p.text.pinyin} className="mt-4 text-xl" />
            <div className="mt-1 text-sm text-fg-muted">{p.text.ru}</div>

            <div className="mt-8 flex items-center gap-6">
              <motion.button
                type="button"
                onClick={p.playTarget}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={cn('flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted transition-colors hover:text-fg', speech.isSpeaking && 'border-accent text-accent')}
                aria-label="Прослушать эталон"
              >
                <Volume2 size={24} />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => (speech.isListening ? speech.cancelListening() : void p.record())}
                disabled={!speech.sttAvailable}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                animate={speech.isListening ? { boxShadow: ['0 0 0 0 rgba(229,72,77,0.6)', '0 0 0 28px rgba(229,72,77,0)'] } : { boxShadow: '0 12px 32px -8px rgba(229,72,77,0.7)' }}
                transition={speech.isListening ? { repeat: Infinity, duration: 1.1 } : undefined}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-white disabled:opacity-30"
                aria-label={speech.isListening ? 'Остановить' : 'Записать'}
              >
                {speech.isListening ? <Square size={32} /> : <Mic size={40} />}
              </motion.button>

              <div className="w-14" />
            </div>
            <p className="mt-3 text-xs text-fg-faint">{speech.isListening ? 'Слушаю… говорите' : 'Нажмите микрофон и произнесите'}</p>

            {err && <div className="mt-4 rounded-xl border border-bad/40 bg-bad-soft px-4 py-2 text-sm text-bad">{err}</div>}

            <AnimatePresence>
              {p.attempt && (
                <motion.div role="status" aria-live="polite" variants={pop} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="mt-6 w-full rounded-2xl border border-line bg-surface-2 p-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-fg-muted">Распознано</div>
                    <Badge tone={p.attempt.score >= 80 ? 'ok' : p.attempt.score >= 50 ? 'warn' : 'neutral'}>{p.attempt.score}%</Badge>
                  </div>
                  <div className="font-hanzi mt-1 text-2xl">{p.attempt.heard || <span className="text-sm text-fg-faint">тишина</span>}</div>
                  <div className="mt-3 flex justify-between">
                    <Button variant="secondary" onClick={() => void p.record()}>Ещё раз</Button>
                    <Button onClick={p.next}>Следующее <ArrowRight size={16} /></Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between text-xs text-fg-faint">
        <span>Зачтено {p.passed} из {p.total}</span>
        {!p.attempt && (
          <button type="button" onClick={p.next} className="hover:text-fg">
            Пропустить →
          </button>
        )}
      </div>
    </div>
  )
}
