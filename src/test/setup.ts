import '@testing-library/jest-dom'
import { vi } from 'vitest'

;(globalThis as any).SpeechSynthesisUtterance = class {
  lang = ''
  text = ''
  constructor(text: string) { this.text = text }
}

;(globalThis as any).speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: () => [],
}
