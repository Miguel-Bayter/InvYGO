import type { CarouselCard, CarouselState } from './types'

export const CAROUSEL_MIN_ITEMS = 6
export const CAROUSEL_MAX_ITEMS = 10
export const CAROUSEL_DEFAULT_ITEMS = 10

const DEFAULT_POOL = [
  '14558127',
  '46986414',
  '89631139',
  '74677422',
  '6150044',
  '44508094',
  '23995346',
  '9753964',
  '40908371',
  '6983839',
  '70781052',
  '12580477',
  '38033121',
  '84013237',
  '53129443',
  '27204311',
  '33396948',
  '18144507',
  '83764718',
  '27243130',
]

function toImageUrl(cardId: string): string {
  return `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

export function getDefaultCarouselCards(): CarouselCard[] {
  const now = new Date().toISOString()
  const selected = shuffle(DEFAULT_POOL).slice(0, CAROUSEL_DEFAULT_ITEMS)

  return selected.map((cardId, index) => ({
    id: `default-${cardId}-${index}`,
    cardId,
    name: `Showcase ${index + 1}`,
    imageUrl: toImageUrl(cardId),
    addedAt: now,
  }))
}

export function getDefaultCarouselState(): CarouselState {
  return {
    cards: getDefaultCarouselCards(),
    innerStyle: 'classic',
    outerFace: 'art',
  }
}
