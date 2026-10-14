import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import type { AppView, Level, TopicId } from '@/types'
import { useNavigation } from '@/hooks'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icon'
import { page } from '@/components/motion'
import { DashboardPage } from './DashboardPage'
import { ReviewPage, type ReviewPreset } from './ReviewPage'
import { QuizPage } from './QuizPage'
import { TonesPage } from './TonesPage'
import { SpeakPage } from './SpeakPage'
import { WordsPage } from './WordsPage'
import { SettingsPage } from './SettingsPage'

/** Оболочка: боковая панель на десктопе, нижняя панель на мобильном, анимированная смена экранов. */
export function Root() {
  const { view, setView, items } = useNavigation()
  const [reviewPreset, setReviewPreset] = useState<ReviewPreset | null>(null)

  const startReview = (preset: { topic?: TopicId; level?: Level } | null) => {
    // null = «все слова»: сразу в сессию без экрана выбора.
    setReviewPreset({ ...(preset ?? {}), nonce: Date.now() })
    setView('review')
  }

  const screens: Record<AppView, ReactNode> = {
    dashboard: <DashboardPage onStartReview={startReview} onNavigate={setView} />,
    review: <ReviewPage preset={reviewPreset} />,
    quiz: <QuizPage />,
    tones: <TonesPage />,
    speak: <SpeakPage />,
    words: <WordsPage />,
    settings: <SettingsPage />,
  }

  return (
    <div className="relative min-h-screen bg-bg text-fg">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[480px]" />

      {/* Боковая панель */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface/80 px-4 py-6 backdrop-blur-sm md:flex">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1">
          {items.map((it) => {
            const active = it.view === view
            return (
              <motion.button
                key={it.view}
                type="button"
                onClick={() => setView(it.view)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200',
                  active ? 'text-fg' : 'text-fg-muted hover:bg-white/5 hover:text-fg',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-line-strong bg-surface-2"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon name={it.icon} size={18} className={cn('relative', active && 'text-accent')} />
                <span className="relative">{it.title}</span>
              </motion.button>
            )
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-line bg-surface-2 p-3 text-xs text-fg-muted">
          <div className="font-hanzi text-lg text-fg">每天一点</div>
          Каждый день понемногу. 20 минут сегодня важнее двух часов в воскресенье.
        </div>
      </aside>

      {/* Контент */}
      <main className="relative mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:pl-64 md:pr-8 md:pt-10 md:pb-16 lg:pl-72">
        <div className="mb-6 md:hidden">
          <Logo />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={view} variants={page} initial="hidden" animate="visible" exit="exit">
            {screens[view]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Нижняя панель (мобильные) */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around px-1">
          {items.map((it) => {
            const active = it.view === view
            return (
              <motion.button
                key={it.view}
                type="button"
                onClick={() => setView(it.view)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  active ? 'text-accent' : 'text-fg-faint',
                )}
              >
                <Icon name={it.icon} size={20} />
                <span className="truncate">{it.title}</span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <motion.span
        initial={{ rotate: -8, scale: 0.9, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="font-hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-2xl font-bold text-white shadow-[0_8px_24px_-8px_rgba(229,72,77,0.8)]"
      >
        流
      </motion.span>
      <div>
        <div className="text-base font-semibold tracking-tight">HanziFlow</div>
        <div className="text-[11px] text-fg-faint">китайский каждый день</div>
      </div>
    </div>
  )
}
