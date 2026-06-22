// ponytail: Web Speech API, zero assets, swap for VO in v2

// voices load async — cache after voiceschanged fires
let cachedVoices: SpeechSynthesisVoice[] = []
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const load = () => { cachedVoices = speechSynthesis.getVoices() }
  load()
  speechSynthesis.addEventListener('voiceschanged', load)
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

export const speak = (text: string, lang = 'es-CO'): void => {
  if (!('speechSynthesis' in window)) return
  // if voices not loaded yet, wait for voiceschanged then speak
  if (cachedVoices.length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => doSpeak(text, lang), { once: true })
  } else {
    doSpeak(text, lang)
  }
}
