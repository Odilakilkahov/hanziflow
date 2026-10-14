import type { Settings } from '@/types'
import { useProgress } from '@/store/useProgress'

export interface SettingsControls {
  settings: Settings
  update: (patch: Partial<Settings>) => void
  /** Стереть весь прогресс. Настройки остаются. */
  reset: () => void
}

export function useSettings(): SettingsControls {
  const settings = useProgress((s) => s.settings)
  const update = useProgress((s) => s.updateSettings)
  const reset = useProgress((s) => s.resetProgress)
  return { settings, update, reset }
}
