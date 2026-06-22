import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { OptionList } from './OptionList'
import { useGameStore } from '../store/useGameStore'
import scenes from '../data/scenes.json'

const options = scenes[0].exchanges[0].options

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.setState({ screen: 'game', currentSceneId: 'cafe', currentExchangeIndex: 0 })
})

describe('OptionList', () => {
  it('renders 3 buttons', () => {
    render(<OptionList options={options} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('renders Spanish text for each option', () => {
    render(<OptionList options={options} />)
    options.forEach(o => expect(screen.getByText(o.es)).toBeInTheDocument())
  })

  it('does not show English translation before selection', () => {
    render(<OptionList options={options} />)
    options.forEach(o => expect(screen.queryByText(o.en)).not.toBeInTheDocument())
  })

  it('calls selectOption with correct index on click', () => {
    render(<OptionList options={options} />)
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(useGameStore.getState().selectedOptionIndex).toBe(1)
  })
})