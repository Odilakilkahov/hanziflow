import type { Grade } from '@/types'

export const XP_FOR_GRADE: Record<Grade, number> = { 0: 2, 3: 6, 4: 10, 5: 12 }
export const XP_QUIZ_CORRECT = 5
export const XP_TONE_CORRECT = 3
export const XP_SPEAK_GOOD = 15

const TITLES = ['新手 · Новичок', '学生 · Ученик', '旅人 · Путник', '商人 · Торговец', '朋友 · Друг Китая', '大师 · Мастер']

/** Порог XP для уровня n: 100·n². Уровень 1 — с нуля. */
export function xpForLevel(level: number): number {
  return level <= 1 ? 0 : 100 * (level - 1) * (level - 1)
}

export function levelFromXp(xp: number): { number: number; title: string; nextAt: number; progressPercent: number } {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  const start = xpForLevel(level)
  const nextAt = xpForLevel(level + 1)
  const progressPercent = Math.min(100, Math.round(((xp - start) / (nextAt - start)) * 100))
  const title = TITLES[Math.min(TITLES.length - 1, level - 1)]
  return { number: level, title, nextAt, progressPercent }
}
