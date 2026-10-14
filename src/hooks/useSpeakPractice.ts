import { useCallback, useState } from 'react'
import type { Level, SpeakAttempt, TopicId, Word } from '@/types'
import { ALL_WORDS } from '@/data/words'
import { compareHanzi } from '@/lib/speech'
import { sample } from '@/lib/utils'
import { XP_SPEAK_GOOD } from '@/lib/xp'
import { useProgress } from '@/store/useProgress'
import { useSpeech, type Speech } from './useSpeech'

export interface SpeakPracticeOptions {
  topic?: TopicId
  level?: Level
  /** Тренировать фразы-примеры вместо отдельных слов. */
  sentences?: boolean
}

export interface SpeakPractice {
  target: Word
  /** Что именно надо произнести: слово или пример. */
  text: { hanzi: string; pinyin: string; ru: string }
  attempt: SpeakAttempt | null
  /** Озвучить эталон. */
  playTarget: () => void
  /** Записать и оценить. */
  record: () => Promise<void>
  next: () => void
  speech: Speech
  /** Попыток с результатом 80+. */
  passed: number
  total: number
}

const PASS_SCORE = 80

function pick(opts: SpeakPracticeOptions, exceptId?: string): Word {
  const pool = ALL_WORDS.filter(
    (w) => w.id !== exceptId && (!opts.topic || w.topic === opts.topic) && (!opts.level || w.level === opts.level),
  )
  return sample(pool.length ? pool : ALL_WORDS, 1)[0]
}

/** Разговорная практика: слушаешь эталон, повторяешь, браузер распознаёт и сравнивает. */
export function useSpeakPractice(opts: SpeakPracticeOptions = {}): SpeakPractice {
  const addXp = useProgress((s) => s.addXp)
  const speech = useSpeech()
  const [target, setTarget] = useState<Word>(() => pick(opts))
  const [attempt, setAttempt] = useState<SpeakAttempt | null>(null)
  const [passed, setPassed] = useState(0)
  const [total, setTotal] = useState(0)

  const text = opts.sentences ? target.example : { hanzi: target.hanzi, pinyin: target.pinyin, ru: target.ru }

  const playTarget = useCallback(() => speech.speak(text.hanzi), [speech, text.hanzi])

  const record = useCallback(async () => {
    speech.stop()
    const heard = await speech.listen()
    const { score, chars } = compareHanzi(heard, text.hanzi)
    setAttempt({ target, heard, score, chars })
    setTotal((t) => t + 1)
    if (score >= PASS_SCORE) {
      setPassed((p) => p + 1)
      addXp(XP_SPEAK_GOOD)
    }
  }, [speech, text.hanzi, target, addXp])

  const next = useCallback(() => {
    setTarget((t) => pick(opts, t.id))
    setAttempt(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.topic, opts.level, opts.sentences])

  return { target, text, attempt, playTarget, record, next, speech, passed, total }
}
