const DEFAULT_LANG = 'es-CO'
const KOKORO_LANG_CODE = 'e'
const KOKORO_VOICE = 'ef_dora'
const DEFAULT_PROD_TTS_ENDPOINT = '/api/tts'

declare global {
  interface Window {
    __SPANISH_BREAD_TTS_ENDPOINT__?: string | null
  }
}

let cachedVoices: SpeechSynthesisVoice[] = []
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const load = () => { cachedVoices = speechSynthesis.getVoices() }
  load()
  speechSynthesis.addEventListener('voiceschanged', load)
}

const getTtsEndpoint = (): string | null => {
  if (typeof window !== 'undefined' && window.__SPANISH_BREAD_TTS_ENDPOINT__ !== undefined) {
    return window.__SPANISH_BREAD_TTS_ENDPOINT__ || null
  }

  const configured = import.meta.env.VITE_TTS_ENDPOINT?.trim()
  if (configured) return configured

  return import.meta.env.PROD ? DEFAULT_PROD_TTS_ENDPOINT : null
}

const getSpanishVoice = (): SpeechSynthesisVoice | null =>
  cachedVoices.find(v => v.lang === 'es-CO') ??
  cachedVoices.find(v => v.lang.startsWith('es-')) ??
  null

const doSpeak = (text: string, lang: string): void => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  const voice = getSpanishVoice()
  if (voice) utterance.voice = voice
  speechSynthesis.speak(utterance)
}

const speakWithWebSpeech = (text: string, lang: string): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (cachedVoices.length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => doSpeak(text, lang), { once: true })
  } else {
    doSpeak(text, lang)
  }
}

const playAudioBlob = async (blob: Blob): Promise<void> => {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true })
  audio.addEventListener('error', () => URL.revokeObjectURL(url), { once: true })
  await audio.play()
}

export const speakAsync = async (text: string, lang = DEFAULT_LANG): Promise<void> => {
  const endpoint = getTtsEndpoint()

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lang,
          kokoroLang: KOKORO_LANG_CODE,
          voice: KOKORO_VOICE,
        }),
      })

      if (!response.ok) throw new Error(`TTS request failed: ${response.status}`)
      await playAudioBlob(await response.blob())
      return
    } catch {
      speakWithWebSpeech(text, lang)
      return
    }
  }

  speakWithWebSpeech(text, lang)
}

export const speak = (text: string, lang = DEFAULT_LANG): void => {
  void speakAsync(text, lang)
}
