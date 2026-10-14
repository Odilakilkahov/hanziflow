/**
 * Озвучка (Web Speech Synthesis) и распознавание речи (Web Speech Recognition)
 * для китайского. Без внешних API и ключей — всё в браузере.
 */

const LANG = 'zh-CN'

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Лучший доступный китайский голос. Google/Microsoft голоса предпочтительнее системных. */
export function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (!ttsSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  const zh = voices.filter((v) => /^zh([-_]|$)/i.test(v.lang) || /chinese|中文|普通话/i.test(v.name))
  if (zh.length === 0) return null
  const preferred =
    zh.find((v) => /xiaoxiao|yunxi|google.*(普通话|chinese)|ting-ting|tingting/i.test(v.name)) ??
    zh.find((v) => /cn/i.test(v.lang)) ??
    zh[0]
  return preferred
}

export interface SpeakOptions {
  rate?: number
  onEnd?: () => void
}

/** Озвучить текст. Возвращает false, если синтез недоступен. */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (!ttsSupported() || !text) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = LANG
  u.rate = Math.min(1.5, Math.max(0.5, opts.rate ?? 0.85))
  const voice = pickChineseVoice()
  if (voice) u.voice = voice
  if (opts.onEnd) u.onend = opts.onEnd
  synth.speak(u)
  return true
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel()
}

/* ---------- Распознавание ---------- */

type RecognitionCtor = new () => SpeechRecognitionLike

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function sttSupported(): boolean {
  return recognitionCtor() !== null
}

export interface ListenHandle {
  /** Промис с распознанным текстом. Пустая строка — ничего не услышали. */
  result: Promise<string>
  stop: () => void
}

/**
 * Слушать один фрагмент речи на китайском.
 * Ошибки: 'not-supported', 'not-allowed' (нет доступа к микрофону), 'no-speech', 'network'.
 */
export function listenOnce(timeoutMs = 8000): ListenHandle {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    return { result: Promise.reject(new Error('not-supported')), stop: () => {} }
  }
  const rec = new Ctor()
  rec.lang = LANG
  rec.interimResults = false
  rec.maxAlternatives = 1
  rec.continuous = false

  let settled = false
  let timer: ReturnType<typeof setTimeout> | null = null

  const result = new Promise<string>((resolve, reject) => {
    rec.onresult = (e) => {
      settled = true
      const text = e.results[0]?.[0]?.transcript ?? ''
      resolve(text.trim())
    }
    rec.onerror = (e) => {
      if (settled) return
      settled = true
      reject(new Error(e.error || 'unknown'))
    }
    rec.onend = () => {
      if (timer) clearTimeout(timer)
      if (!settled) {
        settled = true
        resolve('')
      }
    }
    timer = setTimeout(() => {
      if (!settled) rec.stop()
    }, timeoutMs)
    try {
      rec.start()
    } catch (err) {
      settled = true
      reject(err instanceof Error ? err : new Error('start-failed'))
    }
  })

  return { result, stop: () => rec.stop() }
}

/** Только иероглифы (CJK), без знаков препинания и пробелов. */
export function onlyHanzi(text: string): string {
  return (text.match(/[一-鿿]/g) ?? []).join('')
}

/**
 * Сравнить услышанное с целью: доля совпавших иероглифов по позициям
 * с поправкой на вхождение. Возвращает 0–100 и разметку по символам.
 */
export function compareHanzi(heard: string, target: string): { score: number; chars: { char: string; ok: boolean }[] } {
  const h = onlyHanzi(heard)
  const t = onlyHanzi(target)
  if (!t) return { score: 0, chars: [] }
  if (h === t) return { score: 100, chars: [...t].map((c) => ({ char: c, ok: true })) }
  const pool = [...h]
  const chars = [...t].map((c) => {
    const i = pool.indexOf(c)
    if (i >= 0) {
      pool.splice(i, 1)
      return { char: c, ok: true }
    }
    return { char: c, ok: false }
  })
  const ok = chars.filter((c) => c.ok).length
  const score = Math.round((ok / t.length) * 100)
  return { score, chars }
}
