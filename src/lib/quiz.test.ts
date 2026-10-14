import { describe, expect, it } from 'vitest'
import { buildQuiz } from './quiz'
import { mulberry32 } from './utils'
import { ALL_WORDS, HSK1 } from '@/data/words'
import type { QuizMode } from '@/types'

const MODES: QuizMode[] = ['meaning', 'hanzi', 'pinyin', 'listening']

describe('buildQuiz', () => {
  it.each(MODES)('%s: 10 вопросов, 4 уникальных варианта, верный есть среди них', (mode) => {
    const qs = buildQuiz(mode, HSK1, ALL_WORDS, 10, mulberry32(42))
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options.map((o) => o.label)).size).toBe(4)
      expect(q.options.some((o) => o.id === q.correctId)).toBe(true)
      expect(q.correctId).toBe(q.word.id)
    }
  })

  it('режим тонов: только односложные слова, 4 варианта тонов, нет нейтрального в ответе', () => {
    const qs = buildQuiz('tone', HSK1, ALL_WORDS, 10, mulberry32(7))
    expect(qs.length).toBe(10)
    for (const q of qs) {
      expect(q.word.hanzi).toHaveLength(1)
      expect(q.options.map((o) => o.id)).toEqual(['1', '2', '3', '4'])
      expect(['1', '2', '3', '4']).toContain(q.correctId)
      expect(q.speak).toBe(q.word.hanzi)
    }
  })

  it('вопросы не повторяются и воспроизводимы при одном seed', () => {
    const a = buildQuiz('meaning', HSK1, ALL_WORDS, 20, mulberry32(1))
    const b = buildQuiz('meaning', HSK1, ALL_WORDS, 20, mulberry32(1))
    expect(new Set(a.map((q) => q.word.id)).size).toBe(20)
    expect(a.map((q) => q.word.id)).toEqual(b.map((q) => q.word.id))
  })

  it('словарь: id уникальны, HSK1 ≥ 150 слов', () => {
    expect(new Set(ALL_WORDS.map((w) => w.id)).size).toBe(ALL_WORDS.length)
    expect(HSK1.length).toBeGreaterThanOrEqual(150)
  })
})
