// ponytail: Web Speech API, zero assets, swap for VO in v2
const getSpanishVoice = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang === 'es-CO') ??
    voices.find(v => v.lang.startsWith('es-')) ??
    null
  )
}

export const speak = (text: string, lang = 'es-CO'): void => {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  const voice = getSpanishVoice()
  if (voice) utterance.voice = voice
  speechSynthesis.speak(utterance)
}
