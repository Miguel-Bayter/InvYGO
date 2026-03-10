import type { DecksState } from './types'

const STORAGE_KEY = 'invygo_decks'
const ACTIVE_DECK_KEY = 'invygo_active_deck'

export function loadDecks(): DecksState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as DecksState
  } catch {
    return {}
  }
}

export function saveDecks(decks: DecksState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
  } catch {
    // Silently ignore storage errors (e.g. private mode quota)
  }
}

export function loadActiveDeckId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_DECK_KEY)
  } catch {
    return null
  }
}

export function saveActiveDeckId(id: string | null): void {
  try {
    if (id === null) {
      localStorage.removeItem(ACTIVE_DECK_KEY)
    } else {
      localStorage.setItem(ACTIVE_DECK_KEY, id)
    }
  } catch {
    // ignore
  }
}
