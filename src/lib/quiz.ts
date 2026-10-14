import type { QuizMode, QuizOption, QuizQuestion, Tone, Word } from '@/types'
import { TONE_BY_NUMBER } from '@/data/pinyin'
import { sample, shuffle, splitSyllables } from './index'

const OPTIONS_PER_QUESTION = 4

/** Подобрать отвлекающие варианты: сначала та же тема и часть речи, потом любые. */
function pickDistractors(word: Word, pool: readonly Word[], labelOf: (w: Word) => string, rand: () => number): Word[] {
  const seen = new Set<string>([labelOf(word)])
  const out: Word[] = []
  const tiers = [
    pool.filter((w) => w.id !== word.id && w.topic === word.topic && w.pos === word.pos),
    pool.filter((w) => w.id !== word.id && w.topic === word.topic),
    pool.filter((w) => w.id !== word.id),
  ]
  for (const tier of tiers) {
    for (const cand of shuffle(tier, rand)) {
      const label = labelOf(cand)
      if (seen.has(label)) continue
      seen.add(label)
      out.push(cand)
      if (out.length >= OPTIONS_PER_QUESTION - 1) return out
    }
  }
  return out
}

function toOption(w: Word, mode: QuizMode): QuizOption {
  switch (mode) {
    case 'meaning':
      return { id: w.id, label: w.ru }
    case 'hanzi':
    case 'listening':
      return { id: w.id, label: w.hanzi, sub: w.pinyin }
    case 'pinyin':
      return { id: w.id, label: w.pinyin }
    case 'tone':
      return { id: w.id, label: w.hanzi }
  }
}

function labelFor(mode: QuizMode): (w: Word) => string {
  if (mode === 'meaning') return (w) => w.ru
  if (mode === 'pinyin') return (w) => w.pinyin
  return (w) => w.hanzi
}

function toneQuestion(word: Word, index: number): QuizQuestion {
  const tone = splitSyllables(word.pinyin)[0]?.tone ?? 5
  const options: QuizOption[] = ([1, 2, 3, 4] as Tone[]).map((t) => ({
    id: String(t),
    label: `${t}-й тон ${TONE_BY_NUMBER[t].contour}`,
    sub: TONE_BY_NUMBER[t].name,
  }))
  return {
    id: `q-${index}-${word.id}`,
    mode: 'tone',
    word,
    prompt: word.hanzi,
    promptSub: 'Какой тон вы слышите?',
    speak: word.hanzi,
    options,
    correctId: String(tone === 5 ? 1 : tone),
  }
}

export function buildQuestion(word: Word, mode: QuizMode, pool: readonly Word[], index: number, rand: () => number): QuizQuestion {
  if (mode === 'tone') return toneQuestion(word, index)

  const distractors = pickDistractors(word, pool, labelFor(mode), rand)
  const options = shuffle([word, ...distractors].map((w) => toOption(w, mode)), rand)

  const base = { id: `q-${index}-${word.id}`, mode, word, options, correctId: word.id }
  switch (mode) {
    case 'meaning':
      return { ...base, prompt: word.hanzi, promptSub: word.pinyin }
    case 'hanzi':
      return { ...base, prompt: word.ru, promptSub: word.pos }
    case 'pinyin':
      return { ...base, prompt: word.hanzi, promptSub: word.ru }
    case 'listening':
      return { ...base, prompt: '', promptSub: 'Нажмите, чтобы прослушать', speak: word.hanzi }
  }
}

/**
 * Собрать викторину. Для режима тонов берутся только односложные слова.
 * `pool` — откуда брать отвлекающие варианты; `candidates` — из чего выбирать вопросы.
 */
export function buildQuiz(
  mode: QuizMode,
  candidates: readonly Word[],
  pool: readonly Word[],
  count: number,
  rand: () => number = Math.random,
): QuizQuestion[] {
  const eligible = mode === 'tone' ? candidates.filter((w) => splitSyllables(w.pinyin).length === 1 && w.hanzi.length === 1) : candidates
  const picked = sample(eligible, Math.min(count, eligible.length), rand)
  return picked.map((w, i) => buildQuestion(w, mode, pool, i, rand))
}

export const QUIZ_MODES: { mode: QuizMode; title: string; description: string; icon: string }[] = [
  { mode: 'meaning', title: 'Перевод', description: 'Видишь иероглиф — выбери значение', icon: 'Languages' },
  { mode: 'hanzi', title: 'Иероглиф', description: 'Видишь перевод — найди иероглиф', icon: 'Type' },
  { mode: 'pinyin', title: 'Пиньинь', description: 'Как читается этот иероглиф', icon: 'SpellCheck' },
  { mode: 'listening', title: 'Слушание', description: 'Слушай и выбирай, что услышал', icon: 'Headphones' },
  { mode: 'tone', title: 'Тоны', description: 'Определи тон на слух', icon: 'AudioWaveform' },
]
