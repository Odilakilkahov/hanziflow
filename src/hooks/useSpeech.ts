import { useCallback, useEffect, useRef, useState } from 'react'
import { listenOnce, speak as speakRaw, stopSpeaking, sttSupported, ttsSupported } from '@/lib/speech'
import { useProgress } from '@/store/useProgress'

export type ListenError = 'not-supported' | 'not-allowed' | 'no-speech' | 'network' | 'unknown'

export interface Speech {
  /** Озвучить китайский текст голосом браузера. */
  speak: (text: string) => void
  stop: () => void
  isSpeaking: boolean
  ttsAvailable: boolean
  /** Слушать микрофон и вернуть распознанный текст (пустая строка — тишина). */
  listen: () => Promise<string>
  cancelListening: () => void
  isListening: boolean
  sttAvailable: boolean
  error: ListenError | null
}

const ERROR_TEXT: Record<ListenError, string> = {
  'not-supported': 'Распознавание речи не поддерживается в этом браузере. Откройте в Chrome или Edge.',
  'not-allowed': 'Нет доступа к микрофону. Разрешите его в настройках браузера.',
  'no-speech': 'Ничего не услышали. Попробуйте ещё раз, ближе к микрофону.',
  network: 'Нет связи со службой распознавания. Проверьте интернет.',
  unknown: 'Не удалось распознать речь. Попробуйте ещё раз.',
}

export function listenErrorText(e: ListenError | null): string | null {
  return e ? ERROR_TEXT[e] : null
}

function toListenError(err: unknown): ListenError {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg === 'not-supported' || msg === 'not-allowed' || msg === 'no-speech' || msg === 'network') return msg
  if (msg === 'service-not-allowed' || msg === 'audio-capture') return 'not-allowed'
  return 'unknown'
}

/** Озвучка и распознавание. Скорость речи берётся из настроек. */
export function useSpeech(): Speech {
  const rate = useProgress((s) => s.settings.voiceRate)
  const [isSpeaking, setSpeaking] = useState(false)
  const [isListening, setListening] = useState(false)
  const [error, setError] = useState<ListenError | null>(null)
  const handleRef = useRef<ReturnType<typeof listenOnce> | null>(null)

  const speak = useCallback(
    (text: string) => {
      const ok = speakRaw(text, { rate, onEnd: () => setSpeaking(false) })
      setSpeaking(ok)
    },
    [rate],
  )

  const stop = useCallback(() => {
    stopSpeaking()
    setSpeaking(false)
  }, [])

  const listen = useCallback(async () => {
    setError(null)
    setListening(true)
    const handle = listenOnce()
    handleRef.current = handle
    try {
      return await handle.result
    } catch (err) {
      setError(toListenError(err))
      return ''
    } finally {
      setListening(false)
      handleRef.current = null
    }
  }, [])

  const cancelListening = useCallback(() => {
    handleRef.current?.stop()
  }, [])

  useEffect(() => () => stopSpeaking(), [])

  return {
    speak,
    stop,
    isSpeaking,
    ttsAvailable: ttsSupported(),
    listen,
    cancelListening,
    isListening,
    sttAvailable: sttSupported(),
    error,
  }
}
