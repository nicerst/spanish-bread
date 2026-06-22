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
          className={`px-4 py-3 rounded-lg text-left text-white font-medium transition-colors ${isLocked ? 'opacity-50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {option.es}
        </button>
      ))}
    </div>
  )
}