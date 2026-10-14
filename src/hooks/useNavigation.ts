import type { AppView } from '@/types'
import { useProgress } from '@/store/useProgress'

export interface NavItem {
  view: AppView
  title: string
  /** Имя иконки Lucide. */
  icon: string
}

/** Пункты меню в порядке показа. */
export const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', title: 'Сегодня', icon: 'LayoutDashboard' },
  { view: 'review', title: 'Карточки', icon: 'Layers' },
  { view: 'quiz', title: 'Викторина', icon: 'Brain' },
  { view: 'tones', title: 'Тоны', icon: 'AudioWaveform' },
  { view: 'speak', title: 'Речь', icon: 'Mic' },
  { view: 'words', title: 'Словарь', icon: 'BookOpen' },
  { view: 'settings', title: 'Настройки', icon: 'Settings' },
]

export function useNavigation(): { view: AppView; setView: (v: AppView) => void; items: NavItem[] } {
  const view = useProgress((s) => s.view)
  const setView = useProgress((s) => s.setView)
  return { view, setView, items: NAV_ITEMS }
}
