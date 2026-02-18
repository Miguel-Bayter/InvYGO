import { useTranslation } from 'react-i18next'
import type { CardsPagination } from '../types'
import styles from './Pagination.module.css'

interface Props {
  pagination: CardsPagination
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ pagination, onPageChange, disabled = false }: Props) {
  const { t } = useTranslation()
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination

  const from = (currentPage - 1) * itemsPerPage + 1
  const to = Math.min(currentPage * itemsPerPage, totalItems)

  const pages = buildPageRange(currentPage, totalPages)

  return (
    <nav className={styles.nav} aria-label={t('pagination.ariaLabel')}>
      <span className={styles.info}>
        {t('pagination.showing', { from, to, total: totalItems })}
      </span>

      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(1)}
          disabled={disabled || currentPage === 1}
          aria-label={t('pagination.firstPage')}
        >
          «
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          aria-label={t('pagination.prevPage')}
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <button
              key={p}
              className={[styles.btn, p === currentPage ? styles.active : ''].join(' ')}
              onClick={() => onPageChange(p as number)}
              disabled={disabled}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className={styles.btn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          aria-label={t('pagination.nextPage')}
        >
          ›
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          aria-label={t('pagination.lastPage')}
        >
          »
        </button>
      </div>
    </nav>
  )
}

/** Build a page range with ellipsis like: 1 … 4 5 6 … 20 */
function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
}
