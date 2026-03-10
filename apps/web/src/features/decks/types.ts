import type { Card } from '../catalog/types'

export type DeckSection = 'main' | 'extra' | 'side'

export interface DeckEntry {
  cardId: string
  card: Card // snapshot at the time of adding
  quantity: number // 1–3
  section: DeckSection
}

export interface Deck {
  id: string
  name: string
  entries: DeckEntry[]
  createdAt: string
  updatedAt: string
}

export type DecksState = Record<string, Deck> // key: deckId

// YGO official limits
export const DECK_LIMITS: Record<DeckSection, { min: number; max: number }> = {
  main: { min: 40, max: 60 },
  extra: { min: 0, max: 15 },
  side: { min: 0, max: 15 },
}

export const MAX_COPIES_PER_DECK = 3

export type AddCardResult = 'ok' | 'maxCopies' | 'sectionFull'

// Cards with these frameTypes belong to the Extra Deck, not the Main Deck
export const EXTRA_DECK_FRAME_TYPES = new Set([
  'fusion',
  'fusion_pendulum',
  'synchro',
  'synchro_pendulum',
  'xyz',
  'xyz_pendulum',
  'link',
])

export function isExtraDeckCard(card: { frameType: string }): boolean {
  return EXTRA_DECK_FRAME_TYPES.has(card.frameType)
}
