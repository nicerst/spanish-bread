import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './useGameStore'
import scenes from '../data/scenes.json'

beforeEach(() => useGameStore.getState().resetGame())

describe('initial state', () => {
  it('starts on start screen', () => {
    expect(useGameStore.getState().screen).toBe('start')
  })
  it('has no completed tasks', () => {
    expect(useGameStore.getState().completedTasks).toHaveLength(0)
  })
})

describe('startGame', () => {
  it('transitions to game at cafe with exchange 0', () => {
    useGameStore.getState().startGame()
    const s = useGameStore.getState()
    expect(s.screen).toBe('game')
    expect(s.currentSceneId).toBe('cafe')
    expect(s.currentExchangeIndex).toBe(0)
  })
})

describe('continueGame', () => {
  it('transitions to game without resetting progress', () => {
    useGameStore.setState({ completedTasks: ['cafe'], currentSceneId: 'plaza' })
    useGameStore.getState().continueGame()
    const s = useGameStore.getState()
    expect(s.screen).toBe('game')
    expect(s.completedTasks).toContain('cafe')
    expect(s.currentSceneId).toBe('plaza')
  })
})

describe('selectOption', () => {
  beforeEach(() => useGameStore.getState().startGame())

  it('sets feedback correct for right answer', () => {
    const correctIdx = scenes[0].exchanges[0].options.findIndex(o => o.correct)
    useGameStore.getState().selectOption(correctIdx)
    expect(useGameStore.getState().feedback).toBe('correct')
  })

  it('sets feedback wrong for wrong answer', () => {
    const wrongIdx = scenes[0].exchanges[0].options.findIndex(o => !o.correct)
    useGameStore.getState().selectOption(wrongIdx)
    expect(useGameStore.getState().feedback).toBe('wrong')
  })

  it('sets taskJustCompleted and completedTasks on last exchange', () => {
    useGameStore.setState({ currentExchangeIndex: 4 })
    const correctIdx = scenes[0].exchanges[4].options.findIndex(o => o.correct)
    useGameStore.getState().selectOption(correctIdx)
    const s = useGameStore.getState()
    expect(s.taskJustCompleted).toBe(true)
    expect(s.completedTasks).toContain('cafe')
  })
})

describe('advanceExchange', () => {
  beforeEach(() => useGameStore.getState().startGame())

  it('increments exchange index and clears feedback', () => {
    useGameStore.getState().selectOption(0)
    useGameStore.getState().advanceExchange()
    const s = useGameStore.getState()
    expect(s.currentExchangeIndex).toBe(1)
    expect(s.feedback).toBe('none')
    expect(s.selectedOptionIndex).toBeNull()
  })
})

describe('goToNextScene', () => {
  it('advances cafe to plaza', () => {
    useGameStore.setState({
      screen: 'game', currentSceneId: 'cafe',
      completedTasks: ['cafe'], taskJustCompleted: true,
    })
    useGameStore.getState().goToNextScene()
    const s = useGameStore.getState()
    expect(s.currentSceneId).toBe('plaza')
    expect(s.taskJustCompleted).toBe(false)
    expect(s.currentExchangeIndex).toBe(0)
  })

  it('transitions to win after bus-station', () => {
    useGameStore.setState({
      screen: 'game', currentSceneId: 'bus-station',
      completedTasks: ['cafe', 'plaza', 'bus-station'], taskJustCompleted: true,
    })
    useGameStore.getState().goToNextScene()
    expect(useGameStore.getState().screen).toBe('win')
  })
})

describe('resetGame', () => {
  it('returns to start with cleared state', () => {
    useGameStore.getState().startGame()
    useGameStore.getState().resetGame()
    const s = useGameStore.getState()
    expect(s.screen).toBe('start')
    expect(s.completedTasks).toHaveLength(0)
    expect(s.currentExchangeIndex).toBe(0)
  })
})