import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Level, QuizMode, QuizQuestion, QuizResult, TopicId } from '@/types'
import { ALL_WORDS } from '@/data/words'
import { buildQuiz } from '@/lib/quiz'
import { toDateKey } from '@/lib/utils'
import { XP_QUIZ_CORRECT, XP_TONE_CORRECT } from '@/lib/xp'
import { useProgress } from '@/store/useProgress'

export interface QuizOptions {
  topic?: TopicId
  level?: Level
  /** Число вопросов, по умолчанию 10. */
  count?: number
}

export interface QuizSession {
  mode: QuizMode
  question: QuizQuestion | null
  index: number
  total: number
  /** Результат текущего вопроса после ответа, иначе null. */
  result: QuizResult | null
  answer: (optionId: string) => void
  /** Перейти к следующему вопросу (после ответа). */
  next: () => void
  correct: number
  finished: boolean
  /** Процент правильных 0–100. */
  percent: number
  restart: () => void
}

/** Викторина в одном из пяти режимов. Итог записывается в прогресс один раз при завершении. */
export function useQuiz(mode: QuizMode, opts: QuizOptions = {}): QuizSession {
  const recordQuiz = useProgress((s) => s.recordQuiz)
  const count = opts.count ?? 10

  const candidates = useMemo(
    () => ALL_WORDS.filter((w) => (!opts.topic || w.topic === opts.topic) && (!opts.level || w.level === opts.level)),
    [opts.topic, opts.level],
  )

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuiz(mode, candidates, ALL_WORDS, count))
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [saved, setSaved] = useState(false)

  const question = questions[index] ?? null
  const finished = questions.length > 0 && index >= questions.length
  const correct = results.filter((r) => r.correct).length

  const answer = useCallback(
    (optionId: string) => {
      if (!question || result) return
      const r: QuizResult = { questionId: question.id, chosenId: optionId, correct: optionId === question.correctId }
      setResult(r)
      setResults((rs) => [...rs, r])
    },
    [question, result],
  )

  const next = useCallback(() => {
    if (!result) return
    setResult(null)
    setIndex((i) => i + 1)
  }, [result])

  useEffect(() => {
    if (finished && !saved) {
      setSaved(true)
      const perCorrect = mode === 'tone' ? XP_TONE_CORRECT : XP_QUIZ_CORRECT
      recordQuiz({ date: toDateKey(), mode, correct, total: questions.length }, correct * perCorrect)
    }
  }, [finished, saved, mode, correct, questions.length, recordQuiz])

  const restart = useCallback(() => {
    setQuestions(buildQuiz(mode, candidates, ALL_WORDS, count))
    setIndex(0)
    setResults([])
    setResult(null)
    setSaved(false)
  }, [mode, candidates, count])

  return {
    mode,
    question,
    index: Math.min(index + 1, questions.length),
    total: questions.length,
    result,
    answer,
    next,
    correct,
    finished,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    restart,
  }
}
