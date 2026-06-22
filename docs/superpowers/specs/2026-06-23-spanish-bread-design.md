# Spanish Bread — MVP Design Spec
**Date:** 2026-06-23  
**Status:** Approved  
**Scope:** MVP prototype — 3 scenes, core loop, static deploy

---

## 1. Product Summary

An interactive 3D web game that teaches adult beginners conversational Spanish through a story. The player is a traveler stranded in a Spanish-speaking town. To escape, they must complete 3 tasks by choosing correct Spanish dialogue responses when talking to NPCs. Pixar aesthetic via low-poly CC0 assets + HDRI lighting. Zero backend. Zero install.

---

## 2. User Stories & Acceptance Criteria

### US-01 — Start Game
**As a** player  
**I want to** launch the game and immediately understand what to do  
**So that** I don't need a tutorial

**Acceptance Criteria:**
- [ ] Opening screen shows town scene with a brief text overlay: "You're stranded. Find food, get directions, buy a bus ticket."
- [ ] A single "Start" button begins the game
- [ ] Game state is checked on load — if prior progress exists in localStorage, a "Continue" option is shown alongside "New Game"
- [ ] No login required

---

### US-02 — Navigate Between Scenes
**As a** player  
**I want to** travel between the café, plaza, and bus station  
**So that** I can complete each task in sequence

**Acceptance Criteria:**
- [ ] After completing a Scene's Task, a "Continue →" arrow appears
- [ ] Clicking it transitions to the next Scene with a fade animation
- [ ] Scenes unlock in order: Café → Plaza → Bus Station
- [ ] Current Scene and completed Tasks are reflected in a minimal HUD (3 icons, checkmark on complete)

---

### US-03 — Talk to an NPC
**As a** player  
**I want to** select a Spanish response from 3 options  
**So that** I can practice real Spanish in context

**Acceptance Criteria:**
- [ ] NPC line displays in Spanish with a subtitle
- [ ] Web Speech API reads the NPC line aloud in `es-ES`
- [ ] 3 Dialogue Options appear as clickable buttons below the scene
- [ ] Options are in Spanish; English gloss is hidden until after selection
- [ ] Clicking an option triggers the NPC response

---

### US-04 — Correct Answer Feedback
**As a** player  
**I want to** know when I chose correctly and what it means  
**So that** I learn and feel progress

**Acceptance Criteria:**
- [ ] Correct selection: NPC reacts positively (animated nod or brief positive line)
- [ ] Translation Gloss fades in for 2 seconds showing English meaning
- [ ] Dialogue advances to the next Exchange automatically after 1.5s
- [ ] TTS reads the player's chosen Spanish line aloud

---

### US-05 — Wrong Answer Feedback
**As a** player  
**I want to** know when I'm wrong and try again  
**So that** I learn without being penalized harshly

**Acceptance Criteria:**
- [ ] Wrong selection: NPC shows Confusion Reaction (shrug animation + confused audio)
- [ ] Small tooltip appears showing the correct answer's English translation
- [ ] All 3 options remain visible — player must try again
- [ ] No lives system, no score penalty — just try again

---

### US-06 — Complete a Task
**As a** player  
**I want to** finish all Dialogue Exchanges in a Scene  
**So that** I feel accomplishment and move forward

**Acceptance Criteria:**
- [ ] Last Dialogue Exchange completion triggers Task Complete animation (checkmark + brief celebratory NPC line)
- [ ] Task marked complete in Game State and HUD
- [ ] "Continue →" button appears

---

### US-07 — Escape (Win)
**As a** player  
**I want to** complete all 3 tasks and see a win screen  
**So that** I feel the narrative payoff

**Acceptance Criteria:**
- [ ] After Bus Station Task completes, a win screen renders: "¡Lo lograste! You escaped."
- [ ] Win screen shows 3 completed task icons + a "Play Again" button
- [ ] "Play Again" clears Game State and restarts from Scene 1
- [ ] TTS reads "¡Lo lograste!" aloud

---

### US-08 — Progress Persists
**As a** player  
**I want to** return to the game later and resume where I left off  
**So that** I don't lose progress on browser refresh/close

**Acceptance Criteria:**
- [ ] Game State (current scene, completed tasks, dialogue position) written to localStorage on every state change
- [ ] On load, state is rehydrated from localStorage via Zustand persist middleware
- [ ] "New Game" on start screen clears localStorage and resets state

---

## 3. Architecture Design

### Overview

```
Browser
└── React + Vite (SPA)
    ├── R3F Canvas (3D scene layer)
    │   ├── Scene mesh + lighting (HDRI + directional)
    │   ├── NPC model (CC0 GLTF)
    │   └── Camera (fixed per scene, drei/PerspectiveCamera)
    ├── Tailwind UI overlay (2D layer, absolute positioned)
    │   ├── HUD (task progress icons)
    │   ├── Dialogue Box (NPC line + 3 option buttons)
    │   └── Feedback Layer (gloss tooltip, confusion tooltip)
    └── Zustand store (game state)
        └── localStorage (persisted via zustand/middleware)

Data
└── /src/data/scenes.json (all content, static)

Audio
└── Web Speech API (browser-native, no assets)

Deploy
└── Vite build → static files → Vercel/Netlify
```

---

### Component Tree

```
<App>
└── <GameProvider>          ← Zustand store init
    ├── <HUD />             ← task progress, always visible
    ├── <SceneView />       ← renders current scene
    │   ├── <R3FCanvas />   ← Three.js scene
    │   │   ├── <Environment preset="sunset" />  ← drei HDRI
    │   │   ├── <NPCModel sceneId={...} />
    │   │   └── <SceneLighting />
    │   └── <DialogueOverlay />   ← Tailwind UI over canvas
    │       ├── <NPCLine />       ← current NPC text + TTS trigger
    │       ├── <OptionList />    ← 3 option buttons
    │       └── <FeedbackToast /> ← gloss / confusion tooltip
    └── <WinScreen />       ← shown when all tasks complete
```

---

### Data Shape (`/src/data/scenes.json`)

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
        "npcLine": "¡Buenos días! ¿Qué desea?",
        "options": [
          { "es": "Quiero un café, por favor.", "en": "I'd like a coffee, please.", "correct": true },
          { "es": "No hablo español.", "en": "I don't speak Spanish.", "correct": false },
          { "es": "¿Dónde está el baño?", "en": "Where is the bathroom?", "correct": false }
        ]
      }
    ]
  }
]
```

---

### State Shape (Zustand)

```typescript
interface GameState {
  currentSceneId: string;           // 'cafe' | 'plaza' | 'bus-station' | 'win'
  completedTasks: string[];         // scene ids
  currentExchangeIndex: number;     // position within scene's exchanges
  feedback: 'none' | 'correct' | 'wrong';
  selectedOptionIndex: number | null;

  // actions
  selectOption: (index: number) => void;
  advanceExchange: () => void;
  completeTask: () => void;
  goToNextScene: () => void;
  resetGame: () => void;
}
```

---

### Audio

```typescript
// ponytail: Web Speech API, zero assets, swap for VO in v2
const speak = (text: string, lang = 'es-ES') => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
};
```

Called on: NPC line render, correct option selection.

---

## 4. Scene Specifications

| Scene | Location | NPC | Vocab Domain | Exchanges | Task Trigger |
|-------|----------|-----|--------------|-----------|--------------|
| 1 | Café | El Camarero | Food/drink | 5 | Pay bill confirmed |
| 2 | Plaza | El Vecino | Directions | 5 | Directions received |
| 3 | Bus Station | El Taquillero | Travel/tickets | 5 | Ticket purchased |

**Scene 1 vocab targets:** `quiero`, `por favor`, `la cuenta`, `desea`, `gracias`  
**Scene 2 vocab targets:** `a la derecha`, `a la izquierda`, `enfrente de`, `¿dónde está?`, `siga recto`  
**Scene 3 vocab targets:** `un billete`, `¿a qué hora?`, `ida y vuelta`, `el próximo`, `¿cuánto cuesta?`

---

## 5. Visual Design Direction

- **Lighting:** `@react-three/drei` `<Environment preset="sunset" />` — warm golden HDRI
- **Color grade:** Post-processing via `@react-three/postprocessing` — slight vignette, warm tone mapping
- **Assets:** CC0 low-poly GLTF from Kenney.nl or Sketchfab (town kit, character)
- **Camera:** Fixed `PerspectiveCamera` per scene, slightly low angle looking up at NPC (Pixar framing)
- **NPC scale:** Slightly enlarged head proportions if asset allows (Pixar character feel)
- **UI:** Tailwind dark overlay card at bottom of screen for dialogue — semi-transparent, rounded

---

## 6. Error Handling

| Scenario | Handling |
|----------|----------|
| TTS not supported | Silent fallback — no audio, no error shown |
| GLTF load failure | Show colored placeholder box for NPC, game continues |
| localStorage unavailable | Game works, state not persisted, no error shown |
| All 3 options wrong repeatedly | No lockout — player can keep trying indefinitely |

---

## 7. Out of Scope (MVP)

- User accounts / cross-device sync
- Free text / LLM dialogue
- More than 3 scenes
- Score / leaderboard
- Grammar explanations / lesson cards
- Mobile app
- Multiple difficulty levels
- Recorded voice acting

---

## 8. Dependencies

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `vite` | Build tool |
| `three` | 3D engine |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | R3F helpers (env, loaders, camera) |
| `@react-three/postprocessing` | Visual post-processing |
| `zustand` | Game state management |
| `tailwindcss` | 2D UI styling |

No backend. No auth. No paid APIs.

---

## 9. Deploy

Vite build → `/dist` → Vercel or Netlify static hosting. Zero config needed.
