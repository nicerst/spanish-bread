import { describe, it, expect, vi, beforeEach } from 'vitest'
import { speak } from './speak'

describe('speak', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls speechSynthesis.speak with correct lang and text', () => {
    speak('Hola')
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es-ES', text: 'Hola' })
    )
  })

  it('accepts custom lang override', () => {
    speak('Hello', 'en-US')
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en-US' })
    )
  })

  it('does not throw when speechSynthesis is unavailable', () => {
    const saved = (window as any).speechSynthesis
    delete (window as any).speechSynthesis
    expect(() => speak('test')).not.toThrow()
    ;(window as any).speechSynthesis = saved
  })
})
