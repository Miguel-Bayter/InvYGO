import { ygoApiClient } from '@/lib/http'
import {
  type CardsQueryParams,
  type CardsResult,
  type RawArchetypesResponse,
  type RawCardsResponse,
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
