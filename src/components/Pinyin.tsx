import type { Tone } from '@/types'
import { splitSyllables } from '@/lib/pinyin'
import { cn } from '@/lib/utils'

const TONE_CLASS: Record<Tone, string> = {
  1: 'text-tone-1',
  2: 'text-tone-2',
  3: 'text-tone-3',
  4: 'text-tone-4',
  5: 'text-tone-5',
}

/** Пиньинь с подсветкой каждого слога цветом тона. Пробелы между словами сохраняются. */
export function Pinyin({ text, className }: { text: string; className?: string }) {
  const chunks = text.split(/\s+/).filter(Boolean)
  return (
    <span className={cn('font-sans tracking-wide', className)}>
      {chunks.map((chunk, ci) => (
        <span key={ci}>
          {splitSyllables(chunk).map((s, si) => (
            <span key={si} className={TONE_CLASS[s.tone]}>
              {s.text}
            </span>
          ))}
          {ci < chunks.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

export function toneClass(tone: Tone): string {
  return TONE_CLASS[tone]
}
