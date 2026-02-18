// ─── Raw JSON:API shapes from the YGO wrapper ────────────────────────────────

export interface RawArchetypesResponse {
  data: Array<{ type: 'archetypes'; id: string; attributes: Record<string, never> }>
}

interface RawCardImage {
  id: number
  imageUrl: string
  imageUrlSmall: string
  imageUrlCropped: string
}

interface RawCardPrice {
  cardmarketPrice: string
  tcgplayerPrice: string
  ebayPrice: string
  amazonPrice: string
  coolstuffincPrice: string
}

interface RawCardAttributes {
  name: string
  type: string
  frameType: string
  description: string
  race: string
  archetype?: string
  attack?: number
  defense?: number
  level?: number
  attribute?: string
  images: RawCardImage[]
  prices: RawCardPrice[]
}

interface RawCardItem {
  type: 'cards'
  id: string
  attributes: RawCardAttributes
}

export interface RawCardsResponse {
  data: RawCardItem[]
  meta: {
    totalItems: number
    totalPages: number
    currentPage: number
    itemsPerPage: number
  }
  links: {
    self: string
    first: string | null
    prev: string | null
    next: string | null
    last: string | null
  }
}

// ─── Normalized domain types used by the UI ───────────────────────────────────

export interface CardImage {
  id: number
  imageUrl: string
  imageUrlSmall: string
  imageUrlCropped: string
}

export interface CardPrice {
  cardmarketPrice: number
  tcgplayerPrice: number
  ebayPrice: number
  amazonPrice: number
  coolstuffincPrice: number
}

export interface Card {
  id: string
  name: string
  type: string
  frameType: string
  description: string
  race: string
  archetype?: string
  attack?: number
  defense?: number
  level?: number
  attribute?: string
  images: CardImage[]
  prices: CardPrice[]
}

export interface CardsPagination {
  totalItems: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

export interface CardsResult {
  cards: Card[]
  pagination: CardsPagination
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface CardsQueryParams {
  name?: string
  fuzzyName?: string
  attribute?: string
  level?: number
  atk?: number
  def?: number
  race?: string
  archetype?: string
  page?: number
  limit?: number
}

// ─── UI filter state (all strings for controlled inputs) ──────────────────────

export interface CatalogFilters {
  name: string
  attribute: string
  level: string
  atk: string
  def: string
  race: string
  archetype: string
  frameType: string // client-side only — not sent to API
  hideTokens: string // client-side only — 'true' | ''
}

// ─── Normalizer ───────────────────────────────────────────────────────────────

function parsePrice(value: string): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

export function normalizeCardsResponse(raw: RawCardsResponse): CardsResult {
  const cards: Card[] = raw.data.map(item => ({
    id: item.id,
    name: item.attributes.name,
    type: item.attributes.type,
    frameType: item.attributes.frameType,
    description: item.attributes.description,
    race: item.attributes.race,
    archetype: item.attributes.archetype,
    attack: item.attributes.attack,
    defense: item.attributes.defense,
    level: item.attributes.level,
    attribute: item.attributes.attribute,
    images: item.attributes.images,
    prices: item.attributes.prices.map(p => ({
      cardmarketPrice: parsePrice(p.cardmarketPrice),
      tcgplayerPrice: parsePrice(p.tcgplayerPrice),
      ebayPrice: parsePrice(p.ebayPrice),
      amazonPrice: parsePrice(p.amazonPrice),
      coolstuffincPrice: parsePrice(p.coolstuffincPrice),
    })),
  }))

  return {
    cards,
    pagination: raw.meta,
  }
}
