import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { fetchCards } from '../api'
import type { Card, CardsResult, CatalogFilters } from '../types'

interface UseCardsParams {
  filters: CatalogFilters
  page: number
  limit?: number
}

const TEXT_DEBOUNCE_MS = 400
const NUMBER_DEBOUNCE_MS = 600
const CLIENT_FILTER_FETCH_LIMIT = 100
const PAGE_SCAN_DELAY_MS = 90
const MAX_RETRIES = 5
const RETRY_BASE_MS = 400
const RATE_LIMIT_COOLDOWN_MS = 7000

const MAX_SCAN_PAGES_BY_TYPE: Record<string, number> = {
  token: 5,
  link: 40,
  ritual: 40,
  xyz: 30,
  synchro: 30,
  fusion: 30,
  normal: 15,
  effect: 10,
  spell: 10,
  trap: 15,
}

// Which frameType values belong to the same display family (includes pendulum variants)
const FRAME_FAMILY: Record<string, string[]> = {
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

interface ClientFilterAccumulator {
  matched: Card[]
  nextApiPage: number
  totalApiPages: number
  exhausted: boolean
}

const clientFilterCache = new Map<string, ClientFilterAccumulator>()
let globalRateLimitUntil = 0

function parseStatFilter(value: string): number | undefined {
  const normalized = value.trim()
  if (!normalized) return undefined
  if (normalized === '?') return -1
  if (!/^-?\d+$/.test(normalized)) return undefined

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

interface ServerFilterParams {
  fuzzyName?: string
  attribute?: string
  level?: number
  atk?: number
  def?: number
  race?: string
  archetype?: string
}

interface ClientFilterCriteria {
  name?: string
  attribute?: string
  level?: number
  atk?: number
  def?: number
  race?: string
  archetype?: string
  frameType: string
  hideTokens: boolean
}

function toCacheKey(params: ServerFilterParams, criteria: ClientFilterCriteria): string {
  return JSON.stringify({
    fuzzyName: params.fuzzyName ?? '',
    attribute: criteria.attribute ?? '',
    level: criteria.level ?? '',
    atk: criteria.atk ?? '',
    def: criteria.def ?? '',
    race: criteria.race ?? '',
    archetype: criteria.archetype ?? '',
    frameType: criteria.frameType,
    hideTokens: criteria.hideTokens,
  })
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    if (!signal) return

    const onAbort = () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    if (signal.aborted) onAbort()
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

async function fetchCardsWithRetry(
  params: ServerFilterParams & { page: number; limit: number },
  signal?: AbortSignal
): Promise<CardsResult> {
  let attempt = 0

  while (true) {
    try {
      const now = Date.now()
      if (globalRateLimitUntil > now) {
        await wait(globalRateLimitUntil - now, signal)
      }

      return await fetchCards(params, signal)
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { status?: number } }).response?.status ?? 0)
          : 0

      const retryable = status === 429 || status === 503
      if (retryable) {
        globalRateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS
      }
      if (!retryable || attempt >= MAX_RETRIES) throw error

      const delay = RETRY_BASE_MS * 2 ** attempt
      attempt += 1
      await wait(delay, signal)
    }
  }
}

function matchesClientOnlyFilters(card: Card, frameType: string, hideTokens: boolean): boolean {
  if (frameType) {
    const family = FRAME_FAMILY[frameType] ?? [frameType]
    if (!family.includes(card.frameType)) return false
  }
  if (hideTokens && card.frameType === 'token') return false
  return true
}

function includesIgnoreCase(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase())
}

function matchesAllFilters(card: Card, criteria: ClientFilterCriteria): boolean {
  if (!matchesClientOnlyFilters(card, criteria.frameType, criteria.hideTokens)) return false

  if (criteria.name && !includesIgnoreCase(card.name, criteria.name)) return false
  if (criteria.attribute && card.attribute !== criteria.attribute) return false
  if (criteria.level !== undefined && card.level !== criteria.level) return false
  if (criteria.atk !== undefined && card.attack !== criteria.atk) return false
  if (criteria.def !== undefined && card.defense !== criteria.def) return false
  if (criteria.race && card.race !== criteria.race) return false
  if (criteria.archetype && card.archetype !== criteria.archetype) return false

  return true
}

async function fetchCardsWithClientFrameFilters(
  params: ServerFilterParams,
  criteria: ClientFilterCriteria,
  page: number,
  limit: number,
  frameType: string,
  hideTokens: boolean,
  signal?: AbortSignal
): Promise<CardsResult> {
  const start = (page - 1) * limit
  const end = start + limit
  const needed = end

  const cacheKey = toCacheKey(params, criteria)
  const cached = clientFilterCache.get(cacheKey)
  const acc: ClientFilterAccumulator =
    cached ?? { matched: [], nextApiPage: 1, totalApiPages: 1, exhausted: false }
  const seenIds = new Set(acc.matched.map(card => card.id))

  let stoppedByRateLimit = false
  const maxPagesToScan = MAX_SCAN_PAGES_BY_TYPE[frameType] ?? 8
  const startPage = acc.nextApiPage

  while (!acc.exhausted && acc.matched.length < needed) {
    if (acc.nextApiPage - startPage >= maxPagesToScan) {
      break
    }

    try {
      const batch = await fetchCardsWithRetry(
        {
          ...params,
          page: acc.nextApiPage,
          limit: CLIENT_FILTER_FETCH_LIMIT,
        },
        signal
      )

      acc.totalApiPages = batch.pagination.totalPages

      for (const card of batch.cards) {
        if (!matchesAllFilters(card, criteria)) continue
        if (seenIds.has(card.id)) continue
        seenIds.add(card.id)
        acc.matched.push(card)
      }

      acc.nextApiPage += 1
      if (acc.nextApiPage > acc.totalApiPages) acc.exhausted = true

      if (!acc.exhausted && acc.matched.length < needed) {
        await wait(PAGE_SCAN_DELAY_MS, signal)
      }
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { status?: number } }).response?.status ?? 0)
          : 0

      // If upstream throttles or is temporarily unavailable, avoid failing hard.
      // Return what we already accumulated (even if zero) so UI stays usable.
      if (status === 429 || status === 503) {
        stoppedByRateLimit = true
        break
      }
      throw error
    }
  }

  // Token is the sparsest type. If the regular scan did not find enough results,
  // try a small focused fallback query by name once.
  if (
    frameType === 'token' &&
    !criteria.name &&
    !hideTokens &&
    acc.matched.length < needed
  ) {
    try {
      const tokenBatch = await fetchCardsWithRetry(
        {
          ...params,
          race: undefined,
          fuzzyName: 'token',
          page: 1,
          limit: CLIENT_FILTER_FETCH_LIMIT,
        },
        signal
      )

      for (const card of tokenBatch.cards) {
        if (!matchesAllFilters(card, criteria)) continue
        if (seenIds.has(card.id)) continue
        seenIds.add(card.id)
        acc.matched.push(card)
      }
    } catch {
      // Ignore fallback errors; keep graceful behavior with partial results.
    }
  }

  clientFilterCache.set(cacheKey, acc)

  if (stoppedByRateLimit && acc.matched.length === 0) {
    throw new Error('YGO_API_RATE_LIMITED')
  }

  const hasMore = !acc.exhausted
  const cards = acc.matched.slice(start, end)

  const estimatedTotalItems = stoppedByRateLimit
    ? acc.matched.length
    : hasMore
      ? Math.max(acc.matched.length, end + 1)
      : acc.matched.length
  const totalPages = Math.max(1, Math.ceil(estimatedTotalItems / limit))

  return {
    cards,
    pagination: {
      totalItems: estimatedTotalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
    },
  }
}

export function useCards({ filters, page, limit = 20 }: UseCardsParams) {
  // Debounce text inputs (name) — fire less on fast typing
  const debouncedName = useDebounce(filters.name.trim(), TEXT_DEBOUNCE_MS)

  // Debounce numeric inputs (atk, def) — user may adjust spinners fast
  const debouncedAtk = useDebounce(filters.atk, NUMBER_DEBOUNCE_MS)
  const debouncedDef = useDebounce(filters.def, NUMBER_DEBOUNCE_MS)
  const parsedAtk = parseStatFilter(debouncedAtk)
  const parsedDef = parseStatFilter(debouncedDef)

  // Selects/toggles have no debounce — single discrete action
  const { attribute, race, level, archetype, frameType, hideTokens } = filters
  const hideTokensEnabled = hideTokens === 'true'

  // Keep type filters robust: avoid forcing token-specific query upfront.
  // If needed, token gets a focused fallback inside fetchCardsWithClientFrameFilters.
  const effectiveRace = race || undefined
  const effectiveFuzzyName = debouncedName || undefined

  // True while any debounced value is still catching up to the live input
  const isDebouncing =
    filters.name.trim() !== debouncedName ||
    filters.atk !== debouncedAtk ||
    filters.def !== debouncedDef

  const query = useQuery({
    queryKey: [
      'cards',
      {
        name: effectiveFuzzyName,
        attribute,
        level: level ? Number(level) : undefined,
        atk: parsedAtk,
        def: parsedDef,
        race: effectiveRace,
        archetype,
        frameType, // included so 'token' selection triggers a fresh fetch
        hideTokens: hideTokensEnabled,
        page,
        limit,
      },
    ],
    queryFn: ({ signal }) =>
      frameType || hideTokensEnabled
        ? fetchCardsWithClientFrameFilters(
            {
              // Pass all supported server-side filters to reduce scan volume;
              // frameType is applied client-side (wrapper API ignores it).
              fuzzyName: effectiveFuzzyName,
              attribute: attribute || undefined,
              level: level ? Number(level) : undefined,
              atk: parsedAtk,
              def: parsedDef,
              race: effectiveRace,
              archetype: archetype || undefined,
            },
            {
              name: effectiveFuzzyName,
              attribute: attribute || undefined,
              level: level ? Number(level) : undefined,
              atk: parsedAtk,
              def: parsedDef,
              race: effectiveRace,
              archetype: archetype || undefined,
              frameType,
              hideTokens: hideTokensEnabled,
            },
            page,
            limit,
            frameType,
            hideTokensEnabled,
            signal
          )
        : fetchCardsWithRetry(
            {
              fuzzyName: effectiveFuzzyName,
              attribute: attribute || undefined,
              level: level ? Number(level) : undefined,
              atk: parsedAtk,
              def: parsedDef,
              race: effectiveRace,
              archetype: archetype || undefined,
              page,
              limit,
            },
            signal
          ),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  return { ...query, isDebouncing }
}
