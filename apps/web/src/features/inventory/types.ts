import type { Card } from '../catalog/types'

export type CardCondition =
  | 'mint'
  | 'near-mint'
  | 'excellent'
  | 'good'
  | 'light-played'
  | 'played'
  | 'poor'

export type CardEdition = 'first' | 'unlimited'

export interface InventoryItem {
  cardId: string
  card: Card // snapshot at the time of adding
  quantity: number // >= 1
  condition: CardCondition
  edition: CardEdition
  addedAt: string // ISO 8601
  updatedAt: string
}

export type Inventory = Record<string, InventoryItem> // key: cardId
