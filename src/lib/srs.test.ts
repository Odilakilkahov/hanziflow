import { describe, expect, it } from 'vitest'
import { buildQueue, countDue, formatInterval, newCard, previewIntervals, schedule, statusOf } from './srs'

const DAY = 86_400_000
const NOW = 1_800_000_000_000

describe('schedule (SM-2)', () => {
  it('новая карточка: «хорошо» → 1 день, «легко» → 4 дня', () => {
    const c = newCard('w', NOW)
    expect(schedule(c, 4, NOW).interval).toBe(1)
    expect(schedule(c, 5, NOW).interval).toBe(4)
  })

  it('новая карточка: «трудно» → ещё раз через час, интервал 0', () => {
    const c = schedule(newCard('w', NOW), 3, NOW)
    expect(c.interval).toBe(0)
    expect(c.due - NOW).toBe(60 * 60_000)
  })

  it('«забыл» сбрасывает интервал, считает lapse, показ через 10 минут', () => {
    let c = newCard('w', NOW)
    c = schedule(c, 4, NOW)
    c = schedule(c, 4, NOW + DAY)
    const f = schedule(c, 0, NOW + 7 * DAY)
    expect(f.interval).toBe(0)
    expect(f.reps).toBe(0)
    expect(f.lapses).toBe(1)
    expect(f.due - (NOW + 7 * DAY)).toBe(10 * 60_000)
  })

  it('интервалы растут при серии «хорошо» и лёгкость не падает ниже 1.3', () => {
    let c = newCard('w', NOW)
    const intervals: number[] = []
    let t = NOW
    for (let i = 0; i < 6; i++) {
      c = schedule(c, 4, t)
      intervals.push(c.interval)
      t = c.due
    }
    for (let i = 1; i < intervals.length; i++) expect(intervals[i]).toBeGreaterThan(intervals[i - 1])
    for (let i = 0; i < 20; i++) c = schedule(c, 0, t)
    expect(c.ease).toBeGreaterThanOrEqual(1.3)
  })

  it('«легко» даёт интервал больше, чем «хорошо»', () => {
    let c = newCard('w', NOW)
    c = schedule(c, 4, NOW)
    c = schedule(c, 4, c.due)
    const good = schedule(c, 4, c.due).interval
    const easy = schedule(c, 5, c.due).interval
    expect(easy).toBeGreaterThan(good)
  })
})

describe('statusOf / queue', () => {
  it('статусы: new → learning → review → mature', () => {
    let c = newCard('w', NOW)
    expect(statusOf(c)).toBe('new')
    expect(statusOf(undefined)).toBe('new')
    c = schedule(c, 3, NOW)
    expect(statusOf(c)).toBe('learning')
    c = schedule(c, 4, NOW)
    expect(statusOf(c)).toBe('review')
    c = { ...c, interval: 30 }
    expect(statusOf(c)).toBe('mature')
  })

  it('buildQueue: просроченные первыми по сроку, затем новые до лимита', () => {
    const a = { ...schedule(newCard('a', NOW), 4, NOW), due: NOW - 2 * DAY }
    const b = { ...schedule(newCard('b', NOW), 4, NOW), due: NOW - 5 * DAY }
    const future = { ...schedule(newCard('f', NOW), 4, NOW), due: NOW + 3 * DAY }
    const q = buildQueue(['n1', 'a', 'n2', 'b', 'f', 'n3'], { a, b, f: future }, 2, NOW)
    expect(q).toEqual(['b', 'a', 'n1', 'n2'])
    expect(countDue({ a, b, f: future }, NOW)).toBe(2)
  })
})

describe('formatting', () => {
  it('formatInterval', () => {
    expect(formatInterval(10 * 60_000)).toBe('10 мин')
    expect(formatInterval(3 * 3_600_000)).toBe('3 ч')
    expect(formatInterval(4 * DAY)).toBe('4 д')
    expect(formatInterval(21 * DAY)).toBe('3 нед')
    expect(formatInterval(90 * DAY)).toBe('3 мес')
  })

  it('previewIntervals даёт подпись для каждой оценки', () => {
    const p = previewIntervals(newCard('w', NOW), NOW)
    expect(p[0]).toBe('10 мин')
    expect(p[3]).toBe('1 ч')
    expect(p[4]).toBe('1 д')
    expect(p[5]).toBe('4 д')
  })
})
