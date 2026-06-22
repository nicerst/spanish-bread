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

  const cls = feedback === 'correct' ? 'bg-green-900/80 text-green-200' : 'bg-red-900/80 text-red-200'
  return (
    <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${cls}`}>
      {feedback === 'correct' && selected && <span>✓ {selected.en}</span>}
      {feedback === 'wrong' && (
        <span>Hint: &quot;{correct.es}&quot; = {correct.en}</span>
      )}
    </div>
  )
}