import type { Syllable, Tone } from '@/types'

/** Гласные с диакритикой → базовая гласная и номер тона. */
const TONED: Record<string, { base: string; tone: Tone }> = {
  ā: { base: 'a', tone: 1 }, á: { base: 'a', tone: 2 }, ǎ: { base: 'a', tone: 3 }, à: { base: 'a', tone: 4 },
  ē: { base: 'e', tone: 1 }, é: { base: 'e', tone: 2 }, ě: { base: 'e', tone: 3 }, è: { base: 'e', tone: 4 },
  ī: { base: 'i', tone: 1 }, í: { base: 'i', tone: 2 }, ǐ: { base: 'i', tone: 3 }, ì: { base: 'i', tone: 4 },
  ō: { base: 'o', tone: 1 }, ó: { base: 'o', tone: 2 }, ǒ: { base: 'o', tone: 3 }, ò: { base: 'o', tone: 4 },
  ū: { base: 'u', tone: 1 }, ú: { base: 'u', tone: 2 }, ǔ: { base: 'u', tone: 3 }, ù: { base: 'u', tone: 4 },
  ǖ: { base: 'ü', tone: 1 }, ǘ: { base: 'ü', tone: 2 }, ǚ: { base: 'ü', tone: 3 }, ǜ: { base: 'ü', tone: 4 },
  Ā: { base: 'A', tone: 1 }, Á: { base: 'A', tone: 2 }, Ǎ: { base: 'A', tone: 3 }, À: { base: 'A', tone: 4 },
  Ē: { base: 'E', tone: 1 }, É: { base: 'E', tone: 2 }, Ě: { base: 'E', tone: 3 }, È: { base: 'E', tone: 4 },
  Ō: { base: 'O', tone: 1 }, Ó: { base: 'O', tone: 2 }, Ǒ: { base: 'O', tone: 3 }, Ò: { base: 'O', tone: 4 },
}

const VOWELS = 'aeiouüAEIOUÜ' + Object.keys(TONED).join('')

/**
 * Один слог: необязательный инициаль (zh/ch/sh или одна согласная),
 * гласные, необязательный носовой финаль ng / n и эризация r.
 * Жадный матч корректно режет "xièxie", "píngguǒ", "diànnǎo", "yìdiǎnr", "nǎr".
 */
const SYLLABLE_RE = new RegExp(
  `(?:zh|ch|sh|[bpmfdtnlgkhjqxzcsryw])?[${VOWELS}]+(?:ng|n)?r?`,
  'gi',
)

/** Номер тона слога по диакритике. Без знака — нейтральный (5). */
export function toneOf(syllable: string): Tone {
  for (const ch of syllable) {
    const t = TONED[ch]
    if (t) return t.tone
  }
  return 5
}

/** Убрать диакритику: "nǐ hǎo" → "ni hao". */
export function stripTones(pinyin: string): string {
  let out = ''
  for (const ch of pinyin) out += TONED[ch]?.base ?? ch
  return out
}

/** Пиньинь с цифрами тонов: "nǐ hǎo" → "ni3 hao3". */
export function toNumbered(pinyin: string): string {
  return splitSyllables(pinyin)
    .map((s) => `${stripTones(s.text)}${s.tone === 5 ? '' : s.tone}`)
    .join(' ')
}

/** Разбить пиньинь слова на слоги с тонами. */
export function splitSyllables(pinyin: string): Syllable[] {
  const out: Syllable[] = []
  const chunks = pinyin.split(/[\s'’]+/).filter(Boolean)
  for (const chunk of chunks) {
    const matches = chunk.match(SYLLABLE_RE)
    if (!matches) {
      out.push({ text: chunk, tone: toneOf(chunk) })
      continue
    }
    for (const m of matches) out.push({ text: m, tone: toneOf(m) })
  }
  return out
}

/** Тоны слова по порядку слогов: "nǐ hǎo" → [3, 3]. */
export function tonesOf(pinyin: string): Tone[] {
  return splitSyllables(pinyin).map((s) => s.tone)
}

/** Нормализация для сравнения ответов: без тонов, без пробелов, нижний регистр, v → ü. */
export function normalizePinyin(input: string): string {
  return stripTones(input).toLowerCase().replace(/v/g, 'ü').replace(/[\s'’]+/g, '')
}

/** Совпадает ли введённый пиньинь с эталоном (тоны не обязательны). */
export function pinyinMatches(answer: string, target: string): boolean {
  return normalizePinyin(answer) === normalizePinyin(target)
}
