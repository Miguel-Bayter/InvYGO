import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Deck, DecksState, DeckSection, AddCardResult } from './types'
import type { Card } from '../catalog/types'
import { MAX_COPIES_PER_DECK, DECK_LIMITS, isExtraDeckCard } from './types'
import { loadDecks, saveDecks, loadActiveDeckId, saveActiveDeckId } from './storage'

function generateId(): string {
  return `deck_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

interface DecksContextValue {
  decks: DecksState
  activeDeckId: string | null
  activeDeck: Deck | null
  createDeck: (name: string) => string
  cloneDeck: (deckId: string) => string
  deleteDeck: (deckId: string) => void
  renameDeck: (deckId: string, name: string) => void
  setActiveDeck: (deckId: string | null) => void
  addCard: (deckId: string, card: Card, section: DeckSection, qty?: number) => AddCardResult
  removeCard: (deckId: string, cardId: string, section: DeckSection) => void
  updateQuantity: (deckId: string, cardId: string, section: DeckSection, quantity: number) => void
}

const DecksContext = createContext<DecksContextValue | null>(null)

export function DecksProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<DecksState>(() => loadDecks())
  const [activeDeckId, setActiveDeckIdState] = useState<string | null>(() => {
    const id = loadActiveDeckId()
    const loaded = loadDecks()
    return id && loaded[id] ? id : null
  })

  const activeDeck = activeDeckId ? (decks[activeDeckId] ?? null) : null

  const persistDecks = useCallback((next: DecksState) => {
    saveDecks(next)
    setDecks(next)
  }, [])

  const createDeck = useCallback(
    (name: string): string => {
      const id = generateId()
      const now = new Date().toISOString()
      const existingNames = new Set(Object.values(decks).map(d => d.name))
      const baseName = name.trim() || 'New Deck'
      let uniqueName = baseName
      if (existingNames.has(uniqueName)) {
        let counter = 2
        while (existingNames.has(`${baseName} ${counter}`)) counter++
        uniqueName = `${baseName} ${counter}`
      }
      const deck: Deck = {
        id,
        name: uniqueName,
        entries: [],
        createdAt: now,
        updatedAt: now,
      }
      const next = { ...decks, [id]: deck }
      persistDecks(next)
      setActiveDeckIdState(id)
      saveActiveDeckId(id)
      return id
    },
    [decks, persistDecks]
  )

  const cloneDeck = useCallback(
    (deckId: string): string => {
      const source = decks[deckId]
      if (!source) return ''
      const newId = generateId()
      const now = new Date().toISOString()
      const existingNames = new Set(Object.values(decks).map(d => d.name))
      const baseName = `${source.name} (copy)`
      let uniqueName = baseName
      if (existingNames.has(uniqueName)) {
        let counter = 2
        while (existingNames.has(`${baseName} ${counter}`)) counter++
        uniqueName = `${baseName} ${counter}`
      }
      const clone: Deck = {
        id: newId,
        name: uniqueName,
        entries: source.entries.map(e => ({ ...e })),
        createdAt: now,
        updatedAt: now,
      }
      const next = { ...decks, [newId]: clone }
      persistDecks(next)
      setActiveDeckIdState(newId)
      saveActiveDeckId(newId)
      return newId
    },
    [decks, persistDecks]
  )

  const deleteDeck = useCallback(
    (deckId: string) => {
      const next = { ...decks }
      delete next[deckId]
      persistDecks(next)
      if (activeDeckId === deckId) {
        const remaining = Object.keys(next)
        const newActive = remaining[0] ?? null
        setActiveDeckIdState(newActive)
        saveActiveDeckId(newActive)
      }
    },
    [decks, persistDecks, activeDeckId]
  )

  const renameDeck = useCallback(
    (deckId: string, name: string) => {
      const deck = decks[deckId]
      if (!deck) return
      const next = {
        ...decks,
        [deckId]: { ...deck, name: name.trim() || deck.name, updatedAt: new Date().toISOString() },
      }
      persistDecks(next)
    },
    [decks, persistDecks]
  )

  const setActiveDeck = useCallback((deckId: string | null) => {
    setActiveDeckIdState(deckId)
    saveActiveDeckId(deckId)
  }, [])

  const addCard = useCallback(
    (deckId: string, card: Card, section: DeckSection, qty: number = 1): AddCardResult => {
      const deck = decks[deckId]
      if (!deck) return 'maxCopies'

      // Extra deck cards → only extra/side. Non-extra deck cards → only main/side.
      if (isExtraDeckCard(card) && section === 'main') return 'maxCopies'
      if (!isExtraDeckCard(card) && section === 'extra') return 'maxCopies'

      const totalCopies = deck.entries
        .filter(e => e.cardId === card.id)
        .reduce((sum, e) => sum + e.quantity, 0)
      if (totalCopies >= MAX_COPIES_PER_DECK) return 'maxCopies'

      const sectionTotal = deck.entries
        .filter(e => e.section === section)
        .reduce((sum, e) => sum + e.quantity, 0)
      if (sectionTotal >= DECK_LIMITS[section].max) return 'sectionFull'

      const existing = deck.entries.find(e => e.cardId === card.id && e.section === section)
      // Clamp to both the 3-copy limit and the section size limit
      const available = Math.min(
        MAX_COPIES_PER_DECK - totalCopies,
        DECK_LIMITS[section].max - sectionTotal
      )
      const toAdd = Math.min(qty, available)
      if (toAdd <= 0) return 'sectionFull'

      let entries = deck.entries

      if (existing) {
        const newQty = Math.min(existing.quantity + toAdd, MAX_COPIES_PER_DECK)
        entries = entries.map(e =>
          e.cardId === card.id && e.section === section ? { ...e, quantity: newQty } : e
        )
      } else {
        entries = [...entries, { cardId: card.id, card, quantity: toAdd, section }]
      }

      const next = {
        ...decks,
        [deckId]: { ...deck, entries, updatedAt: new Date().toISOString() },
      }
      persistDecks(next)
      return 'ok'
    },
    [decks, persistDecks]
  )

  const removeCard = useCallback(
    (deckId: string, cardId: string, section: DeckSection) => {
      const deck = decks[deckId]
      if (!deck) return
      const next = {
        ...decks,
        [deckId]: {
          ...deck,
          entries: deck.entries.filter(e => !(e.cardId === cardId && e.section === section)),
          updatedAt: new Date().toISOString(),
        },
      }
      persistDecks(next)
    },
    [decks, persistDecks]
  )

  const updateQuantity = useCallback(
    (deckId: string, cardId: string, section: DeckSection, quantity: number) => {
      const deck = decks[deckId]
      if (!deck) return
      if (quantity <= 0) {
        removeCard(deckId, cardId, section)
        return
      }
      // Clamp to 3-copy limit (across ALL sections) and section size limit
      const copiesInOtherSections = deck.entries
        .filter(e => e.cardId === cardId && e.section !== section)
        .reduce((sum, e) => sum + e.quantity, 0)
      const sectionTotalWithoutEntry = deck.entries
        .filter(e => !(e.cardId === cardId && e.section === section))
        .filter(e => e.section === section)
        .reduce((sum, e) => sum + e.quantity, 0)
      const clamped = Math.min(
        quantity,
        MAX_COPIES_PER_DECK - copiesInOtherSections,
        DECK_LIMITS[section].max - sectionTotalWithoutEntry
      )
      const next = {
        ...decks,
        [deckId]: {
          ...deck,
          entries: deck.entries.map(e =>
            e.cardId === cardId && e.section === section ? { ...e, quantity: clamped } : e
          ),
          updatedAt: new Date().toISOString(),
        },
      }
      persistDecks(next)
    },
    [decks, persistDecks, removeCard]
  )

  return (
    <DecksContext.Provider
      value={{
        decks,
        activeDeckId,
        activeDeck,
        createDeck,
        cloneDeck,
        deleteDeck,
        renameDeck,
        setActiveDeck,
        addCard,
        removeCard,
        updateQuantity,
      }}
    >
      {children}
    </DecksContext.Provider>
  )
}

export function useDecks(): DecksContextValue {
  const ctx = useContext(DecksContext)
  if (!ctx) throw new Error('useDecks must be used inside <DecksProvider>')
  return ctx
}
