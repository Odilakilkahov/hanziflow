import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'info'

const TONE: Record<Tone, string> = {
  neutral: 'bg-white/6 text-fg-muted border-line',
  accent: 'bg-accent-soft text-accent border-accent/30',
  ok: 'bg-ok-soft text-ok border-ok/30',
  warn: 'bg-warn/15 text-warn border-warn/30',
  info: 'bg-tone-4/15 text-tone-4 border-tone-4/30',
}

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium', TONE[tone], className)}>
      {children}
    </span>
  )
}
