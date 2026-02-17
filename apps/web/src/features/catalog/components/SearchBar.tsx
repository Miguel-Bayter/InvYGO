import { useTranslation } from 'react-i18next'
import styles from './SearchBar.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
  isSearching?: boolean
  placeholder?: string
}

export function SearchBar({ value, onChange, isSearching = false, placeholder }: Props) {
  const { t } = useTranslation()
  const displayPlaceholder = placeholder ?? t('catalog.search.placeholder')

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} aria-hidden>
        {isSearching ? '⟳' : '⌕'}
      </span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={displayPlaceholder}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          className={styles.clear}
          onClick={() => onChange('')}
          aria-label={t('catalog.search.clearLabel')}
        >
          ✕
        </button>
      )}
    </div>
  )
}
