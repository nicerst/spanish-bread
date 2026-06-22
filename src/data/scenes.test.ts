import { describe, it, expect } from 'vitest'
import scenes from './scenes.json'

describe('scenes.json', () => {
  it('has exactly 3 scenes', () => {
    expect(scenes).toHaveLength(3)
  })

  it('each scene has required fields', () => {
    for (const scene of scenes) {
      expect(scene.id).toBeTruthy()
      expect(scene.npcName).toBeTruthy()
      expect(scene.exchanges.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each exchange has exactly 3 options with exactly 1 correct', () => {
    for (const scene of scenes) {
      for (const exchange of scene.exchanges) {
        expect(exchange.options).toHaveLength(3)
        expect(exchange.options.filter((o: { correct: boolean }) => o.correct)).toHaveLength(1)
      }
    }
  })
})