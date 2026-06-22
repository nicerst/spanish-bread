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
        const color = done ? 'text-green-400' : active ? 'text-white' : 'text-white/40'
        return (
          <div key={scene.id} className={`flex flex-col items-center gap-1 text-sm ${color}`}>
            <span className="text-2xl">{SCENE_ICONS[i]}</span>
            {done && <span>✓</span>}
          </div>
        )
      })}
    </div>
  )
}