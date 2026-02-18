import { ygoApiClient } from '@/lib/http'
import {
  type Card,
  type CardsQueryParams,
  type CardsResult,
  type RawArchetypesResponse,
  type RawCardsResponse,
  normalizeCardsResponse,
} from './types'

const YGO_PRODECK_BASE_URL = 'https://db.ygoprodeck.com/api/v7'

const FRAME_TYPE_TO_API_TYPES: Record<string, string[]> = {
  normal: ['Normal Monster', 'Normal Tuner Monster', 'Pendulum Normal Monster'],
  effect: [
    'Effect Monster',
    'Flip Effect Monster',
    'Gemini Monster',
    'Spirit Monster',
    'Toon Monster',
    'Union Effect Monster',
    'Tuner Monster',
    'Pendulum Effect Monster',
  ],
  ritual: ['Ritual Monster', 'Ritual Effect Monster', 'Pendulum Effect Ritual Monster'],
  fusion: ['Fusion Monster', 'Pendulum Effect Fusion Monster'],
  synchro: ['Synchro Monster', 'Synchro Tuner Monster', 'Synchro Pendulum Effect Monster'],
  xyz: ['XYZ Monster', 'XYZ Pendulum Effect Monster'],
  link: ['Link Monster'],
  spell: ['Spell Card'],
  trap: ['Trap Card'],
  token: ['Token'],
}

type YgoProdeckCard = {
  id: number
  name: string
  type: string
  frameType: string
  desc: string
  race: string
  archetype?: string
  atk?: number | null
  def?: number | null
  level?: number | null
  attribute?: string
  card_images: Array<{
    id: number
    image_url: string
    image_url_small: string
    image_url_cropped: string
  }>
  card_prices: Array<{
    cardmarket_price: string
    tcgplayer_price: string
    ebay_price: string
    amazon_price: string
    coolstuffinc_price: string
  }>
}

type YgoProdeckResponse = {
  data: YgoProdeckCard[]
  meta?: {
    total_rows?: number
    total_pages?: number
  }
}

function isSameFrameFamily(cardFrame: string, selectedFrame: string): boolean {
  if (!selectedFrame) return true
  if (cardFrame === selectedFrame) return true

  const family: Record<string, string[]> = {
    normal: ['normal', 'normal_pendulum'],
    effect: ['effect', 'effect_pendulum'],
    ritual: ['ritual', 'ritual_pendulum'],
    fusion: ['fusion', 'fusion_pendulum'],
    synchro: ['synchro', 'synchro_pendulum'],
    xyz: ['xyz', 'xyz_pendulum'],
    link: ['link'],
    spell: ['spell'],
    trap: ['trap'],
    token: ['token'],
  }

  return family[selectedFrame]?.includes(cardFrame) ?? false
}

function parseNumber(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function mapYgoProdeckCard(raw: YgoProdeckCard): Card {
  return {
    id: String(raw.id),
    name: raw.name,
    type: raw.type,
    frameType: raw.frameType,
    description: raw.desc,
    race: raw.race,
    archetype: raw.archetype,
    attack: raw.atk ?? undefined,
    defense: raw.def ?? undefined,
    level: raw.level ?? undefined,
    attribute: raw.attribute,
    images: raw.card_images.map(img => ({
      id: img.id,
      imageUrl: img.image_url,
      imageUrlSmall: img.image_url_small,
      imageUrlCropped: img.image_url_cropped,
    })),
    prices: raw.card_prices.map(price => ({
      cardmarketPrice: parseNumber(price.cardmarket_price),
      tcgplayerPrice: parseNumber(price.tcgplayer_price),
      ebayPrice: parseNumber(price.ebay_price),
      amazonPrice: parseNumber(price.amazon_price),
      coolstuffincPrice: parseNumber(price.coolstuffinc_price),
    })),
  }
}

async function fetchYgoProdeckByType(
  type: string,
  params: CardsQueryParams,
  needed: number,
  signal?: AbortSignal
): Promise<{ cards: Card[]; totalItems: number }> {
  const search = new URLSearchParams()
  search.set('type', type)
  search.set('num', String(needed))
  search.set('offset', '0')

  if (params.fuzzyName) search.set('fname', params.fuzzyName)
  if (params.attribute) search.set('attribute', params.attribute)
  if (params.level !== undefined) search.set('level', String(params.level))
  if (params.atk !== undefined) search.set('atk', String(params.atk))
  if (params.def !== undefined) search.set('def', String(params.def))
  if (params.race) search.set('race', params.race)
  if (params.archetype) search.set('archetype', params.archetype)

  const response = await fetch(`${YGO_PRODECK_BASE_URL}/cardinfo.php?${search.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    // Some type labels may not exist for all frame families.
    // Treat non-2xx as an empty subset instead of failing the entire type query.
    return { cards: [], totalItems: 0 }
  }

  const payload = (await response.json()) as YgoProdeckResponse
  const cards = (payload.data ?? []).map(mapYgoProdeckCard)
  const totalItems = payload.meta?.total_rows ?? cards.length

  return { cards, totalItems }
}

export async function fetchCardsByFrameType(
  frameType: string,
  params: CardsQueryParams,
  signal?: AbortSignal
): Promise<CardsResult> {
  const page = params.page ?? 1
  const limit = Math.min(params.limit ?? 20, 100)
  const needed = page * limit
  const types = FRAME_TYPE_TO_API_TYPES[frameType] ?? []

  if (types.length === 0) {
    return fetchCards(params, signal)
  }

  const batches = await Promise.all(types.map(type => fetchYgoProdeckByType(type, params, needed, signal)))

  const unique = new Map<string, Card>()

  for (const batch of batches) {
    for (const card of batch.cards) {
      if (!isSameFrameFamily(card.frameType, frameType)) continue
      unique.set(card.id, card)
    }
  }

  const merged = Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
  const hasMore = batches.some(batch => batch.totalItems > needed)
  const totalItems = hasMore ? Math.max(merged.length, needed + 1) : merged.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * limit
  const cards = merged.slice(start, start + limit)

  return {
    cards,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage: limit,
    },
  }
}

export async function fetchCards(
  params: CardsQueryParams,
  signal?: AbortSignal
): Promise<CardsResult> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: Math.min(params.limit ?? 20, 100),
  }

  if (params.name) query.name = params.name
  if (params.fuzzyName) query.fuzzyName = params.fuzzyName
  if (params.attribute) query.attribute = params.attribute
  if (params.level !== undefined) query.level = params.level
  if (params.atk !== undefined) query.atk = params.atk
  if (params.def !== undefined) query.def = params.def
  if (params.race) query.race = params.race
  if (params.archetype) query.archetype = params.archetype

  const response = await ygoApiClient.get<RawCardsResponse>('/cards', {
    params: query,
    signal, // TanStack Query cancels via AbortController when queryKey changes
  })
  return normalizeCardsResponse(response.data)
}

export async function fetchArchetypes(): Promise<string[]> {
  const response = await ygoApiClient.get<RawArchetypesResponse>('/archetypes')
  return response.data.data.map(item => item.id).sort()
}
