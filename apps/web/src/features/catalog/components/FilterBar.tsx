import { useTranslation } from 'react-i18next'
import { ATTRIBUTES, ALL_RACES, LEVELS, FRAME_TYPES, RARE_FRAME_TYPES } from '../constants'
import type { CatalogFilters } from '../types'
import styles from './FilterBar.module.css'

interface Props {
  filters: CatalogFilters
  onFilterChange: (key: keyof CatalogFilters, value: string) => void
  onClear: () => void
  activeFiltersCount: number
  archetypes: string[]
  archetypesLoading?: boolean
}

export function FilterBar({
  filters,
  onFilterChange,
  onClear,
  activeFiltersCount,
  archetypes,
  archetypesLoading = false,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.bar}>
      <div className={styles.grid}>
        {/* Attribute */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.attribute')}</label>
          <select
            className={styles.select}
            value={filters.attribute}
            onChange={e => onFilterChange('attribute', e.target.value)}
          >
            <option value="">{t('catalog.filters.all')}</option>
            {ATTRIBUTES.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Race */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.race')}</label>
          <select
            className={styles.select}
            value={filters.race}
            onChange={e => onFilterChange('race', e.target.value)}
          >
            <option value="">{t('catalog.filters.all')}</option>
            {ALL_RACES.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.level')}</label>
          <select
            className={styles.select}
            value={filters.level}
            onChange={e => onFilterChange('level', e.target.value)}
          >
            <option value="">{t('catalog.filters.all')}</option>
            {LEVELS.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Archetype */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.archetype')}</label>
          <select
            className={styles.select}
            value={filters.archetype}
            onChange={e => onFilterChange('archetype', e.target.value)}
            disabled={archetypesLoading}
          >
            <option value="">
              {archetypesLoading ? t('catalog.filters.loading') : t('catalog.filters.all')}
            </option>
            {archetypes.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Frame Type */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.frameType')}</label>
          <select
            className={styles.select}
            value={filters.frameType}
            onChange={e => onFilterChange('frameType', e.target.value)}
          >
            <option value="">{t('catalog.filters.all')}</option>
            {FRAME_TYPES.map(ft => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
          {filters.frameType && RARE_FRAME_TYPES.has(filters.frameType) && (
            <span className={styles.filterHint}>{t('catalog.filters.frameTypeHint')}</span>
          )}
        </div>

        {/* ATK */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.atk')}</label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder={t('catalog.filters.atkPlaceholder')}
            maxLength={5}
            value={filters.atk}
            onChange={e => onFilterChange('atk', e.target.value)}
          />
        </div>

        {/* DEF */}
        <div className={styles.field}>
          <label className={styles.label}>{t('catalog.filters.def')}</label>
          <input
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder={t('catalog.filters.defPlaceholder')}
            maxLength={5}
            value={filters.def}
            onChange={e => onFilterChange('def', e.target.value)}
          />
        </div>
      </div>

      {/* Hide Tokens toggle */}
      <div className={styles.toggleRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.hideTokens === 'true'}
            onChange={e => onFilterChange('hideTokens', e.target.checked ? 'true' : '')}
          />
          {t('catalog.filters.hideTokens')}
        </label>
      </div>

      {activeFiltersCount > 0 && (
        <div className={styles.actions}>
          <span className={styles.badge}>
            {t('catalog.filters.activeFilter', { count: activeFiltersCount })}
          </span>
          <button className={styles.clearBtn} onClick={onClear}>
            {t('catalog.filters.clearFilters')}
          </button>
        </div>
      )}
    </div>
  )
}
