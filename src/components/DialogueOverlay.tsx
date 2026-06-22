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