import styles from './ViewToggle.module.css'

export type ViewMode = 'gallery' | 'list'

interface Props {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: Props) {
  return (
    <div className={styles.toggle} role="group" aria-label="View mode">
      <button
        className={[styles.btn, view === 'gallery' ? styles.active : ''].join(' ')}
        onClick={() => onViewChange('gallery')}
        aria-pressed={view === 'gallery'}
        title="Gallery view"
      >
        ⊞
      </button>
      <button
        className={[styles.btn, view === 'list' ? styles.active : ''].join(' ')}
        onClick={() => onViewChange('list')}
        aria-pressed={view === 'list'}
        title="List view"
      >
        ☰
      </button>
    </div>
  )
}
