import { describe, expect, it } from 'vitest'
import { compareHanzi, onlyHanzi } from './speech'
import { levelFromXp } from './xp'

describe('compareHanzi', () => {
  it('полное совпадение — 100', () => {
    expect(compareHanzi('你好', '你好').score).toBe(100)
    expect(compareHanzi('你好。', '你好').score).toBe(100)
  })
  it('частичное совпадение считает по иероглифам', () => {
    const r = compareHanzi('你们好', '你好吗')
    expect(r.score).toBe(67)
    expect(r.chars.map((c) => c.ok)).toEqual([true, true, false])
  })
  it('пусто — 0', () => {
    expect(compareHanzi('', '你好').score).toBe(0)
    expect(onlyHanzi('abc, 你 好!')).toBe('你好')
  })
})

describe('levelFromXp', () => {
  it('уровни растут по 100·n²', () => {
    expect(levelFromXp(0).number).toBe(1)
    expect(levelFromXp(99).number).toBe(1)
    expect(levelFromXp(100).number).toBe(2)
    expect(levelFromXp(400).number).toBe(3)
    expect(levelFromXp(50).progressPercent).toBe(50)
  })
})
