import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'
import { useGameStore } from './store/useGameStore'

vi.mock('./components/SceneView', () => ({
  SceneView: () => <div data-testid="scene-view" />,
}))

beforeEach(() => useGameStore.getState().resetGame())

describe('App', () => {
  it('shows StartScreen initially', () => {
    render(<App />)
    expect(screen.getByText(/Spanish Bread/i)).toBeInTheDocument()
  })

  it('shows SceneView when screen is game', () => {
    useGameStore.setState({ screen: 'game' })
    render(<App />)
    expect(screen.getByTestId('scene-view')).toBeInTheDocument()
  })

  it('shows WinScreen when screen is win', () => {
    useGameStore.setState({ screen: 'win' })
    render(<App />)
    expect(screen.getByText('¡Lo lograste!')).toBeInTheDocument()
  })
})