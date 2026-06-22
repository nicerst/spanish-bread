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