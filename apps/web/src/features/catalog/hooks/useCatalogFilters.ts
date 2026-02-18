import { useSearchParams } from 'react-router-dom'
import type { CatalogFilters } from '../types'

const FILTER_KEYS: (keyof CatalogFilters)[] = [
  'name',
  'attribute',
  'level',
  'atk',
  'def',
  'race',
  'archetype',
  'frameType',
  'hideTokens',
]

export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read all filter values from URL (single source of truth)
  const filters: CatalogFilters = {
    name: searchParams.get('name') ?? '',
    attribute: searchParams.get('attribute') ?? '',
    level: searchParams.get('level') ?? '',
    atk: searchParams.get('atk') ?? '',
    def: searchParams.get('def') ?? '',
    race: searchParams.get('race') ?? '',
    archetype: searchParams.get('archetype') ?? '',
    frameType: searchParams.get('frameType') ?? '',
    hideTokens: searchParams.get('hideTokens') ?? '',
  }

  const page = Number(searchParams.get('page') ?? '1')

  function setFilter(key: keyof CatalogFilters, value: string) {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        next.set('page', '1') // always reset to page 1 on filter change
        return next
      },
      { replace: true } // avoid polluting browser history on every keystroke
    )
  }

  function setPage(p: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  const activeFiltersCount = FILTER_KEYS.filter(k => filters[k] !== '').length

  const hasActiveFilters = activeFiltersCount > 0

  return {
    filters,
    page,
    setFilter,
    setPage,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
  }
}
