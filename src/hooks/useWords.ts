import { useMemo, useState } from 'react'
import type { CardStatus, Level, Topic, TopicId, Word } from '@/types'
import { TOPICS } from '@/data/topics'
import { ALL_WORDS } from '@/data/words'
import { normalizePinyin } from '@/lib/pinyin'
import { statusOf } from '@/lib/srs'
import { useProgress } from '@/store/useProgress'

export interface WordRow {
  word: Word
  status: CardStatus
  /** Через сколько дней следующий показ; null для новых. */
  dueInDays: number | null
}

export interface WordsBrowser {
  rows: WordRow[]
  topics: Topic[]
  search: string
  setSearch: (s: string) => void
  topic: TopicId | null
  setTopic: (t: TopicId | null) => void
  level: Level | null
  setLevel: (l: Level | null) => void
  status: CardStatus | null
  setStatus: (s: CardStatus | null) => void
  total: number
}

export const STATUS_TITLES: Record<CardStatus, string> = {
  new: 'Новое',
  learning: 'Учу',
  review: 'Повторяю',
  mature: 'Знаю',
}

/** Словарь с поиском по иероглифу, пиньиню (без тонов) и русскому переводу. */
export function useWords(): WordsBrowser {
  const cards = useProgress((s) => s.cards)
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState<TopicId | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [status, setStatus] = useState<CardStatus | null>(null)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const qp = normalizePinyin(q)
    const now = Date.now()
    return ALL_WORDS.filter((w) => {
      if (topic && w.topic !== topic) return false
      if (level && w.level !== level) return false
      const st = statusOf(cards[w.id])
      if (status && st !== status) return false
      if (!q) return true
      return w.hanzi.includes(q) || w.ru.toLowerCase().includes(q) || normalizePinyin(w.pinyin).includes(qp)
    }).map<WordRow>((w) => {
      const c = cards[w.id]
      const st = statusOf(c)
      const dueInDays = c && st !== 'new' ? Math.max(0, Math.ceil((c.due - now) / 86_400_000)) : null
      return { word: w, status: st, dueInDays }
    })
  }, [cards, search, topic, level, status])

  return { rows, topics: TOPICS, search, setSearch, topic, setTopic, level, setLevel, status, setStatus, total: ALL_WORDS.length }
}
