import { useMemo } from 'react'
import type { DashboardData, DayActivity, TopicProgress } from '@/types'
import { TOPICS } from '@/data/topics'
import { ALL_WORDS } from '@/data/words'
import { countDue, statusOf } from '@/lib/srs'
import { addDays, toDateKey, weekdayLabel } from '@/lib/utils'
import { levelFromXp } from '@/lib/xp'
import { useProgress } from '@/store/useProgress'

/** Все данные для главного экрана. Пересчитывается при любом изменении прогресса. */
export function useDashboard(): DashboardData {
  const cards = useProgress((s) => s.cards)
  const activity = useProgress((s) => s.activity)
  const streak = useProgress((s) => s.streak)
  const xp = useProgress((s) => s.xp)
  const quizzes = useProgress((s) => s.quizzes)
  const settings = useProgress((s) => s.settings)

  return useMemo(() => {
    const now = Date.now()
    const today = toDateKey()
    let learned = 0
    let mature = 0
    for (const w of ALL_WORDS) {
      const st = statusOf(cards[w.id])
      if (st !== 'new') learned++
      if (st === 'mature') mature++
    }
    const newAvailable = Math.min(settings.newPerDay, ALL_WORDS.length - learned)
    const todayReviews = activity[today] ?? 0

    const week: DayActivity[] = []
    for (let i = 6; i >= 0; i--) {
      const d = addDays(new Date(), -i)
      const key = toDateKey(d)
      const reviews = activity[key] ?? 0
      week.push({ date: key, label: weekdayLabel(d), reviews, goalMet: reviews >= settings.dailyGoal })
    }

    const topics: TopicProgress[] = TOPICS.map((topic) => {
      const words = ALL_WORDS.filter((w) => w.topic === topic.id)
      let l = 0
      let m = 0
      for (const w of words) {
        const st = statusOf(cards[w.id])
        if (st !== 'new') l++
        if (st === 'mature') m++
      }
      return { topic, total: words.length, learned: l, mature: m, percent: words.length ? Math.round((l / words.length) * 100) : 0 }
    })

    return {
      dueCount: countDue(cards, now),
      newAvailable,
      totalWords: ALL_WORDS.length,
      learned,
      mature,
      streak,
      xp,
      level: levelFromXp(xp),
      todayReviews,
      dailyGoal: settings.dailyGoal,
      goalPercent: Math.min(100, Math.round((todayReviews / settings.dailyGoal) * 100)),
      week,
      topics,
      recentQuizzes: quizzes.slice(0, 5),
    }
  }, [cards, activity, streak, xp, quizzes, settings])
}
