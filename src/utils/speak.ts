// ponytail: Web Speech API, zero assets, swap for VO in v2
export const speak = (text: string, lang = 'es-ES'): void => {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  speechSynthesis.speak(utterance)
}
