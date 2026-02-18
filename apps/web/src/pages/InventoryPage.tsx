import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInventory } from '../features/inventory/context'
import { InventoryGrid } from '../features/inventory/components/InventoryGrid'
import { EmptyState } from '../components/ui/EmptyState'
import styles from './InventoryPage.module.css'

export function InventoryPage() {
  const { t } = useTranslation()
  const { inventory } = useInventory()
  const [search, setSearch] = useState('')

  const allItems = useMemo(() => Object.values(inventory), [inventory])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems
    const q = search.trim().toLowerCase()
    return allItems.filter(item => item.card.name.toLowerCase().includes(q))
  }, [allItems, search])

  const uniqueCount = allItems.length
  const totalCount = allItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('inventory.title')}</h1>
        {uniqueCount > 0 && (
          <div className={styles.stats}>
            <span>{t('inventory.statsUnique', { count: uniqueCount })}</span>
            <span className={styles.statsDivider}>·</span>
            <span>{t('inventory.statsTotal', { count: totalCount })}</span>
          </div>
        )}
      </div>

      {/* Search */}
      {uniqueCount > 0 && (
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('inventory.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {uniqueCount === 0 ? (
        <EmptyState
          title={t('inventory.empty.title')}
          description={t('inventory.empty.desc')}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={t('ui.empty.title')}
          description={t('ui.empty.withSearch')}
        />
      ) : (
        <InventoryGrid items={filteredItems} />
      )}
    </div>
  )
}
