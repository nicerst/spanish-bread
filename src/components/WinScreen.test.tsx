import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WinScreen } from './WinScreen'
import { useGameStore } from '../store/useGameStore'

beforeEach(() => {
  useGameStore.setState({ screen: 'win' })
  vi.clearAllMocks()
})

describe('WinScreen', () => {
  it('shows win message', () => {
    render(<WinScreen />)
    expect(screen.getByText('¡Lo lograste!')).toBeInTheDocument()
    expect(screen.getByText('You escaped.')).toBeInTheDocument()
  })

  it('shows Play Again button', () => {
    render(<WinScreen />)
    expect(screen.getByText('Play Again')).toBeInTheDocument()
  })

  it('Play Again resets to start screen', () => {
    render(<WinScreen />)
    fireEvent.click(screen.getByText('Play Again'))
    expect(useGameStore.getState().screen).toBe('start')
  })

  it('speaks win message on mount', () => {
    render(<WinScreen />)
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: '¡Lo lograste!' })
    )
  })
})