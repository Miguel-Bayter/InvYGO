import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInventory } from '../features/inventory/context'
import { InventoryGrid } from '../features/inventory/components/InventoryGrid'
import { EmptyState } from '../components/ui/EmptyState'
import styles from './InventoryPage.module.css'

type SortKey = 'name-asc' | 'name-desc' | 'qty-desc' | 'qty-asc' | 'recent'

export function InventoryPage() {
  const { t } = useTranslation()
  const { inventory } = useInventory()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')

  const allItems = useMemo(() => Object.values(inventory), [inventory])

  const filteredItems = useMemo(() => {
    let items = allItems
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter(item => item.card.name.toLowerCase().includes(q))
    }
    return [...items].sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.card.name.localeCompare(b.card.name, undefined, {
            sensitivity: 'base',
            numeric: true,
          })
        case 'name-desc':
          return b.card.name.localeCompare(a.card.name, undefined, {
            sensitivity: 'base',
            numeric: true,
          })
        case 'qty-desc':
          return (
            b.quantity - a.quantity ||
            a.card.name.localeCompare(b.card.name, undefined, {
              sensitivity: 'base',
              numeric: true,
            })
          )
        case 'qty-asc':
          return (
            a.quantity - b.quantity ||
            a.card.name.localeCompare(b.card.name, undefined, {
              sensitivity: 'base',
              numeric: true,
            })
          )
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
  }, [allItems, search, sort])

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

      {/* Search + Sort */}
      {uniqueCount > 0 && (
        <div className={styles.toolRow}>
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
                aria-label={t('ui.close')}
              >
                ✕
              </button>
            )}
          </div>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            aria-label={t('inventory.sort.label')}
          >
            <option value="recent">{t('inventory.sort.recent')}</option>
            <option value="name-asc">{t('inventory.sort.nameAsc')}</option>
            <option value="name-desc">{t('inventory.sort.nameDesc')}</option>
            <option value="qty-desc">{t('inventory.sort.qtyDesc')}</option>
            <option value="qty-asc">{t('inventory.sort.qtyAsc')}</option>
          </select>
        </div>
      )}

      {/* Content */}
      {uniqueCount === 0 ? (
        <EmptyState title={t('inventory.empty.title')} description={t('inventory.empty.desc')} />
      ) : filteredItems.length === 0 ? (
        <EmptyState title={t('ui.empty.title')} description={t('ui.empty.withSearch')} />
      ) : (
        <InventoryGrid items={filteredItems} />
      )}
    </div>
  )
}
