# Spanish Bread

Interactive 3D web game that teaches conversational Spanish through story. You're a traveler stranded in a Spanish-speaking town — complete 3 tasks by choosing correct Spanish dialogue responses to escape.

**Zero backend. Zero install. Runs in browser.**

## Stack

| Layer | Tech |
|-------|------|
| UI | React 18 + TypeScript |
| 3D | Three.js via React Three Fiber |
| Helpers | `@react-three/drei` (HDRI, camera, loaders) |
| Post-FX | `@react-three/postprocessing` |
| State | Zustand + localStorage persistence |
| Styling | Tailwind CSS |
| Build | Vite |
| Audio | Web Speech API (browser-native, no assets) |

## Scenes

| # | Location | NPC | Vocab |
|---|----------|-----|-------|
| 1 | El Café | El Camarero | Food & drink |
| 2 | La Plaza | El Vecino | Directions |
| 3 | La Estación | El Taquillero | Travel & tickets |

Each scene has 5 dialogue exchanges with 3 options each. Choose correctly to advance. No lives. No score penalty. Try again freely.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

## Build

```bash
npm run build     # outputs to /dist
npm run preview   # preview production build locally
```

Deploy `/dist` to Vercel or Netlify — no config needed.

## Tests

```bash
npm test
```

## Game Loop

```
Start Screen → Scene 1 (Café) → Scene 2 (Plaza) → Scene 3 (Bus Station) → Win Screen
```

Progress auto-saves to localStorage. Refresh mid-game and resume where you left off.
