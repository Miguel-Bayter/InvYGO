import { useTranslation } from 'react-i18next'
import styles from './LoadingSpinner.module.css'

interface Props {
  label?: string
}

export function LoadingSpinner({ label }: Props) {
  const { t } = useTranslation()
  const displayLabel = label ?? t('ui.loading')

  return (
    <div className={styles.wrapper} role="status" aria-label={displayLabel}>
      <div className={styles.ring} />
      <span className={styles.label}>{displayLabel}</span>
    </div>
  )
}
