import { useId } from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  /** Доступное имя: подпись слева от ползунка не всегда связана с полем. */
  label: string
  /** Подпись значения справа, например «0.85×». */
  format?: (v: number) => string
  className?: string
}

/** Ползунок в стиле shadcn: заполненная часть дорожки акцентная, бегунок белый. */
export function Slider({ value, min, max, step = 1, onChange, label, format, className }: SliderProps) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex h-6 w-40 items-center">
        <div className="pointer-events-none absolute inset-x-0 h-1.5 rounded-full bg-white/8" />
        <div className="pointer-events-none absolute left-0 h-1.5 rounded-full bg-accent" style={{ width: `${pct}%` }} />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          aria-valuetext={format ? format(value) : String(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(255,255,255,0.2)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-100 hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg [&::-moz-range-thumb]:bg-white',
          )}
        />
      </div>
      {format && (
        <output htmlFor={id} className="w-12 text-right text-sm tabular-nums text-fg-muted">
          {format(value)}
        </output>
      )}
    </div>
  )
}
