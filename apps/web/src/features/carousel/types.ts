import type { Card } from '../catalog/types'

export type CarouselInnerStyle = 'classic' | 'anime'
export type CarouselOuterFace = 'reverse' | 'art'

export interface CarouselCard {
  id: string
  cardId: string
  name: string
  imageUrl: string
  addedAt: string
}

export interface CarouselState {
  cards: CarouselCard[]
  innerStyle: CarouselInnerStyle
  outerFace: CarouselOuterFace
}

export interface AddCardPayload {
  card: Card
}
