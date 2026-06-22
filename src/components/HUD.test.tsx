import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HUD } from './HUD'
import { useGameStore } from '../store/useGameStore'

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ screen: 'game', currentSceneId: 'cafe' })
})

describe('HUD', () => {
  it('renders 3 scene icons', () => {
    render(<HUD />)
    expect(screen.getByText('🍽️')).toBeInTheDocument()
    expect(screen.getByText('🗺️')).toBeInTheDocument()
    expect(screen.getByText('🚌')).toBeInTheDocument()
  })

  it('shows checkmark for completed task', () => {
    useGameStore.setState({ completedTasks: ['cafe'] })
    render(<HUD />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows multiple checkmarks for multiple completed tasks', () => {
    useGameStore.setState({ completedTasks: ['cafe', 'plaza'] })
    render(<HUD />)
    expect(screen.getAllByText('✓')).toHaveLength(2)
  })
})