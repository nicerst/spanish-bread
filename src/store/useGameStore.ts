import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import scenes from '../data/scenes.json'
import type { Scene } from '../types'

const SCENE_ORDER = ['cafe', 'plaza', 'bus-station'] as const

interface GameStore {
  screen: 'start' | 'game' | 'win'
  currentSceneId: string
  completedTasks: string[]
  currentExchangeIndex: number
  feedback: 'none' | 'correct' | 'wrong'
  selectedOptionIndex: number | null
  taskJustCompleted: boolean
  startGame: () => void
  continueGame: () => void
  selectOption: (index: number) => void
  advanceExchange: () => void
  goToNextScene: () => void
  resetGame: () => void
}

const initialState = {
  screen: 'start' as const,
  currentSceneId: 'cafe',
  completedTasks: [] as string[],
  currentExchangeIndex: 0,
  feedback: 'none' as const,
  selectedOptionIndex: null as number | null,
  taskJustCompleted: false,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startGame: () => set({ ...initialState, screen: 'game' }),
      continueGame: () => set({ screen: 'game' }),

      selectOption: (index: number) => {
        const { currentSceneId, currentExchangeIndex, completedTasks } = get()
        const scene = (scenes as Scene[]).find(s => s.id === currentSceneId)!
        const exchange = scene.exchanges[currentExchangeIndex]
        const isCorrect = exchange.options[index].correct
        const isLastExchange = currentExchangeIndex === scene.exchanges.length - 1

        if (isCorrect && isLastExchange) {
          set({
            selectedOptionIndex: index,
            feedback: 'correct',
            completedTasks: [...completedTasks, currentSceneId],
            taskJustCompleted: true,
          })
        } else {
          set({ selectedOptionIndex: index, feedback: isCorrect ? 'correct' : 'wrong' })
        }
      },

      advanceExchange: () => {
        const { currentExchangeIndex } = get()
        set({ currentExchangeIndex: currentExchangeIndex + 1, feedback: 'none', selectedOptionIndex: null })
      },

      goToNextScene: () => {
        const { currentSceneId } = get()
        const nextIndex = SCENE_ORDER.indexOf(currentSceneId as typeof SCENE_ORDER[number]) + 1
        if (nextIndex >= SCENE_ORDER.length) {
          set({ screen: 'win' })
        } else {
          set({
            currentSceneId: SCENE_ORDER[nextIndex],
            currentExchangeIndex: 0,
            feedback: 'none',
            selectedOptionIndex: null,
            taskJustCompleted: false,
          })
        }
      },

      resetGame: () => set({ ...initialState }),
    }),
    {
      name: 'spanish-bread-game',
      // ponytail: only persist progress, not transient UI state
      partialize: (state) => ({
        currentSceneId: state.currentSceneId,
        completedTasks: state.completedTasks,
        currentExchangeIndex: state.currentExchangeIndex,
      }),
    }
  )
)