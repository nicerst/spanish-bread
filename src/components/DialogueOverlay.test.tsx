import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { DialogueOverlay } from './DialogueOverlay'
import { useGameStore } from '../store/useGameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ screen: 'game', currentSceneId: 'cafe', currentExchangeIndex: 0 })
})

describe('DialogueOverlay', () => {
  it('renders NPC name and first line for cafe', () => {
    render(<DialogueOverlay />)
    expect(screen.getByText('El Camarero')).toBeInTheDocument()
  })

  it('renders 3 option buttons during dialogue', () => {
    render(<DialogueOverlay />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('shows Continue button when task just completed', () => {
    useGameStore.setState({ taskJustCompleted: true })
    render(<DialogueOverlay />)
    expect(screen.getByText('Continue →')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('renders plaza scene NPC on scene change', () => {
    useGameStore.setState({ currentSceneId: 'plaza', currentExchangeIndex: 0 })
    render(<DialogueOverlay />)
    expect(screen.getByText('El Vecino')).toBeInTheDocument()
  })
})