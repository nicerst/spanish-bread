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