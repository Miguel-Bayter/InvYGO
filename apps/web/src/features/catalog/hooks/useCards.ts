import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { fetchCards } from '../api'
import type { CatalogFilters } from '../types'

interface UseCardsParams {
  filters: CatalogFilters
  page: number
  limit?: number
}

const TEXT_DEBOUNCE_MS = 400
const NUMBER_DEBOUNCE_MS = 600

export function useCards({ filters, page, limit = 20 }: UseCardsParams) {
  // Debounce text inputs (name) — fire less on fast typing
  const debouncedName = useDebounce(filters.name.trim(), TEXT_DEBOUNCE_MS)

  // Debounce numeric inputs (atk, def) — user may adjust spinners fast
  const debouncedAtk = useDebounce(filters.atk, NUMBER_DEBOUNCE_MS)
  const debouncedDef = useDebounce(filters.def, NUMBER_DEBOUNCE_MS)

  // Selects (attribute, race, level, archetype) have no debounce — single discrete action
  const { attribute, race, level, archetype } = filters

  // True while any debounced value is still catching up to the live input
  const isDebouncing =
    filters.name.trim() !== debouncedName ||
    filters.atk !== debouncedAtk ||
    filters.def !== debouncedDef

  const query = useQuery({
    queryKey: [
      'cards',
      {
        name: debouncedName,
        attribute,
        level: level ? Number(level) : undefined,
        atk: debouncedAtk ? Number(debouncedAtk) : undefined,
        def: debouncedDef ? Number(debouncedDef) : undefined,
        race,
        archetype,
        page,
        limit,
      },
    ],
    queryFn: ({ signal }) =>
      fetchCards(
        {
          fuzzyName: debouncedName || undefined,
          attribute: attribute || undefined,
          level: level ? Number(level) : undefined,
          atk: debouncedAtk ? Number(debouncedAtk) : undefined,
          def: debouncedDef ? Number(debouncedDef) : undefined,
          race: race || undefined,
          archetype: archetype || undefined,
          page,
          limit,
        },
        signal // TanStack Query aborts stale requests automatically
      ),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  })

  return { ...query, isDebouncing }
}
