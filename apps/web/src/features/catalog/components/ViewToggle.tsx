import { useTranslation } from 'react-i18next'
import styles from './ViewToggle.module.css'

export type ViewMode = 'gallery' | 'list'

interface Props {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.toggle} role="group" aria-label={t('catalog.view.modeAriaLabel')}>
      <button
        className={[styles.btn, view === 'gallery' ? styles.active : ''].join(' ')}
        onClick={() => onViewChange('gallery')}
        aria-pressed={view === 'gallery'}
        title={t('catalog.view.galleryTitle')}
      >
        ⊞
      </button>
      <button
        className={[styles.btn, view === 'list' ? styles.active : ''].join(' ')}
        onClick={() => onViewChange('list')}
        aria-pressed={view === 'list'}
        title={t('catalog.view.listTitle')}
      >
        ☰
      </button>
    </div>
  )
}
