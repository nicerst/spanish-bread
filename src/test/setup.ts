import '@testing-library/jest-dom'
import { vi } from 'vitest'

;(globalThis as any).SpeechSynthesisUtterance = class {
  lang = ''
  text = ''
  voice: SpeechSynthesisVoice | null = null
  constructor(text: string) { this.text = text }
}

;(globalThis as any).speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: () => [{ lang: 'es-CO', name: 'Spanish', voiceURI: 'Spanish' }],
  addEventListener: vi.fn(),
}

;(globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:test-audio')
;(globalThis as any).URL.revokeObjectURL = vi.fn()
;(globalThis as any).Audio = class {
  addEventListener = vi.fn()
  play = vi.fn(() => Promise.resolve())
}
