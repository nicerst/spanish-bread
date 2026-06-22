import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NPCLine } from './NPCLine'

beforeEach(() => vi.clearAllMocks())

describe('NPCLine', () => {
  it('renders NPC name', () => {
    render(<NPCLine npcName="El Camarero" line="Buenos dias" />)
    expect(screen.getByText('El Camarero')).toBeInTheDocument()
  })

  it('renders dialogue line', () => {
    render(<NPCLine npcName="El Camarero" line="Buenos dias" />)
    expect(screen.getByText('Buenos dias')).toBeInTheDocument()
  })

  it('calls speak on mount', () => {
    render(<NPCLine npcName="El Camarero" line="Buenos dias" />)
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es-ES' })
    )
  })

  it('calls speak again when line prop changes', () => {
    const { rerender } = render(<NPCLine npcName="El Camarero" line="Buenos dias" />)
    rerender(<NPCLine npcName="El Camarero" line="Algo para comer" />)
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(2)
  })
})