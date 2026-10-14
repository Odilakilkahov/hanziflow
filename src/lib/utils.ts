import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Склейка Tailwind-классов без конфликтов. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Дата в формате YYYY-MM-DD по локальному времени. */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Сдвиг даты на n дней. */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** Разница в календарных днях между двумя ключами дат. */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`)
  const db = new Date(`${b}T00:00:00`)
  return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

/** Детерминированное перемешивание (Fisher–Yates) с опциональным генератором. */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Случайные n элементов без повторов. */
export function sample<T>(arr: readonly T[], n: number, rand: () => number = Math.random): T[] {
  return shuffle(arr, rand).slice(0, n)
}

/** Простой seeded-генератор для воспроизводимых тестов. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RU_DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export function weekdayLabel(d: Date): string {
  return RU_DAYS[d.getDay()]
}

/** Склонение: 1 слово, 2 слова, 5 слов. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`
  return `${n} ${many}`
}
