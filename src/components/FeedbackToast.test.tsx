import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FeedbackToast } from './FeedbackToast'
import { useGameStore } from '../store/useGameStore'
import scenes from '../data/scenes.json'

const options = scenes[0].exchanges[0].options
const onAdvance = vi.fn()

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ screen: 'game', currentSceneId: 'cafe', currentExchangeIndex: 0 })
  vi.clearAllMocks()
})

describe('FeedbackToast', () => {
  it('renders nothing when feedback is none', () => {
    const { container } = render(<FeedbackToast options={options} onCorrectAutoAdvance={onAdvance} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows English gloss on correct selection', () => {
    useGameStore.setState({ feedback: 'correct', selectedOptionIndex: 0 })
    render(<FeedbackToast options={options} onCorrectAutoAdvance={onAdvance} />)
    expect(screen.getByText(/coffee with milk/i)).toBeInTheDocument()
  })

  it('shows hint on wrong selection', () => {
    useGameStore.setState({ feedback: 'wrong', selectedOptionIndex: 1 })
    render(<FeedbackToast options={options} onCorrectAutoAdvance={onAdvance} />)
    expect(screen.getByText(/Hint:/i)).toBeInTheDocument()
  })
})