import { useCallback, useState } from 'react'
import type { Tone, ToneDrill, ToneInfo } from '@/types'
import { TONES, TONE_BY_NUMBER, TONE_DRILLS } from '@/data/pinyin'
import { sample } from '@/lib/utils'
import { XP_TONE_CORRECT } from '@/lib/xp'
import { useProgress } from '@/store/useProgress'

export interface ToneTrainer {
  drill: ToneDrill
  /** Справочник по тонам 1–5 для легенды. */
  tones: ToneInfo[]
  /** Ответ выбран: верно ли и какой тон был. */
  result: { chosen: Tone; correct: boolean; info: ToneInfo } | null
  answer: (tone: Tone) => void
  next: () => void
  /** Верных подряд. */
  streak: number
  correct: number
  total: number
}

function randomDrill(exceptId?: string): ToneDrill {
  const pool = TONE_DRILLS.filter((d) => d.id !== exceptId)
  return sample(pool, 1)[0]
}

/** Бесконечный тренажёр тонов: слушай слог, выбирай тон. */
export function useToneTrainer(): ToneTrainer {
  const addXp = useProgress((s) => s.addXp)
  const [drill, setDrill] = useState<ToneDrill>(() => randomDrill())
  const [result, setResult] = useState<ToneTrainer['result']>(null)
  const [streak, setStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)

  const answer = useCallback(
    (tone: Tone) => {
      if (result) return
      const ok = tone === drill.tone
      setResult({ chosen: tone, correct: ok, info: TONE_BY_NUMBER[drill.tone] })
      setTotal((t) => t + 1)
      if (ok) {
        setCorrect((c) => c + 1)
        setStreak((s) => s + 1)
        addXp(XP_TONE_CORRECT)
      } else {
        setStreak(0)
      }
    },
    [drill, result, addXp],
  )

  const next = useCallback(() => {
    setDrill((d) => randomDrill(d.id))
    setResult(null)
  }, [])

  return { drill, tones: TONES, result, answer, next, streak, correct, total }
}
