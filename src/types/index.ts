export interface DialogueOption {
  es: string
  en: string
  correct: boolean
}

export interface Exchange {
  id: string
  npcLine: string
  options: DialogueOption[]
}

export interface Scene {
  id: string
  title: string
  npcName: string
  vocabDomain: string
  task: string
  exchanges: Exchange[]
}
