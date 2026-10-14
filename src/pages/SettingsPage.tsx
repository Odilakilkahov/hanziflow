import { motion } from 'framer-motion'
import { useState } from 'react'
import { useSettings } from '@/hooks'
import { Button, Card, Dialog, Switch } from '@/ui'
import { PageHeader } from '@/components/PageHeader'
import { stagger } from '@/components/motion'

export function SettingsPage() {
  const { settings, update, reset } = useSettings()
  const [confirm, setConfirm] = useState(false)

  return (
    <div>
      <PageHeader hanzi="设" title="Настройки" subtitle="Прогресс хранится в этом браузере" />
      <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto flex max-w-xl flex-col gap-3">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-muted">Карточки</h2>
          <Row title="Пиньинь на лицевой стороне" hint="Выключите, когда начнёте узнавать иероглифы без подсказки">
            <Switch checked={settings.showPinyin} onChange={(v) => update({ showPinyin: v })} label="Пиньинь на лицевой стороне" />
          </Row>
          <Row title="Озвучивать автоматически" hint="Слово произносится при показе карточки">
            <Switch checked={settings.autoSpeak} onChange={(v) => update({ autoSpeak: v })} label="Озвучивать автоматически" />
          </Row>
          <Row title="Скорость речи" hint={`${settings.voiceRate.toFixed(2)}×`}>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={settings.voiceRate}
              onChange={(e) => update({ voiceRate: Number(e.target.value) })}
              className="w-36"
              aria-label="Скорость речи"
            />
          </Row>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-muted">Нагрузка</h2>
          <Row title="Цель в день" hint="Повторений, чтобы день засчитался">
            <NumberInput value={settings.dailyGoal} min={5} max={200} onChange={(v) => update({ dailyGoal: v })} />
          </Row>
          <Row title="Новых слов в день" hint="Рекомендуем 10–15; к HSK 2 за 90 дней хватит 15">
            <NumberInput value={settings.newPerDay} min={0} max={50} onChange={(v) => update({ newPerDay: v })} />
          </Row>
        </Card>

        <Card className="border-bad/20">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-fg-muted">Данные</h2>
          <p className="mb-4 text-sm text-fg-muted">Сброс удалит все карточки, серию, XP и историю викторин. Настройки останутся.</p>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Сбросить прогресс
          </Button>
        </Card>
      </motion.div>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Сбросить прогресс?">
        <p className="text-sm text-fg-muted">Это действие нельзя отменить. Все выученные слова вернутся в состояние «новое».</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirm(false)}>Отмена</Button>
          <Button variant="danger" onClick={() => { reset(); setConfirm(false) }}>Сбросить</Button>
        </div>
      </Dialog>
    </div>
  )
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-3.5 first:border-t-0">
      <div>
        <div className="text-sm font-medium">{title}</div>
        {hint && <div className="text-xs text-fg-faint">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

function NumberInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(min, value - 5))} className="h-9 w-9 rounded-lg border border-line bg-surface-2 text-fg-muted transition-colors hover:text-fg">−</button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n))))
        }}
        className="h-9 w-16 rounded-lg border border-line bg-surface-2 text-center text-sm tabular-nums outline-none focus:border-accent/60"
      />
      <button type="button" onClick={() => onChange(Math.min(max, value + 5))} className="h-9 w-9 rounded-lg border border-line bg-surface-2 text-fg-muted transition-colors hover:text-fg">+</button>
    </div>
  )
}
