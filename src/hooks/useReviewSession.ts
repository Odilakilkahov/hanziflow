import { useCallback, useMemo, useState } from 'react'
import type { Grade, IntervalPreview, Level, ReviewStats, TopicId, Word } from '@/types'
import { ALL_WORDS, WORD_BY_ID } from '@/data/words'
import { buildQueue, newCard, previewIntervals } from '@/lib/srs'
import { useProgress } from '@/store/useProgress'

export interface ReviewSessionOptions {
  topic?: TopicId
  level?: Level
}

export interface ReviewSession {
  /** Текущее слово или null, если очередь пуста/сессия закончена. */
  current: Word | null
  /** Показан ли ответ (обратная сторона). */
  revealed: boolean
  reveal: () => void
  /** Оценить и перейти к следующей. «Забыл» возвращает карточку в конец очереди. */
  grade: (g: Grade) => void
  /** Через сколько вернётся карточка при каждой оценке. */
  preview: IntervalPreview
  /** Позиция в сессии (1-based) и размер очереди. */
  index: number
  total: number
  /** Сколько осталось в очереди, включая текущую. */
  remaining: number
  stats: ReviewStats
  finished: boolean
  /** Очередь пуста с самого начала: нечего повторять и новых нет. */
  empty: boolean
  restart: () => void
}

function initialQueue(opts: ReviewSessionOptions, cards: ReturnType<typeof useProgress.getState>['cards'], newPerDay: number): string[] {
  const ids = ALL_WORDS.filter((w) => (!opts.topic || w.topic === opts.topic) && (!opts.level || w.level === opts.level)).map((w) => w.id)
  return buildQueue(ids, cards, newPerDay)
}

/** Сессия карточек с интервальным повторением. */
export function useReviewSession(opts: ReviewSessionOptions = {}): ReviewSession {
  const recordReview = useProgress((s) => s.recordReview)
  const cards = useProgress((s) => s.cards)
  const newPerDay = useProgress((s) => s.settings.newPerDay)

  const [queue, setQueue] = useState<string[]>(() => initialQueue(opts, useProgress.getState().cards, newPerDay))
  const [initialSize, setInitialSize] = useState(queue.length)
  const [done, setDone] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState<ReviewStats>({ again: 0, hard: 0, good: 0, easy: 0 })

  const currentId = queue[0]
  const current = currentId ? WORD_BY_ID[currentId] ?? null : null

  const preview = useMemo<IntervalPreview>(() => {
    if (!currentId) return { 0: '—', 3: '—', 4: '—', 5: '—' }
    return previewIntervals(cards[currentId] ?? newCard(currentId))
  }, [cards, currentId])

  const reveal = useCallback(() => setRevealed(true), [])

  const grade = useCallback(
    (g: Grade) => {
      if (!currentId) return
      recordReview(currentId, g)
      setStats((s) => ({
        again: s.again + (g === 0 ? 1 : 0),
        hard: s.hard + (g === 3 ? 1 : 0),
        good: s.good + (g === 4 ? 1 : 0),
        easy: s.easy + (g === 5 ? 1 : 0),
      }))
      setQueue((q) => {
        const rest = q.slice(1)
        // «Забыл» — повторить ещё раз в этой же сессии, ближе к концу.
        return g === 0 ? [...rest, currentId] : rest
      })
      if (g !== 0) setDone((d) => d + 1)
      setRevealed(false)
    },
    [currentId, recordReview],
  )

  const restart = useCallback(() => {
    const q = initialQueue(opts, useProgress.getState().cards, newPerDay)
    setQueue(q)
    setInitialSize(q.length)
    setDone(0)
    setRevealed(false)
    setStats({ again: 0, hard: 0, good: 0, easy: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.topic, opts.level, newPerDay])

  return {
    current,
    revealed,
    reveal,
    grade,
    preview,
    index: Math.min(done + 1, Math.max(initialSize, 1)),
    total: initialSize,
    remaining: queue.length,
    stats,
    finished: initialSize > 0 && queue.length === 0,
    empty: initialSize === 0,
    restart,
  }
}
