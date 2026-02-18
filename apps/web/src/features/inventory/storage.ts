import type { Inventory } from './types'

const STORAGE_KEY = 'invygo_inventory'

export function loadInventory(): Inventory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Inventory
  } catch {
    return {}
  }
}

export function saveInventory(inventory: Inventory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
  } catch {
    // Silently ignore storage errors (e.g. private mode quota)
  }
}
