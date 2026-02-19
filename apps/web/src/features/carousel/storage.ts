import { getDefaultCarouselState } from './defaults'
import type { CarouselState } from './types'

const STORAGE_KEY = 'invygo_carousel_v1'

export function loadCarouselState(): CarouselState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultCarouselState()

    const parsed = JSON.parse(raw) as Partial<CarouselState>
    const defaults = getDefaultCarouselState()

    return {
      cards: defaults.cards,
      innerStyle: parsed.innerStyle === 'anime' ? 'anime' : 'classic',
      outerFace: 'art',
    }
  } catch {
    return getDefaultCarouselState()
  }
}

export function saveCarouselState(state: CarouselState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Silently ignore storage errors (e.g. private mode quota)
  }
}
