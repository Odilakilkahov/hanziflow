/**
 * HanziFlow — контракт данных.
 * Зона Claude. Codex импортирует типы отсюда и не меняет их.
 */

/** Тон: 1–4 основные, 5 — нейтральный (лёгкий). */
export type Tone = 1 | 2 | 3 | 4 | 5

/** Уровень словаря. */
export type Level = 'hsk1' | 'business'

/** Темы слов. id используется в фильтрах и прогрессе по темам. */
export type TopicId =
  | 'greetings'
  | 'pronouns'
  | 'numbers'
  | 'time'
  | 'family'
  | 'people'
  | 'food'
  | 'places'
  | 'things'
  | 'verbs'
  | 'adjectives'
  | 'grammar'
  | 'questions'
  | 'business'

export interface Topic {
  id: TopicId
  /** Название на русском. */
  title: string
  /** Короткое описание для карточки темы. */
  description: string
  /** Имя иконки Lucide (строкой, компонент выбирает сам). */
  icon: string
  /** Иероглиф-эмблема темы. */
  emblem: string
}

export interface Example {
  hanzi: string
  pinyin: string
  ru: string
}

export interface Word {
  /** Стабильный id, например "hsk1-001". */
  id: string
  hanzi: string
  /** Пиньинь с диакритикой тонов: "nǐ hǎo". */
  pinyin: string
  /** Перевод на русский. Первый вариант — основной. */
  ru: string
  /** Часть речи коротко: сущ., гл., прил., нареч., част., числ., мест., сч. сл. */
  pos: string
  topic: TopicId
  level: Level
  example: Example
}

/** Один слог пиньиня, разобранный для подсветки тонов. */
export interface Syllable {
  text: string
  tone: Tone
}

/* ---------- Интервальные повторения (SM-2) ---------- */

/** Оценка ответа: 0 — забыл, 3 — трудно, 4 — хорошо, 5 — легко. */
export type Grade = 0 | 3 | 4 | 5

export type CardStatus = 'new' | 'learning' | 'review' | 'mature'

export interface SrsCard {
  wordId: string
  /** Коэффициент лёгкости, старт 2.5, минимум 1.3. */
  ease: number
  /** Интервал в днях (0 — ещё в стадии изучения). */
  interval: number
  /** Число успешных повторений подряд. */
  reps: number
  /** Сколько раз забыл. */
  lapses: number
  /** Время следующего показа, ms since epoch. */
  due: number
  /** Время последнего ответа. */
  lastReview: number | null
}

export interface ReviewStats {
  again: number
  hard: number
  good: number
  easy: number
}

/** Подсказка «через сколько покажем снова» для каждой кнопки оценки. */
export type IntervalPreview = Record<Grade, string>

/* ---------- Викторина ---------- */

export type QuizMode =
  | 'meaning' // иероглиф → перевод
  | 'hanzi' // перевод → иероглиф
  | 'pinyin' // иероглиф → пиньинь
  | 'listening' // озвучка → иероглиф
  | 'tone' // озвучка слога → тон

export interface QuizOption {
  id: string
  label: string
  /** Дополнительная строка под вариантом (пиньинь для иероглифа и т.п.). */
  sub?: string
}

export interface QuizQuestion {
  id: string
  mode: QuizMode
  word: Word
  /** Что показываем в вопросе: иероглиф, перевод или ничего (слушание). */
  prompt: string
  /** Подстрока под вопросом (пиньинь при режиме meaning и т.п.). */
  promptSub?: string
  /** Текст, который надо озвучить при показе вопроса (режимы listening/tone). */
  speak?: string
  options: QuizOption[]
  correctId: string
}

export interface QuizResult {
  questionId: string
  chosenId: string
  correct: boolean
}

export interface QuizSummary {
  date: string
  mode: QuizMode
  correct: number
  total: number
}

/* ---------- Тренажёр тонов ---------- */

export interface ToneDrill {
  id: string
  /** Слог с тоном: "mā". */
  syllable: string
  tone: Tone
  /** Иероглиф-пример с этим слогом, если есть. */
  hanzi?: string
  ru?: string
}

export interface ToneInfo {
  tone: Tone
  name: string
  /** Описание, как произносить. */
  howTo: string
  /** Графика контура: "─", "╱", "╲╱", "╲". */
  contour: string
  /** Tailwind-класс цвета текста для подсветки слога. */
  colorClass: string
}

/* ---------- Пиньинь ---------- */

export interface PinyinInitial {
  initial: string
  /** Подсказка произношения по-русски. */
  hint: string
  example: string
}

export interface PinyinFinal {
  final: string
  hint: string
  example: string
}

/* ---------- Прогресс и настройки ---------- */

export interface Streak {
  current: number
  best: number
  /** Дата последнего занятия, формат YYYY-MM-DD. */
  lastDate: string | null
}

export interface Settings {
  /** Показывать пиньинь на лицевой стороне карточки. */
  showPinyin: boolean
  /** Озвучивать слово автоматически при показе. */
  autoSpeak: boolean
  /** Скорость речи 0.5–1.5. */
  voiceRate: number
  /** Цель повторений в день. */
  dailyGoal: number
  /** Новых слов в день. */
  newPerDay: number
}

/** Экран приложения. Навигация хранится в сторе, Codex переключает через setView. */
export type AppView =
  | 'dashboard'
  | 'review'
  | 'quiz'
  | 'tones'
  | 'words'
  | 'speak'
  | 'settings'

export interface TopicProgress {
  topic: Topic
  total: number
  learned: number
  mature: number
  /** 0–100. */
  percent: number
}

export interface DayActivity {
  /** YYYY-MM-DD. */
  date: string
  /** Короткая подпись дня недели: Пн, Вт ... */
  label: string
  reviews: number
  /** Достигнута ли дневная цель. */
  goalMet: boolean
}

export interface DashboardData {
  dueCount: number
  newAvailable: number
  totalWords: number
  learned: number
  mature: number
  streak: Streak
  xp: number
  /** Уровень по XP: номер и название. */
  level: { number: number; title: string; nextAt: number; progressPercent: number }
  todayReviews: number
  dailyGoal: number
  goalPercent: number
  week: DayActivity[]
  topics: TopicProgress[]
  recentQuizzes: QuizSummary[]
}

/* ---------- Разговорная практика ---------- */

export interface SpeakAttempt {
  target: Word
  /** Что распознал браузер. */
  heard: string
  /** 0–100, совпадение иероглифов. */
  score: number
  /** Поиероглифное сравнение для подсветки. */
  chars: { char: string; ok: boolean }[]
}
