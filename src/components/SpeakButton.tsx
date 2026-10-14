import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useSpeech } from '@/hooks'
import { cn } from '@/lib/utils'

/** Кнопка озвучки китайского текста голосом браузера. */
export function SpeakButton({ text, size = 'md', className }: { text: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const { speak, isSpeaking, ttsAvailable } = useSpeech()
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10'
  const icon = size === 'sm' ? 16 : size === 'lg' ? 26 : 20
  return (
    <motion.button
      type="button"
      aria-label="Озвучить"
      title={ttsAvailable ? 'Озвучить' : 'Озвучка недоступна в этом браузере'}
      disabled={!ttsAvailable}
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      animate={isSpeaking ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={isSpeaking ? { repeat: Infinity, duration: 0.9 } : undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-line bg-surface-2 text-fg-muted transition-colors',
        'hover:border-accent/50 hover:text-accent disabled:opacity-30',
        isSpeaking && 'border-accent/60 text-accent bg-accent-soft',
        dim,
        className,
      )}
    >
      <Volume2 size={icon} />
    </motion.button>
  )
}
