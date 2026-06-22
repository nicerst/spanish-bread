# Spanish Bread MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-scene interactive 3D Spanish learning game with Pixar aesthetic, multiple-choice dialogue, and localStorage persistence — deployable as a static site.

**Architecture:** React + Vite SPA. R3F Canvas handles 3D scene (fixed camera, HDRI lighting, box-NPC placeholder). Tailwind overlay handles 2D dialogue UI. Zustand store holds all game state; non-transient fields persisted to localStorage via partialize. All content in static JSON.

**Tech Stack:** React 18, TypeScript, Vite, Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, Zustand, Tailwind CSS, Vitest, @testing-library/react

---

## File Map

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── test/setup.ts
├── types/index.ts
├── data/scenes.json
├── store/useGameStore.ts
├── utils/speak.ts
└── components/
    ├── StartScreen.tsx
    ├── HUD.tsx
    ├── NPCLine.tsx
    ├── OptionList.tsx
    ├── FeedbackToast.tsx
    ├── DialogueOverlay.tsx
    ├── NPCModel.tsx
    ├── SceneView.tsx
    └── WinScreen.tsx
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `src/test/setup.ts`
- Create: `src/index.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: Scaffold Vite project**

```bash
npm create vite@latest . -- --template react-ts
```

Expected: `package.json`, `src/main.tsx`, `src/App.tsx` created.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @vitest/coverage-v8 jsdom
```

- [ ] **Step 4: Init Tailwind**

```bash
npx tailwindcss init -p
```

- [ ] **Step 5: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 6: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow: hidden; }
```

- [ ] **Step 7: Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 8: Write `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom'

global.SpeechSynthesisUtterance = class {
  lang = ''
  text = ''
  constructor(text: string) { this.text = text }
} as any

global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: () => [],
} as any
```

- [ ] **Step 9: Write `src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server on localhost:5173, no errors.

- [ ] **Step 11: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Vite + R3F + Zustand + Tailwind + Vitest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```typescript
export interface DialogueOption {
  es: string
  en: string
  correct: boolean
}

export interface Exchange {
  id: string
  npcLine: string
  options: DialogueOption[]
}

export interface Scene {
  id: string
  title: string
  npcName: string
  vocabDomain: string
  task: string
  exchanges: Exchange[]
}
```

- [ ] **Step 2: Confirm TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Add `resolveJsonModule` to `tsconfig.json`**

In `tsconfig.json` under `compilerOptions`, add:
```json
"resolveJsonModule": true
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts tsconfig.json
git commit -m "feat: add TypeScript interfaces for Scene, Exchange, DialogueOption"
```

---

## Task 3: Dialogue Content

**Files:**
- Create: `src/data/scenes.json`
- Create: `src/data/scenes.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/data/scenes.test.ts
import { describe, it, expect } from 'vitest'
import scenes from './scenes.json'

describe('scenes.json', () => {
  it('has exactly 3 scenes', () => {
    expect(scenes).toHaveLength(3)
  })

  it('each scene has required fields', () => {
    for (const scene of scenes) {
      expect(scene.id).toBeTruthy()
      expect(scene.npcName).toBeTruthy()
      expect(scene.exchanges.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each exchange has exactly 3 options with exactly 1 correct', () => {
    for (const scene of scenes) {
      for (const exchange of scene.exchanges) {
        expect(exchange.options).toHaveLength(3)
        expect(exchange.options.filter((o: { correct: boolean }) => o.correct)).toHaveLength(1)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/data/scenes.test.ts
```

Expected: FAIL — `scenes.json` not found.

- [ ] **Step 3: Write `src/data/scenes.json`**

```json
[
  {
    "id": "cafe",
    "title": "El Café",
    "npcName": "El Camarero",
    "vocabDomain": "food/drink",
    "task": "Order food and pay the bill",
    "exchanges": [
      {
        "id": "cafe-1",
        "npcLine": "¡Buenos días! ¿Qué desea usted?",
        "options": [
          { "es": "Quiero un café con leche, por favor.", "en": "I'd like a coffee with milk, please.", "correct": true },
          { "es": "No hablo español.", "en": "I don't speak Spanish.", "correct": false },
          { "es": "¿Cuánto cuesta?", "en": "How much does it cost?", "correct": false }
        ]
      },
      {
        "id": "cafe-2",
        "npcLine": "¿Algo para comer?",
        "options": [
          { "es": "Sí, un bocadillo de jamón, por favor.", "en": "Yes, a ham sandwich, please.", "correct": true },
          { "es": "Quiero ir a la estación.", "en": "I want to go to the station.", "correct": false },
          { "es": "No entiendo.", "en": "I don't understand.", "correct": false }
        ]
      },
      {
        "id": "cafe-3",
        "npcLine": "¡Aquí tiene! ¡Buen provecho!",
        "options": [
          { "es": "Muchas gracias.", "en": "Thank you very much.", "correct": true },
          { "es": "No, gracias.", "en": "No, thank you.", "correct": false },
          { "es": "¿Dónde está el baño?", "en": "Where is the bathroom?", "correct": false }
        ]
      },
      {
        "id": "cafe-4",
        "npcLine": "¿Está todo bien?",
        "options": [
          { "es": "Sí, está muy rico.", "en": "Yes, it's very delicious.", "correct": true },
          { "es": "No, no me gusta.", "en": "No, I don't like it.", "correct": false },
          { "es": "Quiero más café.", "en": "I want more coffee.", "correct": false }
        ]
      },
      {
        "id": "cafe-5",
        "npcLine": "¿Desea algo más?",
        "options": [
          { "es": "La cuenta, por favor.", "en": "The bill, please.", "correct": true },
          { "es": "Otro café, por favor.", "en": "Another coffee, please.", "correct": false },
          { "es": "No, estoy bien.", "en": "No, I'm fine.", "correct": false }
        ]
      }
    ]
  },
  {
    "id": "plaza",
    "title": "La Plaza",
    "npcName": "El Vecino",
    "vocabDomain": "directions",
    "task": "Get directions to the bus station",
    "exchanges": [
      {
        "id": "plaza-1",
        "npcLine": "¡Hola! ¿Necesita ayuda?",
        "options": [
          { "es": "Sí, ¿dónde está la estación de autobuses?", "en": "Yes, where is the bus station?", "correct": true },
          { "es": "No, gracias. Estoy bien.", "en": "No thanks. I'm fine.", "correct": false },
          { "es": "Quiero un café.", "en": "I want a coffee.", "correct": false }
        ]
      },
      {
        "id": "plaza-2",
        "npcLine": "Claro. ¿Sabe cómo llegar?",
        "options": [
          { "es": "No, no sé. ¿Puede explicarme?", "en": "No, I don't know. Can you explain?", "correct": true },
          { "es": "Sí, ya sé.", "en": "Yes, I already know.", "correct": false },
          { "es": "No hablo español.", "en": "I don't speak Spanish.", "correct": false }
        ]
      },
      {
        "id": "plaza-3",
        "npcLine": "Siga recto por esta calle.",
        "options": [
          { "es": "¿Sigo recto por esta calle?", "en": "I go straight down this street?", "correct": true },
          { "es": "¿Giro a la izquierda?", "en": "I turn left?", "correct": false },
          { "es": "¿Está muy lejos?", "en": "Is it very far?", "correct": false }
        ]
      },
      {
        "id": "plaza-4",
        "npcLine": "Sí, y luego gire a la derecha.",
        "options": [
          { "es": "Entendido. ¿A la derecha?", "en": "Understood. To the right?", "correct": true },
          { "es": "¿A la izquierda?", "en": "To the left?", "correct": false },
          { "es": "¿Sigo recto?", "en": "I keep going straight?", "correct": false }
        ]
      },
      {
        "id": "plaza-5",
        "npcLine": "Exacto. Está enfrente del parque.",
        "options": [
          { "es": "Muchas gracias. ¡Es usted muy amable!", "en": "Thank you very much. You're very kind!", "correct": true },
          { "es": "No entiendo.", "en": "I don't understand.", "correct": false },
          { "es": "¿Dónde está el café?", "en": "Where is the café?", "correct": false }
        ]
      }
    ]
  },
  {
    "id": "bus-station",
    "title": "La Estación de Autobuses",
    "npcName": "El Taquillero",
    "vocabDomain": "travel/tickets",
    "task": "Buy a bus ticket",
    "exchanges": [
      {
        "id": "bus-1",
        "npcLine": "¡Buenos días! ¿En qué le puedo ayudar?",
        "options": [
          { "es": "Quiero un billete para Madrid, por favor.", "en": "I'd like a ticket to Madrid, please.", "correct": true },
          { "es": "¿Dónde está el autobús?", "en": "Where is the bus?", "correct": false },
          { "es": "Quiero un café.", "en": "I want a coffee.", "correct": false }
        ]
      },
      {
        "id": "bus-2",
        "npcLine": "¿Ida o ida y vuelta?",
        "options": [
          { "es": "Ida y vuelta, por favor.", "en": "Round trip, please.", "correct": true },
          { "es": "Solo ida.", "en": "One way only.", "correct": false },
          { "es": "No entiendo.", "en": "I don't understand.", "correct": false }
        ]
      },
      {
        "id": "bus-3",
        "npcLine": "¿Para cuándo?",
        "options": [
          { "es": "Para hoy, por favor.", "en": "For today, please.", "correct": true },
          { "es": "Para mañana.", "en": "For tomorrow.", "correct": false },
          { "es": "No sé.", "en": "I don't know.", "correct": false }
        ]
      },
      {
        "id": "bus-4",
        "npcLine": "El próximo autobús sale a las tres.",
        "options": [
          { "es": "Perfecto. ¿Cuánto cuesta?", "en": "Perfect. How much does it cost?", "correct": true },
          { "es": "¿A las cuatro?", "en": "At four o'clock?", "correct": false },
          { "es": "No quiero ese.", "en": "I don't want that one.", "correct": false }
        ]
      },
      {
        "id": "bus-5",
        "npcLine": "Son veinte euros.",
        "options": [
          { "es": "Aquí tiene. Muchas gracias.", "en": "Here you go. Thank you very much.", "correct": true },
          { "es": "Es muy caro.", "en": "That's very expensive.", "correct": false },
          { "es": "No tengo dinero.", "en": "I don't have money.", "correct": false }
        ]
      }
    ]
  }
]
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/data/scenes.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/scenes.json src/data/scenes.test.ts
git commit -m "feat: add scenes.json — 3 scenes, 5 exchanges each, 3 options each"
```

---

## Task 4: speak Utility

**Files:**
- Create: `src/utils/speak.ts`
- Create: `src/utils/speak.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/utils/speak.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { speak } from './speak'

describe('speak', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls speechSynthesis.speak with correct lang and text', () => {
    speak('Hola')
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'es-ES', text: 'Hola' })
    )
  })

  it('accepts custom lang override', () => {
    speak('Hello', 'en-US')
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'en-US' })
    )
  })

  it('does not throw when speechSynthesis is unavailable', () => {
    const saved = (window as any).speechSynthesis
    delete (window as any).speechSynthesis
    expect(() => speak('test')).not.toThrow()
    ;(window as any).speechSynthesis = saved
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/utils/speak.test.ts
```

Expected: FAIL — `speak` not found.

- [ ] **Step 3: Write `src/utils/speak.ts`**

```typescript
// ponytail: Web Speech API, zero assets, swap for VO in v2
export const speak = (text: string, lang = 'es-ES'): void => {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  speechSynthesis.speak(utterance)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/utils/speak.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/speak.ts src/utils/speak.test.ts
git commit -m "feat: add speak utility wrapping Web Speech API"
```

---

## Task 5: Zustand Game Store

**Files:**
- Create: `src/store/useGameStore.ts`
- Create: `src/store/useGameStore.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/store/useGameStore.test.ts
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

  it('sets taskJustCompleted and adds to completedTasks on last exchange', () => {
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/store/useGameStore.test.ts
```

Expected: FAIL — `useGameStore` not found.

- [ ] **Step 3: Write `src/store/useGameStore.ts`**

```typescript
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
      // ponytail: only persist progress fields, not transient UI state
      partialize: (state) => ({
        currentSceneId: state.currentSceneId,
        completedTasks: state.completedTasks,
        currentExchangeIndex: state.currentExchangeIndex,
      }),
    }
  )
)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/store/useGameStore.test.ts
```

Expected: PASS — all tests.

- [ ] **Step 5: Commit**

```bash
git add src/store/useGameStore.ts src/store/useGameStore.test.ts
git commit -m "feat: add Zustand store with localStorage persistence"
```

---

## Task 6: StartScreen

**Files:**
- Create: `src/components/StartScreen.tsx`
- Create: `src/components/StartScreen.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/StartScreen.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/StartScreen.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/StartScreen.tsx`**

```tsx
import { useGameStore } from '../store/useGameStore'

export function StartScreen() {
  const { startGame, continueGame, completedTasks } = useGameStore()
  const hasSavedProgress = completedTasks.length > 0

  return (
    <div className="min-h-screen bg-amber-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Spanish Bread</h1>
        <p className="text-xl mb-8 text-amber-200">
          You're stranded. Find food, get directions, buy a bus ticket.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={startGame}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 rounded-lg font-bold text-lg transition-colors"
          >
            New Game
          </button>
          {hasSavedProgress && (
            <button
              onClick={continueGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/StartScreen.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/StartScreen.tsx src/components/StartScreen.test.tsx
git commit -m "feat: add StartScreen with New Game / Continue"
```

---

## Task 7: HUD

**Files:**
- Create: `src/components/HUD.tsx`
- Create: `src/components/HUD.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/HUD.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/HUD.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/HUD.tsx`**

```tsx
import { useGameStore } from '../store/useGameStore'
import scenes from '../data/scenes.json'

const SCENE_ICONS = ['🍽️', '🗺️', '🚌']

export function HUD() {
  const { completedTasks, currentSceneId } = useGameStore()

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-6 bg-black/40 backdrop-blur px-6 py-3 rounded-full z-10">
      {scenes.map((scene, i) => {
        const done = completedTasks.includes(scene.id)
        const active = scene.id === currentSceneId
        return (
          <div
            key={scene.id}
            className={`flex flex-col items-center gap-1 text-sm ${
              done ? 'text-green-400' : active ? 'text-white' : 'text-white/40'
            }`}
          >
            <span className="text-2xl">{SCENE_ICONS[i]}</span>
            {done && <span>✓</span>}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/HUD.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/HUD.tsx src/components/HUD.test.tsx
git commit -m "feat: add HUD with task progress icons"
```

---

## Task 8: NPCLine

**Files:**
- Create: `src/components/NPCLine.tsx`
- Create: `src/components/NPCLine.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/NPCLine.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NPCLine } from './NPCLine'

beforeEach(() => vi.clearAllMocks())

describe('NPCLine', () => {
  it('renders NPC name', () => {
    render(<NPCLine npcName="El Camarero" line="¡Buenos días!" />)
    expect(screen.getByText('El Camarero')).toBeInTheDocument()
  })

  it('renders dialogue line', () => {
    render(<NPCLine npcName="El Camarero" line="¡Buenos días!" />)
    expect(screen.getByText('¡Buenos días!')).toBeInTheDocument()
  })

  it('calls speak on mount', () => {
    render(<NPCLine npcName="El Camarero" line="¡Buenos días!" />)
    expect(speechSynthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: '¡Buenos días!', lang: 'es-ES' })
    )
  })

  it('calls speak again when line prop changes', () => {
    const { rerender } = render(<NPCLine npcName="El Camarero" line="¡Buenos días!" />)
    rerender(<NPCLine npcName="El Camarero" line="¿Algo para comer?" />)
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/NPCLine.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/NPCLine.tsx`**

```tsx
import { useEffect } from 'react'
import { speak } from '../utils/speak'

interface Props {
  npcName: string
  line: string
}

export function NPCLine({ npcName, line }: Props) {
  useEffect(() => { speak(line) }, [line])

  return (
    <div className="mb-4">
      <span className="text-amber-400 font-bold text-sm uppercase tracking-wide">{npcName}</span>
      <p className="text-white text-lg mt-1">{line}</p>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/NPCLine.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/NPCLine.tsx src/components/NPCLine.test.tsx
git commit -m "feat: add NPCLine with TTS on render"
```

---

## Task 9: OptionList

**Files:**
- Create: `src/components/OptionList.tsx`
- Create: `src/components/OptionList.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/OptionList.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/OptionList.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/OptionList.tsx`**

```tsx
import { useGameStore } from '../store/useGameStore'
import type { DialogueOption } from '../types'

interface Props {
  options: DialogueOption[]
}

export function OptionList({ options }: Props) {
  const { selectOption, feedback } = useGameStore()
  const isLocked = feedback === 'correct'

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, i) => (
        <button
          key={i}
          onClick={() => !isLocked && selectOption(i)}
          className={`px-4 py-3 rounded-lg text-left text-white font-medium transition-colors ${
            isLocked ? 'opacity-50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {option.es}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/OptionList.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/OptionList.tsx src/components/OptionList.test.tsx
git commit -m "feat: add OptionList with 3 Spanish option buttons"
```

---

## Task 10: FeedbackToast

**Files:**
- Create: `src/components/FeedbackToast.tsx`
- Create: `src/components/FeedbackToast.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/FeedbackToast.test.tsx
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
    expect(screen.getByText(/I'd like a coffee with milk/i)).toBeInTheDocument()
  })

  it('shows hint with correct answer on wrong selection', () => {
    useGameStore.setState({ feedback: 'wrong', selectedOptionIndex: 1 })
    render(<FeedbackToast options={options} onCorrectAutoAdvance={onAdvance} />)
    expect(screen.getByText(/Hint:/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/FeedbackToast.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/FeedbackToast.tsx`**

```tsx
import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import type { DialogueOption } from '../types'

interface Props {
  options: DialogueOption[]
  onCorrectAutoAdvance: () => void
}

export function FeedbackToast({ options, onCorrectAutoAdvance }: Props) {
  const { feedback, selectedOptionIndex, taskJustCompleted } = useGameStore()
  const selected = selectedOptionIndex !== null ? options[selectedOptionIndex] : null
  const correct = options.find(o => o.correct)!

  useEffect(() => {
    if (feedback === 'correct' && !taskJustCompleted) {
      const timer = setTimeout(onCorrectAutoAdvance, 1500)
      return () => clearTimeout(timer)
    }
  }, [feedback, taskJustCompleted, onCorrectAutoAdvance])

  if (feedback === 'none') return null

  return (
    <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
      feedback === 'correct' ? 'bg-green-900/80 text-green-200' : 'bg-red-900/80 text-red-200'
    }`}>
      {feedback === 'correct' && selected && <span>✓ {selected.en}</span>}
      {feedback === 'wrong' && (
        <span>Hint: &quot;{correct.es}&quot; = {correct.en}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/FeedbackToast.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FeedbackToast.tsx src/components/FeedbackToast.test.tsx
git commit -m "feat: add FeedbackToast with gloss on correct, hint on wrong"
```

---

## Task 11: WinScreen

**Files:**
- Create: `src/components/WinScreen.tsx`
- Create: `src/components/WinScreen.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/WinScreen.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/WinScreen.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/WinScreen.tsx`**

```tsx
import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { speak } from '../utils/speak'

export function WinScreen() {
  const resetGame = useGameStore(s => s.resetGame)

  useEffect(() => { speak('¡Lo lograste!') }, [])

  return (
    <div className="min-h-screen bg-amber-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-5xl font-bold mb-2">¡Lo lograste!</h1>
        <p className="text-2xl text-amber-200 mb-8">You escaped.</p>
        <div className="flex gap-6 justify-center text-3xl mb-8">
          <span>🍽️ ✓</span>
          <span>🗺️ ✓</span>
          <span>🚌 ✓</span>
        </div>
        <button
          onClick={resetGame}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-400 rounded-lg font-bold text-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/WinScreen.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/WinScreen.tsx src/components/WinScreen.test.tsx
git commit -m "feat: add WinScreen with TTS and Play Again"
```

---

## Task 12: DialogueOverlay

**Files:**
- Create: `src/components/DialogueOverlay.tsx`
- Create: `src/components/DialogueOverlay.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/DialogueOverlay.test.tsx
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
    expect(screen.getByText('¡Buenos días! ¿Qué desea usted?')).toBeInTheDocument()
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/components/DialogueOverlay.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/components/DialogueOverlay.tsx`**

```tsx
import { useGameStore } from '../store/useGameStore'
import scenes from '../data/scenes.json'
import type { Scene } from '../types'
import { NPCLine } from './NPCLine'
import { OptionList } from './OptionList'
import { FeedbackToast } from './FeedbackToast'

export function DialogueOverlay() {
  const { currentSceneId, currentExchangeIndex, taskJustCompleted, advanceExchange, goToNextScene } = useGameStore()
  const scene = (scenes as Scene[]).find(s => s.id === currentSceneId)
  if (!scene) return null
  const exchange = scene.exchanges[currentExchangeIndex]

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-6 z-10">
      <NPCLine npcName={scene.npcName} line={exchange.npcLine} />
      {taskJustCompleted ? (
        <div className="text-center py-4">
          <p className="text-green-400 text-xl font-bold mb-4">✓ Task Complete!</p>
          <button
            onClick={goToNextScene}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 rounded-lg font-bold text-lg transition-colors text-white"
          >
            Continue →
          </button>
        </div>
      ) : (
        <>
          <OptionList options={exchange.options} />
          <FeedbackToast options={exchange.options} onCorrectAutoAdvance={advanceExchange} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/components/DialogueOverlay.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/DialogueOverlay.tsx src/components/DialogueOverlay.test.tsx
git commit -m "feat: add DialogueOverlay composing NPC line, options, feedback"
```

---

## Task 13: NPCModel + SceneView (R3F — verified via dev server)

**Files:**
- Create: `src/components/NPCModel.tsx`
- Create: `src/components/SceneView.tsx`

> R3F components require WebGL — jsdom cannot execute them. Verified by running the dev server.

- [ ] **Step 1: Write `src/components/NPCModel.tsx`**

```tsx
// ponytail: box placeholder with Pixar head proportions; swap for GLTF asset in v2
export function NPCModel() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#e88b4a" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#f4c28a" />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Write `src/components/SceneView.tsx`**

```tsx
import { Canvas } from '@react-three/fiber'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { HUD } from './HUD'
import { DialogueOverlay } from './DialogueOverlay'
import { NPCModel } from './NPCModel'

export function SceneView() {
  return (
    <div className="relative w-full h-screen">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <NPCModel />
        <EffectComposer>
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <DialogueOverlay />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NPCModel.tsx src/components/SceneView.tsx
git commit -m "feat: add R3F SceneView with sunset HDRI and box NPC placeholder"
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Click New Game. Confirm: warm 3D scene, box NPC visible, HUD icons at top, dialogue overlay at bottom with Spanish options.

---

## Task 14: App Orchestration

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/App.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/App.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Write `src/App.tsx`**

```tsx
import { useGameStore } from './store/useGameStore'
import { StartScreen } from './components/StartScreen'
import { SceneView } from './components/SceneView'
import { WinScreen } from './components/WinScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)
  if (screen === 'start') return <StartScreen />
  if (screen === 'win') return <WinScreen />
  return <SceneView />
}
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: wire App routing between Start, Game, and Win screens"
```

---

## Task 15: Full Game Loop Verification

> Manual walkthrough — confirms the complete game loop works end-to-end.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify Start screen** — title visible, "New Game" present, no "Continue".

- [ ] **Step 3: Verify Café scene** — click New Game. Confirm: 3D scene, HUD with 3 icons, El Camarero dialogue, TTS plays, 3 Spanish options.

- [ ] **Step 4: Verify wrong answer** — click wrong option. Confirm: hint tooltip appears, all 3 options still clickable.

- [ ] **Step 5: Verify correct answer** — click correct option. Confirm: green gloss toast, options lock, auto-advances after 1.5s.

- [ ] **Step 6: Verify task completion** — complete all 5 café exchanges. Confirm: "✓ Task Complete!" + "Continue →", HUD checkmark on café icon.

- [ ] **Step 7: Verify Plaza and Bus Station** — click Continue through Plaza, then Bus Station. Confirm each has correct NPC name and vocab domain.

- [ ] **Step 8: Verify win screen** — complete Bus Station. Confirm: "¡Lo lograste!" + TTS + 3 ✓ icons + "Play Again".

- [ ] **Step 9: Verify persistence** — complete 1 scene, refresh browser. Confirm: "Continue" button appears on Start screen; clicking it loads Plaza (not Café).

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "feat: Spanish Bread MVP complete — 3-scene Spanish learning game"
```

---

## Self-Review

| Spec requirement | Task |
|-----------------|------|
| US-01 Start Game | 6, 14 |
| US-02 Navigate scenes | 5 (goToNextScene), 12 (Continue btn) |
| US-03 Talk to NPC | 8 (NPCLine), 9 (OptionList) |
| US-04 Correct feedback + gloss | 10 (FeedbackToast correct branch) |
| US-05 Wrong feedback + hint | 10 (FeedbackToast wrong branch) |
| US-06 Task complete | 5 (selectOption last-exchange), 12 (Task Complete UI) |
| US-07 Win screen | 11, 14 |
| US-08 Progress persists | 5 (partialize), 15 (Step 9) |
| Pixar HDRI lighting | 13 (Environment preset="sunset") |
| TTS audio | 4 (speak), 8 (NPCLine), 11 (WinScreen) |
| 3 scenes × 5 exchanges | 3 (scenes.json) |

No gaps. No placeholders. Types consistent across all tasks (`DialogueOption`, `Exchange`, `Scene`, `feedback: 'none'|'correct'|'wrong'`, `screen: 'start'|'game'|'win'`).
