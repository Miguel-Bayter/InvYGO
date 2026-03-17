import { ygoApiClient } from '@/lib/http'
import {
  type CardsQueryParams,
  type CardsResult,
  type Card,
  type RawArchetypesResponse,
  type RawCardsResponse,
  type RawSingleCardResponse,
  normalizeCardsResponse,
} from './types'

export async function fetchCards(
  params: CardsQueryParams,
  signal?: AbortSignal
): Promise<CardsResult> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: Math.min(params.limit ?? 20, 100),
  }

  if (params.id) query.id = params.id
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
    signal,
  })
  return normalizeCardsResponse(response.data)
}

export async function fetchArchetypes(): Promise<string[]> {
  const response = await ygoApiClient.get<RawArchetypesResponse>('/archetypes')
  return response.data.data.map(item => item.id).sort()
}

/**
 * Resolve a YGO card passcode to a full Card object.
 *
 * YDK files store card passcodes (the numeric id printed on physical cards).
 * The API's JSON:API `id` field is that same passcode, so we can look up a
 * card by it using two strategies:
 *
 *   1. GET /cards/:passcode  — standard JSON:API single-resource endpoint.
 *      Returns a single `data` object (not an array). Preferred because it is
 *      O(1) and unambiguous.
 *
 *   2. GET /cards?id=:passcode  — collection endpoint filtered by id.
 *      Falls back to this if the single-resource route is not supported (404).
 *      We validate that the returned card's id matches to avoid accepting
 *      an unfiltered first-page result.
 *
 * Returns null if neither strategy resolves the passcode.
 */
function isTransientError(error: unknown): boolean {
  const status =
    error && typeof error === 'object' && 'response' in error
      ? ((error as { response?: { status?: number } }).response?.status ?? 0)
      : 0
  return status === 429 || status === 503 || status === 0
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fetchCardByPasscode(passcode: string): Promise<Card | null> {
  // Strategy 1 – individual resource endpoint (with 1 retry on transient errors)
  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const res = await ygoApiClient.get<RawSingleCardResponse>(`/cards/${passcode}`)
      const item = res.data.data
      if (item?.id === passcode) {
        const [card] = normalizeCardsResponse({
          data: [item],
          meta: { totalItems: 1, totalPages: 1, currentPage: 1, itemsPerPage: 1 },
          links: { self: '', first: null, prev: null, next: null, last: null },
        }).cards
        return card ?? null
      }
      break // response ok but id mismatch — fall through to strategy 2
    } catch (error) {
      if (attempt === 0 && isTransientError(error)) {
        await delay(300)
        continue
      }
      break // fall through to strategy 2
    }
  }

  // Strategy 2 – collection filtered by id (with 1 retry on transient errors)
  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const res = await fetchCards({ id: passcode, limit: 1, page: 1 })
      const card = res.cards[0]
      return card && card.id === passcode ? card : null
    } catch (error) {
      if (attempt === 0 && isTransientError(error)) {
        await delay(300)
        continue
      }
      return null
    }
  }

  return null
}
