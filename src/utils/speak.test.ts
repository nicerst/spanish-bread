import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { speak, speakAsync } from './speak'

describe('speak', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.__SPANISH_BREAD_TTS_ENDPOINT__ = null
    ;(globalThis as any).fetch = vi.fn()
  })

  afterEach(() => {
    delete window.__SPANISH_BREAD_TTS_ENDPOINT__
  })

  it('uses Web Speech with Spanish defaults when no Kokoro endpoint is configured', () => {
    speak('Hola')

    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es-CO', text: 'Hola' })
    )
  })

  it('accepts custom lang override for Web Speech fallback', () => {
    speak('Hello', 'en-US')

    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en-US' })
    )
  })

  it('posts Spanish Kokoro voice request when an endpoint is configured', async () => {
    window.__SPANISH_BREAD_TTS_ENDPOINT__ = '/api/tts'
    ;(globalThis as any).fetch = vi.fn(() => Promise.resolve({
      ok: true,
      blob: () => Promise.resolve(new Blob(['audio'], { type: 'audio/wav' })),
    }))

    await speakAsync('Buenos dias')

    expect(fetch).toHaveBeenCalledWith('/api/tts', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        text: 'Buenos dias',
        lang: 'es-CO',
        kokoroLang: 'e',
        voice: 'ef_dora',
      }),
    }))
    expect(speechSynthesis.speak).not.toHaveBeenCalled()
  })

  it('falls back to Web Speech when Kokoro request fails', async () => {
    window.__SPANISH_BREAD_TTS_ENDPOINT__ = '/api/tts'
    ;(globalThis as any).fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 }))

    await speakAsync('Hola')

    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es-CO', text: 'Hola' })
    )
  })

  it('does not throw when speechSynthesis is unavailable', async () => {
    const saved = (window as any).speechSynthesis
    delete (window as any).speechSynthesis

    await expect(speakAsync('test')).resolves.toBeUndefined()
    ;(window as any).speechSynthesis = saved
  })
})
