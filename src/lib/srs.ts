import type { CardStatus, Grade, IntervalPreview, SrsCard } from '@/types'

const MINUTE = 60_000
const DAY = 86_400_000

export const MIN_EASE = 1.3
export const START_EASE = 2.5
/** Карточка считается «зрелой» с интервала 21 день (как в Anki). */
export const MATURE_DAYS = 21

export function newCard(wordId: string, now: number = Date.now()): SrsCard {
  return { wordId, ease: START_EASE, interval: 0, reps: 0, lapses: 0, due: now, lastReview: null }
}

export function statusOf(card: SrsCard | undefined): CardStatus {
  if (!card || card.lastReview === null) return 'new'
  if (card.interval === 0) return 'learning'
  if (card.interval >= MATURE_DAYS) return 'mature'
  return 'review'
}

export function isDue(card: SrsCard, now: number = Date.now()): boolean {
  return card.due <= now
}

function nextEase(ease: number, grade: Grade): number {
  // Классическая формула SM-2: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  const q = grade
  const e = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  return Math.max(MIN_EASE, Math.round(e * 100) / 100)
}

/**
 * Чистая функция планирования. Возвращает новую карточку.
 * 0 — забыл: интервал сбрасывается, показ через 10 минут.
 * 3 — трудно: интервал ×1.2, лёгкость падает.
 * 4 — хорошо: интервал ×ease.
 * 5 — легко: интервал ×ease×1.3, лёгкость растёт.
 */
export function schedule(card: SrsCard, grade: Grade, now: number = Date.now()): SrsCard {
  const ease = nextEase(card.ease, grade)

  if (grade === 0) {
    return {
      ...card,
      ease,
      interval: 0,
      reps: 0,
      lapses: card.lapses + 1,
      due: now + 10 * MINUTE,
      lastReview: now,
    }
  }

  let interval: number
  if (card.interval === 0) {
    // Первое успешное повторение.
    interval = grade === 5 ? 4 : grade === 4 ? 1 : 1
    if (grade === 3 && card.reps === 0) {
      // «Трудно» на новой карточке: ещё раз сегодня, через 1 час.
      return { ...card, ease, interval: 0, reps: card.reps + 1, due: now + 60 * MINUTE, lastReview: now }
    }
  } else if (card.reps === 1 && grade !== 3) {
    interval = grade === 5 ? Math.max(6, Math.round(card.interval * ease)) : 6
  } else {
    const factor = grade === 3 ? 1.2 : grade === 4 ? ease : ease * 1.3
    interval = Math.max(card.interval + 1, Math.round(card.interval * factor))
  }

  return {
    ...card,
    ease,
    interval,
    reps: card.reps + 1,
    due: now + interval * DAY,
    lastReview: now,
  }
}

/** Человекочитаемый интервал: «10 мин», «1 д», «3 нед», «2 мес». */
export function formatInterval(ms: number): string {
  const min = ms / MINUTE
  if (min < 60) return `${Math.max(1, Math.round(min))} мин`
  const hours = min / 60
  if (hours < 24) return `${Math.round(hours)} ч`
  const days = hours / 24
  if (days < 14) return `${Math.round(days)} д`
  if (days < 60) return `${Math.round(days / 7)} нед`
  if (days < 365) return `${Math.round(days / 30)} мес`
  return `${(days / 365).toFixed(1)} г`
}

/** Что покажем на кнопках оценки: через сколько карточка вернётся. */
export function previewIntervals(card: SrsCard, now: number = Date.now()): IntervalPreview {
  const grades: Grade[] = [0, 3, 4, 5]
  const out = {} as IntervalPreview
  for (const g of grades) out[g] = formatInterval(schedule(card, g, now).due - now)
  return out
}

/**
 * Собрать очередь на сессию: сначала просроченные (самые старые первыми),
 * затем до `newLimit` новых слов в порядке списка.
 */
export function buildQueue(
  wordIds: readonly string[],
  cards: Record<string, SrsCard>,
  newLimit: number,
  now: number = Date.now(),
): string[] {
  const due: SrsCard[] = []
  const fresh: string[] = []
  for (const id of wordIds) {
    const c = cards[id]
    if (!c || c.lastReview === null) fresh.push(id)
    else if (isDue(c, now)) due.push(c)
  }
  due.sort((a, b) => a.due - b.due)
  return [...due.map((c) => c.wordId), ...fresh.slice(0, Math.max(0, newLimit))]
}

export function countDue(cards: Record<string, SrsCard>, now: number = Date.now()): number {
  let n = 0
  for (const c of Object.values(cards)) if (c.lastReview !== null && isDue(c, now)) n++
  return n
}
