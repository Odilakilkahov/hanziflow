import type { ReactNode } from 'react'
import { Card } from '@/ui'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
  className,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col gap-3', accent && 'border-accent/30 bg-accent-soft/40', className)}>
      <div className="flex items-center justify-between text-fg-muted">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && <div className="text-xs text-fg-faint">{hint}</div>}
    </Card>
  )
}
