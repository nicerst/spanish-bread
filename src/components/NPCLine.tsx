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