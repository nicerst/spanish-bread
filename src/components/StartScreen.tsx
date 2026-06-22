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