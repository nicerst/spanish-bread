import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { StartScreen } from './StartScreen'
import { useGameStore } from '../store/useGameStore'

beforeEach(() => useGameStore.getState().resetGame())

describe('StartScreen', () => {
  it('renders title', () => {
    render(<StartScreen />)
    expect(screen.getByText(/Spanish Bread/i)).toBeInTheDocument()
  })

  it('shows New Game button', () => {
    render(<StartScreen />)
    expect(screen.getByText('New Game')).toBeInTheDocument()
  })

  it('hides Continue when no saved progress', () => {
    render(<StartScreen />)
    expect(screen.queryByText('Continue')).not.toBeInTheDocument()
  })

  it('shows Continue when saved progress exists', () => {
    useGameStore.setState({ completedTasks: ['cafe'] })
    render(<StartScreen />)
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('New Game transitions to game screen', () => {
    render(<StartScreen />)
    fireEvent.click(screen.getByText('New Game'))
    expect(useGameStore.getState().screen).toBe('game')
  })

  it('Continue transitions to game without resetting progress', () => {
    useGameStore.setState({ completedTasks: ['cafe'], currentSceneId: 'plaza' })
    render(<StartScreen />)
    fireEvent.click(screen.getByText('Continue'))
    const s = useGameStore.getState()
    expect(s.screen).toBe('game')
    expect(s.completedTasks).toContain('cafe')
  })
})