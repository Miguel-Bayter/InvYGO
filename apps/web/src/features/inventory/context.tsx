import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Inventory, InventoryItem, CardCondition, CardEdition } from './types'
import { loadInventory, saveInventory } from './storage'
import type { Card } from '../catalog/types'

interface AddOrUpdatePayload {
  card: Card
  quantity: number
  condition: CardCondition
  edition: CardEdition
}

interface InventoryContextValue {
  inventory: Inventory
  addOrUpdate: (payload: AddOrUpdatePayload) => void
  remove: (cardId: string) => void
  getItem: (cardId: string) => InventoryItem | undefined
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<Inventory>(() => loadInventory())

  const addOrUpdate = useCallback((payload: AddOrUpdatePayload) => {
    const { card, quantity, condition, edition } = payload
    const now = new Date().toISOString()

    setInventory(prev => {
      const existing = prev[card.id]
      const next: Inventory = {
        ...prev,
        [card.id]: {
          cardId: card.id,
          card,
          quantity,
          condition,
          edition,
          addedAt: existing?.addedAt ?? now,
          updatedAt: now,
        },
      }
      saveInventory(next)
      return next
    })
  }, [])

  const remove = useCallback((cardId: string) => {
    setInventory(prev => {
      const next = { ...prev }
      delete next[cardId]
      saveInventory(next)
      return next
    })
  }, [])

  const getItem = useCallback(
    (cardId: string) => inventory[cardId],
    [inventory]
  )

  return (
    <InventoryContext.Provider value={{ inventory, addOrUpdate, remove, getItem }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used inside <InventoryProvider>')
  return ctx
}
