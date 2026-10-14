import { motion } from 'framer-motion'
import { ArrowRight, Flame, Layers, Sparkles, Star, Target, Trophy } from 'lucide-react'
import type { AppView, Level, TopicId } from '@/types'
import { useDashboard } from '@/hooks'
import { QUIZ_MODES } from '@/lib/quiz'
import { plural } from '@/lib/utils'
import { Badge, Button, Card } from '@/ui'
import { ProgressRing } from '@/components/ProgressRing'
import { StatCard } from '@/components/StatCard'
import { TopicGrid } from '@/components/TopicGrid'
import { WeekStrip } from '@/components/WeekStrip'
import { fadeUp, stagger } from '@/components/motion'

export function DashboardPage({
  onStartReview,
  onNavigate,
}: {
  onStartReview: (preset: { topic?: TopicId; level?: Level } | null) => void
  onNavigate: (v: AppView) => void
}) {
  const d = useDashboard()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
  const greetingRu = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const todo = d.dueCount + d.newAvailable

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">
      {/* Герой */}
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 md:p-8">
        <span className="font-hanzi pointer-events-none absolute -right-6 -top-10 select-none text-[180px] font-bold leading-none text-white/[0.035]">
          学
        </span>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-hanzi text-3xl font-bold text-accent">{greeting}</span>
              <span className="text-fg-muted">{greetingRu}, Одил</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {todo > 0 ? <>Сегодня {plural(todo, 'карточка', 'карточки', 'карточек')}</> : 'На сегодня всё сделано'}
            </h1>
            <p className="mt-2 max-w-md text-sm text-fg-muted">
              {d.dueCount > 0 && `${plural(d.dueCount, 'повторение', 'повторения', 'повторений')} ждут. `}
              {d.newAvailable > 0 && `${plural(d.newAvailable, 'новое слово', 'новых слова', 'новых слов')} готовы. `}
              {todo === 0 && 'Загляните в тоны или разговорную практику, чтобы закрепить.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onStartReview(null)}>
                <Layers size={18} />
                Начать повторение
                <ArrowRight size={16} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onNavigate('quiz')}>
                <Sparkles size={18} />
                Викторина
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ProgressRing percent={d.goalPercent} size={128} stroke={10}>
              <div className="text-center">
                <div className="text-3xl font-semibold tabular-nums">{d.todayReviews}</div>
                <div className="text-[11px] text-fg-faint">из {d.dailyGoal}</div>
              </div>
            </ProgressRing>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Flame size={18} className={d.streak.current > 0 ? 'text-accent' : 'text-fg-faint'} />
                <span className="font-semibold tabular-nums">{d.streak.current}</span>
                <span className="text-fg-muted">{plural(d.streak.current, 'день', 'дня', 'дней').split(' ')[1]} подряд</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-warn" />
                <span className="font-semibold tabular-nums">{d.streak.best}</span>
                <span className="text-fg-muted">рекорд</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-tone-4" />
                <span className="font-semibold tabular-nums">{d.xp}</span>
                <span className="text-fg-muted">XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Уровень */}
        <div className="relative mt-6 rounded-2xl border border-line bg-surface-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge tone="accent">Уровень {d.level.number}</Badge>
              <span className="font-hanzi font-medium">{d.level.title}</span>
            </div>
            <span className="text-xs text-fg-faint tabular-nums">
              {d.xp} / {d.level.nextAt} XP
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${d.level.progressPercent}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-accent to-warn"
            />
          </div>
        </div>
      </motion.section>

      {/* Статистика */}
      <motion.div variants={stagger} className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="К повторению" value={d.dueCount} hint="просрочено сейчас" icon={<Layers size={16} />} accent={d.dueCount > 0} />
        <StatCard label="Новые" value={d.newAvailable} hint="доступно сегодня" icon={<Sparkles size={16} />} />
        <StatCard label="Выучено" value={`${d.learned}`} hint={`из ${d.totalWords} слов`} icon={<Target size={16} />} />
        <StatCard label="Знаю твёрдо" value={d.mature} hint="интервал 21+ день" icon={<Trophy size={16} />} />
      </motion.div>

      {/* Неделя */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Неделя</h2>
          <span className="text-xs text-fg-faint">цель {d.dailyGoal} в день</span>
        </div>
        <WeekStrip week={d.week} goal={d.dailyGoal} />
      </Card>

      {/* Темы */}
      <motion.section variants={fadeUp}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Темы</h2>
          <button type="button" onClick={() => onNavigate('words')} className="text-xs text-fg-muted hover:text-fg">
            Весь словарь →
          </button>
        </div>
        <TopicGrid topics={d.topics} onPick={(t) => onStartReview({ topic: t.topic.id })} />
      </motion.section>

      {/* Последние викторины */}
      {d.recentQuizzes.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold tracking-tight">Последние викторины</h2>
          <div className="flex flex-col divide-y divide-line">
            {d.recentQuizzes.map((q, i) => {
              const mode = QUIZ_MODES.find((m) => m.mode === q.mode)
              const pct = Math.round((q.correct / q.total) * 100)
              return (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{mode?.title ?? q.mode}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-fg-faint">{q.date}</span>
                    <Badge tone={pct >= 80 ? 'ok' : pct >= 50 ? 'warn' : 'neutral'}>
                      {q.correct}/{q.total}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </motion.div>
  )
}
