import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterBar } from '@/features/catalog/components/FilterBar'
import { CardGrid } from '@/features/catalog/components/CardGrid'
import { CardListView } from '@/features/catalog/components/CardListView'
import { Pagination } from '@/features/catalog/components/Pagination'
import { SearchBar } from '@/features/catalog/components/SearchBar'
import { ViewToggle, type ViewMode } from '@/features/catalog/components/ViewToggle'
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters'
import { useCards } from '@/features/catalog/hooks/useCards'
import { useArchetypes } from '@/features/catalog/hooks/useArchetypes'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './CatalogPage.module.css'

const PAGE_SIZE = 20

export function CatalogPage() {
  const { t } = useTranslation()
  const [view, setView] = useState<ViewMode>('gallery')

  const { filters, page, setFilter, setPage, clearFilters, activeFiltersCount } = useCatalogFilters()

  const { data, isLoading, isFetching, isError, error, refetch, isDebouncing } = useCards({
    filters,
    page,
    limit: PAGE_SIZE,
  })

  const { data: archetypes = [], isLoading: archetypesLoading } = useArchetypes()

  // Scroll to top after React commits the new page render
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  function handlePageChange(newPage: number) {
    setPage(newPage)
  }

  function getErrorType(err: unknown): 'network' | 'rateLimit' | 'unavailable' | 'generic' {
    if (err instanceof Error && err.message === 'YGO_API_RATE_LIMITED') return 'rateLimit'
    const status =
      err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { status?: number } }).response?.status ?? 0)
        : 0
    if (status === 0) return 'network'
    if (status === 429) return 'rateLimit'
    if (status === 503) return 'unavailable'
    return 'generic'
  }

  const errType = getErrorType(error)
  const isBusy = isFetching || isDebouncing
  const visibleCards = data?.cards ?? []
  // True when any non-name filter is active (determines empty-state message tone)
  const hasNonNameFilter = Object.entries(filters).some(([k, v]) => k !== 'name' && v !== '')

  return (
    <div className={styles.page}>
      {/* ── Top bar: title + search + view toggle ── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t('catalog.title')}</h1>
          <p className={styles.subtitle}>
            {data
              ? t('catalog.subtitleCount', { count: data.pagination.totalItems })
              : t('catalog.subtitleExploring')}
          </p>
        </div>
        <div className={styles.controls}>
          <SearchBar
            value={filters.name}
            onChange={v => setFilter('name', v)}
            isSearching={isBusy}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────── */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        activeFiltersCount={activeFiltersCount}
        archetypes={archetypes}
        archetypesLoading={archetypesLoading}
      />

      {/* ── Content ────────────────────────────── */}
      <div className={styles.content}>
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <ErrorMessage
            title={
              errType === 'network'     ? t('ui.error.connectionTitle') :
              errType === 'rateLimit'   ? t('ui.error.rateLimitTitle') :
              errType === 'unavailable' ? t('ui.error.serviceUnavailableTitle') :
                                         t('ui.error.loadCardsTitle')
            }
            message={
              errType === 'network'     ? t('ui.error.connectionMessage') :
              errType === 'rateLimit'   ? t('ui.error.rateLimitMessage') :
              errType === 'unavailable' ? t('ui.error.serviceUnavailableMessage') :
                                         t('ui.error.loadCardsMessage')
            }
            onRetry={() => void refetch()}
          />
        ) : data && visibleCards.length === 0 ? (
          <EmptyState
            title={t('ui.empty.title')}
            description={hasNonNameFilter ? t('ui.empty.withFilters') : t('ui.empty.withSearch')}
          />
        ) : data ? (
          <>
            {view === 'gallery' ? (
              <CardGrid cards={visibleCards} isFetching={isFetching} />
            ) : (
              <CardListView cards={visibleCards} isFetching={isFetching} />
            )}
            {data.pagination.totalPages > 1 && (
              <Pagination
                pagination={data.pagination}
                onPageChange={handlePageChange}
                disabled={isFetching}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
