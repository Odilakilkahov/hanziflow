import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppView, Grade, QuizSummary, Settings, SrsCard, Streak } from '@/types'
import { newCard, schedule } from '@/lib/srs'
import { daysBetween, toDateKey } from '@/lib/utils'
import { XP_FOR_GRADE } from '@/lib/xp'

export const DEFAULT_SETTINGS: Settings = {
  showPinyin: true,
  autoSpeak: true,
  voiceRate: 0.85,
  dailyGoal: 20,
  newPerDay: 15,
}

interface ProgressState {
  cards: Record<string, SrsCard>
  /** Повторений по дням: YYYY-MM-DD → число. */
  activity: Record<string, number>
  streak: Streak
  xp: number
  quizzes: QuizSummary[]
  settings: Settings
  view: AppView

  setView: (view: AppView) => void
  /** Оценить карточку: планирует следующий показ, начисляет XP, ведёт серию. */
  recordReview: (wordId: string, grade: Grade, now?: number) => SrsCard
  /** Записать итог викторины или тренажёра и начислить XP. */
  recordQuiz: (summary: QuizSummary, xp: number) => void
  /** Начислить XP за произвольную активность (речь, тоны). */
  addXp: (amount: number) => void
  updateSettings: (patch: Partial<Settings>) => void
  resetProgress: () => void
}

function bumpStreak(streak: Streak, today: string): Streak {
  if (streak.lastDate === today) return streak
  const consecutive = streak.lastDate !== null && daysBetween(streak.lastDate, today) === 1
  const current = consecutive ? streak.current + 1 : 1
  return { current, best: Math.max(streak.best, current), lastDate: today }
}

const initial = {
  cards: {},
  activity: {},
  streak: { current: 0, best: 0, lastDate: null } as Streak,
  xp: 0,
  quizzes: [],
  settings: DEFAULT_SETTINGS,
  view: 'dashboard' as AppView,
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      setView: (view) => set({ view }),

      recordReview: (wordId, grade, now = Date.now()) => {
        const today = toDateKey(new Date(now))
        const prev = get().cards[wordId] ?? newCard(wordId, now)
        const next = schedule(prev, grade, now)
        set((s) => ({
          cards: { ...s.cards, [wordId]: next },
          activity: { ...s.activity, [today]: (s.activity[today] ?? 0) + 1 },
          streak: bumpStreak(s.streak, today),
          xp: s.xp + XP_FOR_GRADE[grade],
        }))
        return next
      },

      recordQuiz: (summary, xp) =>
        set((s) => ({
          quizzes: [summary, ...s.quizzes].slice(0, 50),
          xp: s.xp + xp,
          streak: bumpStreak(s.streak, toDateKey()),
        })),

      addXp: (amount) =>
        set((s) => ({ xp: s.xp + Math.max(0, amount), streak: bumpStreak(s.streak, toDateKey()) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetProgress: () => set({ ...initial, settings: get().settings, view: get().view }),
    }),
    {
      name: 'hanziflow-progress',
      version: 1,
      partialize: (s) => ({
        cards: s.cards,
        activity: s.activity,
        streak: s.streak,
        xp: s.xp,
        quizzes: s.quizzes,
        settings: s.settings,
      }),
    },
  ),
)
