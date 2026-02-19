import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CAROUSEL_MAX_ITEMS, CAROUSEL_MIN_ITEMS, getDefaultCarouselState } from './defaults'
import { loadCarouselState, saveCarouselState } from './storage'
import type {
  AddCardPayload,
  CarouselCard,
  CarouselInnerStyle,
  CarouselOuterFace,
  CarouselState,
} from './types'

interface CarouselContextValue {
  state: CarouselState
  addCard: (payload: AddCardPayload) => void
  removeCard: (id: string) => void
  moveCard: (id: string, direction: 'up' | 'down') => void
  resetDefaults: () => void
  setInnerStyle: (style: CarouselInnerStyle) => void
  setOuterFace: (face: CarouselOuterFace) => void
  hasCard: (cardId: string) => boolean
}

const CarouselContext = createContext<CarouselContextValue | null>(null)

function persist(next: CarouselState): CarouselState {
  saveCarouselState(next)
  return next
}

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CarouselState>(() => loadCarouselState())

  const addCard = useCallback((payload: AddCardPayload) => {
    const { card } = payload
    const imageUrl = card.images[0]?.imageUrl
    if (!imageUrl) return

    setState(prev => {
      if (prev.cards.some(item => item.cardId === card.id)) return prev
      if (prev.cards.length >= CAROUSEL_MAX_ITEMS) return prev

      const nextCard: CarouselCard = {
        id: `custom-${card.id}-${Date.now()}`,
        cardId: card.id,
        name: card.name,
        imageUrl,
        addedAt: new Date().toISOString(),
      }

      return persist({ ...prev, cards: [nextCard, ...prev.cards] })
    })
  }, [])

  const removeCard = useCallback((id: string) => {
    setState(prev => {
      if (prev.cards.length <= CAROUSEL_MIN_ITEMS) return prev

      const cards = prev.cards.filter(card => card.id !== id)
      const next =
        cards.length > 0 ? { ...prev, cards } : { ...prev, cards: getDefaultCarouselState().cards }
      return persist(next)
    })
  }, [])

  const moveCard = useCallback((id: string, direction: 'up' | 'down') => {
    setState(prev => {
      const index = prev.cards.findIndex(card => card.id === id)
      if (index === -1) return prev

      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.cards.length) return prev

      const cards = [...prev.cards]
      const [moved] = cards.splice(index, 1)
      cards.splice(target, 0, moved)

      return persist({ ...prev, cards })
    })
  }, [])

  const resetDefaults = useCallback(() => {
    setState(() => persist(getDefaultCarouselState()))
  }, [])

  const setInnerStyle = useCallback((style: CarouselInnerStyle) => {
    setState(prev => persist({ ...prev, innerStyle: style }))
  }, [])

  const setOuterFace = useCallback((face: CarouselOuterFace) => {
    setState(prev => persist({ ...prev, outerFace: face }))
  }, [])

  const hasCard = useCallback(
    (cardId: string) => state.cards.some(item => item.cardId === cardId),
    [state.cards]
  )

  const value = useMemo(
    () => ({ state, addCard, removeCard, moveCard, resetDefaults, setInnerStyle, setOuterFace, hasCard }),
    [
      state,
      addCard,
      removeCard,
      moveCard,
      resetDefaults,
      setInnerStyle,
      setOuterFace,
      hasCard,
    ]
  )

  return <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>
}

export function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext)
  if (!ctx) throw new Error('useCarousel must be used inside <CarouselProvider>')
  return ctx
}
